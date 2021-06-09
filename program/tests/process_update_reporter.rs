#![cfg(feature = "test-bpf")]

use solana_program_test::*;

mod program_test;

use program_test::*;

use hapi_core_solana::state::enums::ReporterType;

use program_test::cookies::ReporterCookie;

#[tokio::test]
async fn test_reporter_updated() {
  // Arrange
  let mut hapi_test = HapiProgramTest::start_new().await;
  let reporter_cookie = hapi_test.with_reporter().await;
  let new_reporter_cookie = ReporterCookie {
    address: reporter_cookie.address.clone(),
    account: reporter_cookie.account.clone(),
    reporter_key: reporter_cookie.reporter_key.clone(),
    reporter_type: ReporterType::Inactive,
    name: "Updated".to_string(),
  };

  // Act
  hapi_test
    .update_reporter(&reporter_cookie, &new_reporter_cookie)
    .await
    .unwrap();

  // Assert
  let updated_account = hapi_test
    .get_reporter_account(&reporter_cookie.address)
    .await;

  assert_eq!(new_reporter_cookie.name, updated_account.name);
  assert_eq!(
    new_reporter_cookie.reporter_type,
    updated_account.reporter_type
  );
}
