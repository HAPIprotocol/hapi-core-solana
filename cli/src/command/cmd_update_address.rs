use {
    crate::{tools::*, Config},
    colored::*,
    hapi_core_solana::{
        instruction,
        state::{
            address::get_address_address, case::get_case_address, community::get_community_address,
            enums::Category, network::get_network_address,
        },
    },
    solana_client::rpc_client::RpcClient,
    solana_sdk::{pubkey::Pubkey, signature::Signer, transaction::Transaction},
};

pub fn cmd_update_address(
    rpc_client: &RpcClient,
    config: &Config,
    community_name: String,
    network_name: String,
    address: &Pubkey,
    case_id: u64,
    risk: u8,
    category: Category,
) -> Result<(), Box<dyn std::error::Error>> {
    let community_account = get_community_address(&community_name);
    let network_account = &get_network_address(&community_account, &network_name);
    assert_is_existing_account(rpc_client, &network_account)?;
    if config.verbose {
        println!("{}: {}", "Network".bright_black(), network_name);
    }

    let case_account = get_case_address(&network_account, &case_id.to_le_bytes());
    assert_is_existing_account(rpc_client, &case_account)?;
    if config.verbose {
        println!("{}: {}", "Case account".bright_black(), case_account);
    }

    let address_account = get_address_address(&network_account, address);
    assert_is_existing_account(rpc_client, &address_account)?;

    let mut transaction = Transaction::new_with_payer(
        &[instruction::update_address(
            &config.keypair.pubkey(),
            &format!("{}/{}", &community_name, &network_name),
            address,
            case_id,
            risk,
            category,
        )
        .unwrap()],
        Some(&config.keypair.pubkey()),
    );
    let blockhash = rpc_client.get_recent_blockhash()?.0;
    transaction.try_sign(&[&config.keypair], blockhash)?;
    rpc_client.send_and_confirm_transaction_with_spinner(&transaction)?;

    println!("{}: {}", "Address updated".green(), address_account);

    Ok(())
}
