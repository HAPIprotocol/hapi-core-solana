//#![cfg(feature = "test-bpf")]

use solana_program_test::*;

mod program_test;

use program_test::*;

use solana_sdk::signature::Signer;

#[tokio::test]
async fn test_community_updated() {
    // Arrange
    let mut hapi_test = HapiProgramTest::start_new().await;
    let authority_keypair = hapi_test.create_funded_keypair().await;
    let community_cookie = hapi_test.with_community(&authority_keypair).await;

    // Act
    hapi_test
        .update_community(&authority_keypair, None, &community_cookie)
        .await
        .unwrap();

    // Assert
    let updated_account = hapi_test
        .get_community_account(&community_cookie.address)
        .await;

    assert_eq!(
        authority_keypair.pubkey(),
        updated_account.authority,
        "Community authority should be updated"
    );
}
