use borsh::BorshDeserialize;
use solana_program::{
    borsh::try_from_slice_unchecked,
    instruction::Instruction,
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack},
    pubkey::Pubkey,
    rent::Rent,
    system_instruction,
};
use std::collections::BTreeSet;

use solana_program_test::ProgramTest;
use solana_program_test::*;

use hapi_core_solana::{
    instruction::{
        add_reporter, create_network, report_address, report_case, update_case, update_reporter,
    },
    processor::process,
    state::address::{get_address_address, Address},
    state::case::{get_case_address, Case},
    state::enums::{Category, HapiAccountType, ReporterType},
    state::network::{get_network_address, Network},
    state::reporter::{get_reporter_address, NetworkReporter},
};
use solana_sdk::{
    account::Account,
    signature::{Keypair, Signer},
    transaction::Transaction,
};

pub mod cookies;
use self::cookies::{AddressCookie, CaseCookie, NetworkCookie, NetworkReporterCookie};

pub mod tools;
use self::tools::map_transaction_error;

pub struct HapiProgramTest {
    pub context: ProgramTestContext,
    pub rent: Rent,
    pub next_network_id: u8,
    pub next_reporter_id: u8,
    pub next_case_id: u8,
}

impl HapiProgramTest {
    pub async fn start_new() -> Self {
        let program_test = ProgramTest::new(
            "hapi_core_solana",
            hapi_core_solana::id(),
            processor!(process),
        );

        let mut context = program_test.start_with_context().await;
        let rent = context.banks_client.get_rent().await.unwrap();

        Self {
            context,
            rent,
            next_network_id: 0,
            next_reporter_id: 0,
            next_case_id: 0,
        }
    }

    pub async fn process_transaction(
        &mut self,
        instructions: &[Instruction],
        signers: Option<&[&Keypair]>,
    ) -> Result<(), ProgramError> {
        let mut transaction =
            Transaction::new_with_payer(&instructions, Some(&self.context.payer.pubkey()));

        let mut all_signers = vec![&self.context.payer];

        if let Some(signers) = signers {
            all_signers.extend_from_slice(signers);
        }

        let recent_blockhash = self
            .context
            .banks_client
            .get_recent_blockhash()
            .await
            .unwrap();

        transaction.sign(&all_signers, recent_blockhash);

        self.context
            .banks_client
            .process_transaction(transaction)
            .await
            .map_err(map_transaction_error)?;

        Ok(())
    }

    #[allow(dead_code)]
    pub async fn create_funded_keypair(&mut self) -> Keypair {
        let keypair = Keypair::new();

        let fund_keypair_ix = system_instruction::transfer(
            &self.context.payer.pubkey(),
            &keypair.pubkey(),
            1000000000,
        );

        self.process_transaction(&[fund_keypair_ix], None)
            .await
            .unwrap();

        keypair
    }

    pub async fn with_network(&mut self, authority: &Keypair) -> NetworkCookie {
        let name = format!("Network #{}", self.next_network_id).to_string();
        self.next_network_id += 1;

        let create_network_ix = create_network(&authority.pubkey(), name.clone());

        self.process_transaction(&[create_network_ix], Some(&[&authority]))
            .await
            .unwrap();

        let account = Network {
            account_type: HapiAccountType::Network,
            authority: authority.pubkey(),
            name: name.clone(),
            next_case_id: 0,
        };

        let network_address = get_network_address(&name);

        NetworkCookie {
            address: network_address,
            name,
            account,
        }
    }

    #[allow(dead_code)]
    pub async fn with_reporter(
        &mut self,
        network_cookie: &NetworkCookie,
        authority: &Keypair,
    ) -> Result<NetworkReporterCookie, ProgramError> {
        let reporter_type = ReporterType::Full;
        let reporter_keypair = Keypair::new();

        let name = format!("NetworkReporter #{}", self.next_reporter_id).to_string();
        self.next_reporter_id += 1;

        let fund_reporter_ix = system_instruction::transfer(
            &self.context.payer.pubkey(),
            &reporter_keypair.pubkey(),
            1000000000,
        );

        let add_reporter_ix = add_reporter(
            &authority.pubkey(),
            &network_cookie.address,
            &reporter_keypair.pubkey(),
            name.clone(),
            reporter_type.clone(),
        );

        self.process_transaction(&[fund_reporter_ix, add_reporter_ix], Some(&[&authority]))
            .await?;

        let account = NetworkReporter {
            account_type: HapiAccountType::NetworkReporter,
            name: name.clone(),
            reporter_type: reporter_type.clone(),
        };

        let reporter_address =
            get_reporter_address(&network_cookie.address, &reporter_keypair.pubkey());

        Ok(NetworkReporterCookie {
            address: reporter_address,
            network_address: network_cookie.address,
            reporter_keypair,
            reporter_type,
            account,
            name,
        })
    }

    #[allow(dead_code)]
    pub async fn with_case(
        &mut self,
        network: &NetworkCookie,
        reporter: &NetworkReporterCookie,
    ) -> CaseCookie {
        let name = format!("Case #{}", self.next_case_id).to_string();
        self.next_case_id += 1;

        let case_id = network.account.next_case_id;

        let case_address = get_case_address(&network.address, &case_id.to_le_bytes());

        let category_set: BTreeSet<Category> = vec![Category::Safe].into_iter().collect();

        let report_case_ix = report_case(
            &reporter.reporter_keypair.pubkey(),
            network.name.clone(),
            case_id,
            name.clone(),
            category_set.clone(),
        );

        self.process_transaction(&[report_case_ix], Some(&[&reporter.reporter_keypair]))
            .await
            .unwrap();

        let mut category_map = Category::new_map();
        for category in category_set.into_iter() {
            category_map.insert(category, true);
        }

        let case = Case {
            account_type: HapiAccountType::Case,
            name: name.clone(),
            reporter_key: reporter.reporter_keypair.pubkey(),
            categories: category_map,
        };

        CaseCookie {
            address: case_address,
            account: case,
            network_account: network.address,
            name,
            id: case_id,
        }
    }

    #[allow(dead_code)]
    pub async fn with_address(
        &mut self,
        network: &NetworkCookie,
        reporter: &NetworkReporterCookie,
        case: &CaseCookie,
        risk: u8,
    ) -> AddressCookie {
        let value = Pubkey::new_unique();
        let category = Category::WalletService;

        let address_address = get_address_address(&network.address, &value);

        let report_address_ix = report_address(
            &reporter.reporter_keypair.pubkey(),
            network.name.clone(),
            case.id,
            &value,
            risk,
            category,
        );

        self.process_transaction(&[report_address_ix], Some(&[&reporter.reporter_keypair]))
            .await
            .unwrap();

        let address = Address {
            account_type: HapiAccountType::Address,
            risk,
            case_id: case.id,
            category,
        };

        AddressCookie {
            address: address_address,
            account: address,
            value,
        }
    }

    #[allow(dead_code)]
    pub async fn get_network_account(&mut self, address: &Pubkey) -> Network {
        self.get_borsh_account::<Network>(address).await
    }

    #[allow(dead_code)]
    pub async fn get_reporter_account(&mut self, address: &Pubkey) -> NetworkReporter {
        self.get_borsh_account::<NetworkReporter>(address).await
    }

    #[allow(dead_code)]
    pub async fn get_case_account(&mut self, address: &Pubkey) -> Case {
        self.get_borsh_account::<Case>(address).await
    }

    #[allow(dead_code)]
    pub async fn get_address_account(&mut self, address: &Pubkey) -> Address {
        self.get_borsh_account::<Address>(address).await
    }

    #[allow(dead_code)]
    async fn get_packed_account<T: Pack + IsInitialized>(&mut self, address: &Pubkey) -> T {
        self.context
            .banks_client
            .get_packed_account_data::<T>(*address)
            .await
            .unwrap()
    }

    pub async fn get_borsh_account<T: BorshDeserialize>(&mut self, address: &Pubkey) -> T {
        self.get_account(address)
            .await
            .map(|a| try_from_slice_unchecked(&a.data).unwrap())
            .unwrap_or_else(|| panic!("GET-TEST-ACCOUNT-ERROR: Account {} not found", address))
    }

    #[allow(dead_code)]
    pub async fn get_account(&mut self, address: &Pubkey) -> Option<Account> {
        self.context
            .banks_client
            .get_account(*address)
            .await
            .unwrap()
    }

    #[allow(dead_code)]
    pub async fn update_reporter(
        &mut self,
        authority: &Keypair,
        network_cookie: &NetworkCookie,
        reporter_cookie: &NetworkReporterCookie,
        updated_reporter: &NetworkReporter,
    ) -> Result<(), ProgramError> {
        let update_reporter_ix = update_reporter(
            &authority.pubkey(),
            &network_cookie.address,
            &reporter_cookie.reporter_keypair.pubkey(),
            updated_reporter.name.clone(),
            updated_reporter.reporter_type.clone(),
        );

        self.process_transaction(&[update_reporter_ix], Some(&[&authority]))
            .await?;

        Ok(())
    }

    #[allow(dead_code)]
    pub async fn update_case(
        &mut self,
        reporter: &Keypair,
        network_cookie: &NetworkCookie,
        case_cookie: &CaseCookie,
        categories: BTreeSet<Category>,
    ) -> Result<(), ProgramError> {
        let update_case_ix = update_case(
            &reporter.pubkey(),
            network_cookie.name.clone(),
            case_cookie.id,
            categories.clone(),
        );

        self.process_transaction(&[update_case_ix], Some(&[&reporter]))
            .await?;

        Ok(())
    }
}
