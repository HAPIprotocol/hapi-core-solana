//#![cfg(feature = "test-bpf")]

use solana_program_test::*;

mod program_test;

use program_test::*;

#[tokio::test]
async fn test_network_created() {
    // Arrange
    let mut hapi_test = HapiProgramTest::start_new().await;
    let authority_keypair = hapi_test.create_funded_keypair().await;
    
    // Act
    let community_cookie = hapi_test.with_community(&authority_keypair).await;

    // Assert
    let community_account = hapi_test.get_community_account(&community_cookie.address).await;

    assert_eq!(community_cookie.account, community_account, "Community account must match expectations");

    assert_eq!(72, std::mem::size_of_val(&community_account), "Account size must be correct");
}
