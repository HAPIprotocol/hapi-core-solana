use {
    crate::{tools::assert_is_existing_account, Config},
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
    solana_sdk::{
        borsh::try_from_slice_unchecked, pubkey::Pubkey, signature::Signer,
        transaction::Transaction,
    },
};

pub fn cmd_update_reporter(
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

    let reporter_account = get_reporter_address(network_account, reporter_pubkey);

    if config.verbose {
        println!(
            "{}: {}",
            "Reporter account".bright_black(),
            reporter_account
        );
    }

    assert_is_existing_account(rpc_client, &reporter_account)?;

    let mut transaction = Transaction::new_with_payer(
        &[instruction::update_reporter(
            &config.keypair.pubkey(),
            network_account,
            &reporter_account,
            name,
            reporter_type,
        )],
        Some(&config.keypair.pubkey()),
    );
    let blockhash = rpc_client.get_recent_blockhash()?.0;
    transaction.try_sign(&[&config.keypair], blockhash)?;
    rpc_client.send_and_confirm_transaction_with_spinner(&transaction)?;

    println!("{} {}", "Reporter updated:".green(), reporter_account);

    Ok(())
}
