use {
    crate::{
        tools::{assert_is_empty_account, assert_is_existing_account},
        Config,
    },
    colored::*,
    hapi_core_solana::{
        instruction, state::community::get_community_address, state::network::get_network_address,
    },
    solana_client::rpc_client::RpcClient,
    solana_sdk::{signature::Signer, transaction::Transaction},
};

pub fn cmd_create_network(
    rpc_client: &RpcClient,
    config: &Config,
    community_name: String,
    network_name: String,
) -> Result<(), Box<dyn std::error::Error>> {
    if config.verbose {
        println!("{}: {}", "Network".bright_black(), network_name.bold());
    }

    let community_account = get_community_address(&community_name);
    let network_account = get_network_address(&community_account, &network_name);

    assert_is_existing_account(rpc_client, &community_account)?;
    assert_is_empty_account(rpc_client, &network_account)?;

    let mut transaction = Transaction::new_with_payer(
        &[instruction::create_network(
            &config.keypair.pubkey(),
            &format!("{}/{}", &community_name, &network_name),
        )
        .unwrap()],
        Some(&config.keypair.pubkey()),
    );
    let blockhash = rpc_client.get_recent_blockhash()?.0;
    transaction.try_sign(&[&config.keypair], blockhash)?;
    rpc_client.send_and_confirm_transaction_with_spinner(&transaction)?;

    println!("{}: {}", "Network created".green(), network_account);

    Ok(())
}
