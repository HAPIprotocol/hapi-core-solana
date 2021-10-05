//#![cfg(feature = "test-bpf")]

use solana_program_test::*;

mod program_test;

use program_test::*;

#[tokio::test]
async fn test_case_reported() {
    // Arrange
    let mut hapi_test = HapiProgramTest::start_new().await;
    let authority_keypair = hapi_test.create_funded_keypair().await;
    let community_cookie = hapi_test.with_community(&authority_keypair).await;
    let reporter_cookie = hapi_test
        .with_reporter(&authority_keypair, &community_cookie)
        .await
        .unwrap();

    // Act
    let case_cookie = hapi_test
        .with_case(&reporter_cookie, &community_cookie)
        .await;

    // Assert
    let case_account = hapi_test.get_case_account(&case_cookie.address).await;
    assert_eq!(case_cookie.account, case_account, "Case account must match expectations");
    let community_account = hapi_test.get_community_account(&community_cookie.address).await;
    assert_eq!(community_account.next_case_id, 1, "Next case ID should be incremented");
}
