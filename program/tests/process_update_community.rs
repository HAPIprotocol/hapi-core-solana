//#![cfg(feature = "test-bpf")]

use solana_program_test::*;

mod program_test;

use program_test::*;

use hapi_core_solana::state::{community::Community, enums::HapiAccountType};

use solana_sdk::signature::Signer;

#[tokio::test]
async fn test_community_updated() {
    // Arrange
    let mut hapi_test = HapiProgramTest::start_new().await;
    let authority_keypair = hapi_test.create_funded_keypair().await;
    let community_cookie = hapi_test.with_community(&authority_keypair).await;

    let community = Community {
        account_type: HapiAccountType::Community,
        name: "Updated".to_string(),
        authority: authority_keypair.pubkey(),
        next_case_id: community_cookie.account.next_case_id,
    };

    // Act
    hapi_test
        .update_community(&authority_keypair, None, &community_cookie, &community)
        .await
        .unwrap();

    // Assert
    let updated_account = hapi_test
        .get_community_account(&community_cookie.address)
        .await;

    assert_eq!(
        community.name, updated_account.name,
        "Community name should be correct"
    );
}
