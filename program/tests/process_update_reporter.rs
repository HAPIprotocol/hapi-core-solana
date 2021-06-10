#![cfg(feature = "test-bpf")]

use solana_program_test::*;
use solana_sdk::signature::Keypair;

mod program_test;

use program_test::*;

use hapi_core_solana::state::{
  enums::{HapiAccountType, ReporterType},
  reporter::Reporter,
};

#[tokio::test]
async fn test_reporter_updated() {
  // Arrange
  let mut hapi_test = HapiProgramTest::start_new().await;
  let reporter_keypair = Keypair::new();
  let reporter_cookie = hapi_test.with_reporter(reporter_keypair).await;

  let reporter = Reporter {
    account_type: HapiAccountType::Reporter,
    reporter_type: ReporterType::Inactive,
    name: "Updated".to_string(),
  };

  // Act
  hapi_test
    .update_reporter(&reporter_cookie, &reporter)
    .await
    .unwrap();

  // Assert
  let updated_account = hapi_test
    .get_reporter_account(&reporter_cookie.address)
    .await;

  assert_eq!(reporter.name, updated_account.name);
  assert_eq!(
    reporter.reporter_type,
    updated_account.reporter_type
  );
}
