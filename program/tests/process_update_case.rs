//#![cfg(feature = "test-bpf")]

use {solana_program_test::*, std::collections::BTreeSet};

mod program_test;

use program_test::*;

use hapi_core_solana::state::enums::{Category, CategorySetBitmask};

#[tokio::test]
async fn test_case_reported() {
    // Arrange
    let mut hapi_test = HapiProgramTest::start_new().await;
    let authority_keypair = hapi_test.create_funded_keypair().await;
    let community_cookie = hapi_test.with_community(&authority_keypair).await;
    let network_cookie = hapi_test
        .with_network(&authority_keypair, &community_cookie)
        .await;
    let reporter_cookie = hapi_test
        .with_reporter(&authority_keypair, &community_cookie)
        .await
        .unwrap();

    let case_cookie = hapi_test
        .with_case(&reporter_cookie, &community_cookie, &network_cookie)
        .await;
    let category_set: BTreeSet<Category> = vec![Category::MiningPool, Category::Safe]
        .iter()
        .cloned()
        .collect();

    // Act
    hapi_test
        .update_case(
            &reporter_cookie.reporter_keypair,
            &community_cookie,
            &network_cookie,
            &case_cookie,
            &category_set,
        )
        .await
        .unwrap();

    // Assert
    let updated_account = hapi_test.get_case_account(&case_cookie.address).await;

    assert_eq!(
        Category::MiningPool | Category::Safe,
        updated_account.categories
    );
}

#[tokio::test]
async fn test_case_reported_with_all_categories() {
    // Arrange
    let mut hapi_test = HapiProgramTest::start_new().await;
    let authority_keypair = hapi_test.create_funded_keypair().await;
    let community_cookie = hapi_test.with_community(&authority_keypair).await;
    let network_cookie = hapi_test
        .with_network(&authority_keypair, &community_cookie)
        .await;
    let reporter_cookie = hapi_test
        .with_reporter(&authority_keypair, &community_cookie)
        .await
        .unwrap();
    let case_cookie = hapi_test
        .with_case(&reporter_cookie, &community_cookie, &network_cookie)
        .await;
    let category_set: BTreeSet<Category> = vec![
        Category::Safe,
        Category::WalletService,
        Category::MerchantService,
        Category::MiningPool,
        Category::LowRiskExchange,
        Category::MediumRiskExchange,
        Category::DeFi,
        Category::OTCBroker,
        Category::ATM,
        Category::Gambling,
        Category::IllicitOrganization,
        Category::Mixer,
        Category::DarknetService,
        Category::Scam,
        Category::Ransomware,
        Category::Theft,
        Category::TerroristFinancing,
        Category::Sanctions,
        Category::ChildAbuse,
    ]
    .iter()
    .cloned()
    .collect();

    // Act
    hapi_test
        .update_case(
            &reporter_cookie.reporter_keypair,
            &community_cookie,
            &network_cookie,
            &case_cookie,
            &category_set,
        )
        .await
        .unwrap();

    // Assert
    let updated_account = hapi_test.get_case_account(&case_cookie.address).await;

    assert_eq!(
        Category::Safe
            | Category::WalletService
            | Category::MerchantService
            | Category::MiningPool
            | Category::LowRiskExchange
            | Category::MediumRiskExchange
            | Category::DeFi
            | Category::OTCBroker
            | Category::ATM
            | Category::Gambling
            | Category::IllicitOrganization
            | Category::Mixer
            | Category::DarknetService
            | Category::Scam
            | Category::Ransomware
            | Category::Theft
            | Category::TerroristFinancing
            | Category::Sanctions
            | Category::ChildAbuse,
        updated_account.categories
    );
    assert_eq!(true, updated_account.categories.contains(Category::Mixer));
    assert_eq!(72, std::mem::size_of_val(&updated_account));
}
