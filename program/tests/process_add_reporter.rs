#![cfg(feature = "test-bpf")]

use solana_program_test::*;

mod program_test;

use program_test::*;

#[tokio::test]
async fn test_reporter_added() {
  // Arrange
  let mut hapi_test = HapiProgramTest::start_new().await;

  // Act
  let reporter_cookie = hapi_test.with_reporter().await;

  // Assert
  let reporter_account = hapi_test
    .get_reporter_account(&reporter_cookie.address)
    .await;

  assert_eq!(reporter_cookie.account, reporter_account);
}
