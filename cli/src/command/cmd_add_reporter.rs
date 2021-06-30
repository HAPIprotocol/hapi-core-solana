use {
    crate::{
        tools::{assert_is_empty_account, assert_is_existing_account},
        Config,
    },
    colored::*,
    hapi_core_solana::{
        instruction,
        state::{
            enums::ReporterType,
            network::{get_network_address, Network},
            reporter::get_reporter_address,
        },
    },
    solana_client::rpc_client::RpcClient,
    solana_program::borsh::try_from_slice_unchecked,
    solana_sdk::{pubkey::Pubkey, signature::Signer, transaction::Transaction},
};

pub fn cmd_add_reporter(
    rpc_client: &RpcClient,
    config: &Config,
    network_name: String,
    reporter_pubkey: &Pubkey,
    name: String,
    reporter_type: ReporterType,
) -> Result<(), Box<dyn std::error::Error>> {
    let network_account = &get_network_address(&network_name);
    let network_data = rpc_client.get_account_data(&network_account)?;
    let network: Network = try_from_slice_unchecked(&network_data)?;

    if config.verbose {
        println!("{}: {}", "Network".bright_black(), network.name);
    }

    assert_is_existing_account(rpc_client, &reporter_pubkey)?;

    let reporter_address = get_reporter_address(network_account, reporter_pubkey);

    assert_is_empty_account(rpc_client, &reporter_address)?;

    let mut transaction = Transaction::new_with_payer(
        &[instruction::add_reporter(
            &config.keypair.pubkey(),
            network_account,
            reporter_pubkey,
            name,
            reporter_type,
        )],
        Some(&config.keypair.pubkey()),
    );
    let blockhash = rpc_client.get_recent_blockhash()?.0;
    transaction.try_sign(&[&config.keypair], blockhash)?;
    rpc_client.send_and_confirm_transaction_with_spinner(&transaction)?;

    println!("{}: {}", "Reporter added".green(), reporter_address);

    Ok(())
}
