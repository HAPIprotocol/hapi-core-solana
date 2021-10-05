//#![cfg(feature = "test-bpf")]

use {hapi_core_solana::error::HapiError, solana_program_test::*};

pub mod program_test;
use program_test::*;

#[tokio::test]
async fn test_reporter_added() {
    // Arrange
    let mut hapi_test = HapiProgramTest::start_new().await;
    let authority_keypair = hapi_test.create_funded_keypair().await;
    let community_cookie = hapi_test.with_community(&authority_keypair).await;

    // Act
    let reporter_cookie = hapi_test
        .with_reporter(&authority_keypair, &community_cookie)
        .await
        .unwrap();

    // Assert
    let reporter_account = hapi_test
        .get_reporter_account(&reporter_cookie.address)
        .await;

    assert_eq!(reporter_cookie.account, reporter_account, "Reporter account must match expectations");
}

#[tokio::test]
async fn test_reporter_not_added_invalid_authority() {
    // Arrange
    let mut hapi_test = HapiProgramTest::start_new().await;
    let real_authority = hapi_test.create_funded_keypair().await;
    let rando_authority = hapi_test.create_funded_keypair().await;
    let community_cookie = hapi_test.with_community(&real_authority).await;

    // Act
    let err = hapi_test
        .with_reporter(&rando_authority, &community_cookie)
        .await
        .err()
        .unwrap();

    // Assert
    assert_eq!(err, HapiError::InvalidNetworkAuthority.into(), "Authority must be invalid");
}
