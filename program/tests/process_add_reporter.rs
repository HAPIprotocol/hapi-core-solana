#![cfg(feature = "test-bpf")]

use hapi_core_solana::error::HapiError;
use solana_program_test::*;

pub mod program_test;

use program_test::*;

#[tokio::test]
async fn test_reporter_added() {
  // Arrange
  let mut hapi_test = HapiProgramTest::start_new().await;
  let authority_keypair = hapi_test.create_funded_keypair().await;
  let network_cookie = hapi_test.with_network(&authority_keypair).await;

  // Act
  let reporter_cookie = hapi_test
    .with_reporter(&network_cookie, &authority_keypair)
    .await
    .unwrap();

  // Assert
  let reporter_account = hapi_test
    .get_reporter_account(&reporter_cookie.address)
    .await;

  assert_eq!(reporter_cookie.account, reporter_account);
}

#[tokio::test]
async fn test_reporter_not_added_invalid_authority() {
  // Arrange
  let mut hapi_test = HapiProgramTest::start_new().await;
  let real_authority = hapi_test.create_funded_keypair().await;
  let rando_authority = hapi_test.create_funded_keypair().await;
  let network_cookie = hapi_test.with_network(&real_authority).await;

  // Act
  let err = hapi_test
    .with_reporter(&network_cookie, &rando_authority)
    .await
    .err()
    .unwrap();

  // Assert
  assert_eq!(err, HapiError::InvalidNetworkAuthority.into());
}
