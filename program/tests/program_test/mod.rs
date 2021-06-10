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

use solana_program_test::ProgramTest;
use solana_program_test::*;

use hapi_core_solana::{
  instruction::{add_reporter, create_network, report_event, update_reporter},
  processor::process,
  state::enums::{HapiAccountType, ReporterType},
  state::event::{get_event_address, Event},
  state::network::{get_network_address, Network},
  state::reporter::{get_reporter_address, Reporter},
};
use solana_sdk::{
  account::Account,
  signature::{Keypair, Signer},
  transaction::Transaction,
};

pub mod cookies;

use self::cookies::{EventCookie, NetworkCookie, ReporterCookie};

pub mod tools;
use self::tools::map_transaction_error;

pub struct HapiProgramTest {
  pub context: ProgramTestContext,
  pub rent: Rent,
  pub next_network_id: u8,
  pub next_reporter_id: u8,
  pub next_event_id: u8,
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
      next_event_id: 0,
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

    self
      .context
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

    let create_network_ix = create_network(&self.context.payer.pubkey(), name.clone());

    self
      .process_transaction(&[create_network_ix], None)
      .await
      .unwrap();

    let account = Network {
      account_type: HapiAccountType::Network,
      authority: self.context.payer.pubkey(),
      name: name.clone(),
      next_event_id: 0,
    };

    NetworkCookie {
      address: network_address,
      name,
      account,
    }
  }

  #[allow(dead_code)]
  pub async fn with_reporter(&mut self, reporter_keypair: Keypair) -> ReporterCookie {
    let reporter_type = ReporterType::Tracer;

    let name = format!("Reporter #{}", self.next_reporter_id).to_string();
    self.next_reporter_id = self.next_reporter_id + 1;

    let reporter_address = get_reporter_address(&reporter_keypair.pubkey());

    let fund_reporter_ix = system_instruction::transfer(
      &self.context.payer.pubkey(),
      &reporter_keypair.pubkey(),
      1000000000,
    );

    let add_reporter_ix = add_reporter(
      &self.context.payer.pubkey(),
      &reporter_keypair.pubkey(),
      name.clone(),
      reporter_type.clone(),
    );

    self
      .process_transaction(&[fund_reporter_ix, add_reporter_ix], None)
      .await
      .unwrap();

    let account = Reporter {
      account_type: HapiAccountType::Reporter,
      name: name.clone(),
      reporter_type: reporter_type.clone(),
    };

    ReporterCookie {
      address: reporter_address,
      reporter_keypair,
      reporter_type,
      account,
      name,
    }
  }

  #[allow(dead_code)]
  pub async fn with_event(
    &mut self,
    reporter: &ReporterCookie,
    network: &NetworkCookie,
  ) -> EventCookie {
    let name = format!("Event #{}", self.next_event_id).to_string();
    self.next_event_id = self.next_event_id + 1;

    let event_id = network.account.next_event_id;

    let event_address = get_event_address(&network.address, &event_id.to_le_bytes());

    let report_event_ix = report_event(
      &reporter.reporter_keypair.pubkey(),
      network.name.clone(),
      event_id,
      name.clone(),
    );

    self
      .process_transaction(&[report_event_ix], Some(&[&reporter.reporter_keypair]))
      .await
      .unwrap();

    let event = Event {
      account_type: HapiAccountType::Event,
      name: name.clone(),
      reporter_key: reporter.reporter_keypair.pubkey(),
    };

    EventCookie {
      address: event_address,
      account: event,
      network_account: network.address,
      name,
    }
  }

  #[allow(dead_code)]
  pub async fn get_network_account(&mut self, address: &Pubkey) -> Network {
    self.get_borsh_account::<Network>(address).await
  }

  #[allow(dead_code)]
  pub async fn get_reporter_account(&mut self, address: &Pubkey) -> Reporter {
    self.get_borsh_account::<Reporter>(address).await
  }

  #[allow(dead_code)]
  pub async fn get_event_account(&mut self, address: &Pubkey) -> Event {
    self.get_borsh_account::<Event>(address).await
  }

  #[allow(dead_code)]
  async fn get_packed_account<T: Pack + IsInitialized>(&mut self, address: &Pubkey) -> T {
    self
      .context
      .banks_client
      .get_packed_account_data::<T>(*address)
      .await
      .unwrap()
  }

  pub async fn get_borsh_account<T: BorshDeserialize>(&mut self, address: &Pubkey) -> T {
    self
      .get_account(address)
      .await
      .map(|a| try_from_slice_unchecked(&a.data).unwrap())
      .expect(format!("GET-TEST-ACCOUNT-ERROR: Account {} not found", address).as_str())
  }

  #[allow(dead_code)]
  pub async fn get_account(&mut self, address: &Pubkey) -> Option<Account> {
    self
      .context
      .banks_client
      .get_account(*address)
      .await
      .unwrap()
  }

  #[allow(dead_code)]
  pub async fn update_reporter(
    &mut self,
    reporter_cookie: &ReporterCookie,
    updated_reporter: &Reporter,
  ) -> Result<(), ProgramError> {
    let update_reporter_ix = update_reporter(
      &self.context.payer.pubkey(),
      &reporter_cookie.reporter_keypair.pubkey(),
      updated_reporter.name.clone(),
      updated_reporter.reporter_type.clone(),
    );

    self
      .process_transaction(&[update_reporter_ix], None)
      .await?;

    Ok(())
  }
}
