use borsh::BorshDeserialize;
use solana_program::{
    borsh::try_from_slice_unchecked,
    instruction::Instruction,
    program_error::ProgramError,
    program_pack::{IsInitialized, Pack},
    pubkey::Pubkey,
    rent::Rent,
};

use solana_program_test::ProgramTest;
use solana_program_test::*;

use hapi_core_solana::{
    instruction::create_network,
    processor::process,
    state::enums::HapiAccountType,
    state::network::{get_network_address, Network},
};
use solana_sdk::{
    account::Account,
    signature::{Keypair, Signer},
    transaction::Transaction,
};

pub mod cookies;

use self::{cookies::NetworkCookie};

pub mod tools;
use self::tools::map_transaction_error;

pub struct HapiProgramTest {
    pub context: ProgramTestContext,
    pub rent: Rent,
    pub next_network_id: u8,
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
    pub async fn with_network(&mut self) -> NetworkCookie {
        let name = format!("Network #{}", self.next_network_id).to_string();
        self.next_network_id = self.next_network_id + 1;

        let network_address = get_network_address(&name);

        let create_network_instruction = create_network(&self.context.payer.pubkey(), name.clone());

        self.process_transaction(&[create_network_instruction], None)
            .await
            .unwrap();

        let account = Network {
            account_type: HapiAccountType::Network,
            name,
        };

        NetworkCookie {
            address: network_address,
            account,
        }
    }

    // #[allow(dead_code)]
    // pub async fn with_realm_using_mints(&mut self, realm_cookie: &RealmCookie) -> RealmCookie {
    //     let name = format!("Realm #{}", self.next_realm_id).to_string();
    //     self.next_realm_id = self.next_realm_id + 1;

    //     let realm_address = get_realm_address(&name);
    //     let council_mint = realm_cookie.account.council_mint.unwrap();

    //     let create_realm_instruction = create_realm(
    //         &realm_cookie.account.community_mint,
    //         &self.context.payer.pubkey(),
    //         Some(council_mint),
    //         name.clone(),
    //     );

    //     self.process_transaction(&[create_realm_instruction], None)
    //         .await
    //         .unwrap();

    //     let account = Realm {
    //         account_type: GovernanceAccountType::Realm,
    //         community_mint: realm_cookie.account.community_mint,
    //         council_mint: Some(council_mint),
    //         name,
    //     };

    //     let community_token_holding_address = get_governing_token_holding_address(
    //         &realm_address,
    //         &realm_cookie.account.community_mint,
    //     );

    //     let council_token_holding_address =
    //         get_governing_token_holding_address(&realm_address, &council_mint);

    //     RealmCookie {
    //         address: realm_address,
    //         account,

    //         community_mint_authority: clone_keypair(&realm_cookie.community_mint_authority),
    //         community_token_holding_account: community_token_holding_address,

    //         council_token_holding_account: Some(council_token_holding_address),
    //         council_mint_authority: Some(clone_keypair(
    //             &realm_cookie.council_mint_authority.as_ref().unwrap(),
    //         )),
    //     }
    // }

    #[allow(dead_code)]
    pub async fn get_network_account(&mut self, root_governance_address: &Pubkey) -> Network {
        self.get_borsh_account::<Network>(root_governance_address)
            .await
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
            .expect(format!("GET-TEST-ACCOUNT-ERROR: Account {} not found", address).as_str())
    }

    #[allow(dead_code)]
    pub async fn get_account(&mut self, address: &Pubkey) -> Option<Account> {
        self.context
            .banks_client
            .get_account(*address)
            .await
            .unwrap()
    }
}
