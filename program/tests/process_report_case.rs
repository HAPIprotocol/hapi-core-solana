//#![cfg(feature = "test-bpf")]

use solana_program_test::*;

mod program_test;

use program_test::*;

#[tokio::test]
async fn test_case_reported() {
    // Arrange
    let mut hapi_test = HapiProgramTest::start_new().await;
    let authority_keypair = hapi_test.create_funded_keypair().await;
    let network_cookie = hapi_test.with_network(&authority_keypair).await;
    let reporter_cookie = hapi_test
        .with_reporter(&network_cookie, &authority_keypair)
        .await
        .unwrap();

    // Act
    let case_cookie = hapi_test.with_case(&network_cookie, &reporter_cookie).await;

    // Assert
    let case_account = hapi_test.get_case_account(&case_cookie.address).await;
    assert_eq!(case_cookie.account, case_account);
    let network_account = hapi_test.get_network_account(&network_cookie.address).await;
    assert_eq!(network_account.next_case_id, 1); // case id incremented
}