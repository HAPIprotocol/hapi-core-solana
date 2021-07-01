use {
    crate::{tools::*, Config},
    colored::*,
    hapi_core_solana::{
        instruction,
        state::{
            address::get_address_address, case::get_case_address, enums::Category,
            network::get_network_address,
        },
    },
    solana_client::rpc_client::RpcClient,
    solana_sdk::{pubkey::Pubkey, signature::Signer, transaction::Transaction},
};

pub fn cmd_report_address(
    rpc_client: &RpcClient,
    config: &Config,
    network_name: String,
    case_id: u64,
    address: &Pubkey,
    risk: u8,
    category: Category,
) -> Result<(), Box<dyn std::error::Error>> {
    let network_account = &get_network_address(&network_name);

    assert_is_existing_account(rpc_client, &network_account)?;

    if config.verbose {
        println!("{}: {}", "Network".bright_black(), network_name);
    }

    let case_address = get_case_address(&network_account, &case_id.to_le_bytes());

    assert_is_existing_account(rpc_client, &case_address)?;

    let address_address = get_address_address(&network_account, address);

    assert_is_empty_account(rpc_client, &address_address)?;

    let mut transaction = Transaction::new_with_payer(
        &[instruction::report_address(
            &config.keypair.pubkey(),
            network_name,
            case_id,
            address,
            risk,
            category,
        )],
        Some(&config.keypair.pubkey()),
    );
    let blockhash = rpc_client.get_recent_blockhash()?.0;
    transaction.try_sign(&[&config.keypair], blockhash)?;
    rpc_client.send_and_confirm_transaction_with_spinner(&transaction)?;

    println!("{}: {}", "Address reported".green(), address_address);

    Ok(())
}