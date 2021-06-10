#![cfg(feature = "test-bpf")]

use solana_program_test::*;
use solana_sdk::signature::Keypair;

mod program_test;

use program_test::*;

#[tokio::test]
async fn test_reporter_added() {
  // Arrange
  let mut hapi_test = HapiProgramTest::start_new().await;
  let reporter_keypair = Keypair::new();

  // Act
  let reporter_cookie = hapi_test.with_reporter(reporter_keypair).await;

  // Assert
  let reporter_account = hapi_test
    .get_reporter_account(&reporter_cookie.address)
    .await;

  assert_eq!(reporter_cookie.account, reporter_account);
}

#[tokio::test]
async fn test_reporter_not_added_invalid_authority() {
  // TODO: make sure that reporter can only be added by authority
}
