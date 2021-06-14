#![cfg(feature = "test-bpf")]

use solana_program_test::*;

mod program_test;

use program_test::*;

use hapi_core_solana::state::{
  enums::{HapiAccountType, ReporterType},
  reporter::NetworkReporter,
};

#[tokio::test]
async fn test_reporter_updated() {
  // Arrange
  let mut hapi_test = HapiProgramTest::start_new().await;
  let authority_keypair = hapi_test.create_funded_keypair().await;
  let network_cookie = hapi_test.with_network(&authority_keypair).await;
  let reporter_cookie = hapi_test
    .with_reporter(&network_cookie, &authority_keypair)
    .await
    .unwrap();

  let reporter = NetworkReporter {
    account_type: HapiAccountType::NetworkReporter,
    reporter_type: ReporterType::Inactive,
    name: "Updated".to_string(),
  };

  // Act
  hapi_test
    .update_reporter(&authority_keypair, &network_cookie, &reporter_cookie, &reporter)
    .await
    .unwrap();

  // Assert
  let updated_account = hapi_test
    .get_reporter_account(&reporter_cookie.address)
    .await;

  assert_eq!(reporter.name, updated_account.name);
  assert_eq!(reporter.reporter_type, updated_account.reporter_type);
}
