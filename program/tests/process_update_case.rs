//#![cfg(feature = "test-bpf")]

use solana_program_test::*;

mod program_test;

use program_test::*;

use hapi_core_solana::state::enums::{Category, CategorySet};

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

    let case_cookie = hapi_test
        .with_case(&reporter_cookie, &community_cookie)
        .await;
    let categories: CategorySet = Category::MiningPool | Category::Safe;

    // Act
    hapi_test
        .update_case(
            &reporter_cookie.reporter_keypair,
            &community_cookie,
            &case_cookie,
            &categories,
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
    let reporter_cookie = hapi_test
        .with_reporter(&authority_keypair, &community_cookie)
        .await
        .unwrap();
    let case_cookie = hapi_test
        .with_case(&reporter_cookie, &community_cookie)
        .await;
    let categories: CategorySet = Category::Safe
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
        | Category::Counterfeit
        | Category::TerroristFinancing
        | Category::Sanctions
        | Category::ChildAbuse;

    // Act
    hapi_test
        .update_case(
            &reporter_cookie.reporter_keypair,
            &community_cookie,
            &case_cookie,
            &categories,
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
            | Category::Counterfeit
            | Category::TerroristFinancing
            | Category::Sanctions
            | Category::ChildAbuse,
        updated_account.categories
    );
    assert!(Category::Mixer as u32 & updated_account.categories != 0, "Mixer category should be present");

    assert_eq!(64, std::mem::size_of_val(&updated_account), "Account size must be correct");
}
