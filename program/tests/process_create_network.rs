//#![cfg(feature = "test-bpf")]

use solana_program_test::*;

mod program_test;

use program_test::*;

#[tokio::test]
async fn test_network_created() {
    // Arrange
    let mut hapi_test = HapiProgramTest::start_new().await;
    let authority_keypair = hapi_test.create_funded_keypair().await;
    let community_cookie = hapi_test.with_community(&authority_keypair).await;

    // Act
    let network_cookie = hapi_test
        .with_network(&authority_keypair, &community_cookie)
        .await;

    // Assert
    let network_account = hapi_test.get_network_account(&network_cookie.address).await;

    assert_eq!(network_cookie.account, network_account, "Network account must match expectations");
}
