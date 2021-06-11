#![cfg(feature = "test-bpf")]

use solana_program_test::*;

mod program_test;

use program_test::*;

#[tokio::test]
async fn test_event_reported() {
  // Arrange
  let mut hapi_test = HapiProgramTest::start_new().await;
  let authority_keypair = hapi_test.create_funded_keypair().await;
  let network_cookie = hapi_test.with_network(&authority_keypair).await;
  let reporter_cookie = hapi_test.with_reporter(&network_cookie, &authority_keypair).await.unwrap();

  // Act
  let event_cookie = hapi_test
    .with_event(&reporter_cookie, &network_cookie)
    .await;

  // Assert
  let event_account = hapi_test.get_event_account(&event_cookie.address).await;
  assert_eq!(event_cookie.account, event_account);
  let network_account = hapi_test.get_network_account(&network_cookie.address).await;
  assert_eq!(network_account.next_event_id, 1); // event id incremented
}
