//#![cfg(feature = "test-bpf")]

use solana_program_test::*;

mod program_test;

use program_test::*;

use hapi_core_solana::error::HapiError;

#[tokio::test]
async fn test_network_updated() {
    // Arrange
    let mut hapi_test = HapiProgramTest::start_new().await;
    let authority_keypair = hapi_test.create_funded_keypair().await;
    let community_cookie = hapi_test.with_community(&authority_keypair).await;
    let network_cookie = hapi_test
        .with_network(&authority_keypair, &community_cookie)
        .await;

    // Act
    let err = hapi_test
        .update_network(&authority_keypair, &community_cookie, &network_cookie)
        .await
        .unwrap_err();

    // Assert
    assert_eq!(err, HapiError::NotImplemented.into());

    let updated_account = hapi_test.get_network_account(&network_cookie.address).await;

    assert_eq!(
        network_cookie.account, updated_account,
        "Network should be correct"
    );
}
