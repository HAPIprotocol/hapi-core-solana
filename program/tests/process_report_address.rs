//#![cfg(feature = "test-bpf")]

use solana_program_test::*;

mod program_test;

use program_test::*;

#[tokio::test]
async fn test_address_reported() {
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
        .with_case(&reporter_cookie, &community_cookie)
        .await;

    // Act
    let address_cookie = hapi_test
        .with_address(
            &reporter_cookie,
            &community_cookie,
            &network_cookie,
            &case_cookie,
            5,
        )
        .await;

    // Assert
    let address_account = hapi_test.get_address_account(&address_cookie.address).await;
    assert_eq!(
        address_cookie.account, address_account,
        "Address account must match expectations"
    );

    assert_eq!(
        24,
        std::mem::size_of_val(&address_account),
        "Unpacked account size must be correct"
    );
}
