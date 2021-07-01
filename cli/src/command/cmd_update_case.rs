use {
    crate::{tools::assert_is_existing_account, Config},
    colored::*,
    hapi_core_solana::{
        instruction,
        state::{case::get_case_address, enums::Category, network::get_network_address},
    },
    solana_client::rpc_client::RpcClient,
    solana_sdk::{signature::Signer, transaction::Transaction},
    std::collections::BTreeSet,
};

pub fn cmd_update_case(
    rpc_client: &RpcClient,
    config: &Config,
    network_name: String,
    case_id: u64,
    categories: BTreeSet<Category>,
) -> Result<(), Box<dyn std::error::Error>> {
    if config.verbose {
        println!("{}: {}", "Network".bright_black(), network_name);
    }
    let network_account = get_network_address(&network_name);
    if config.verbose {
        println!("{}: {}", "Network account".bright_black(), network_account);
    }
    let case_account = get_case_address(&network_account, &case_id.to_le_bytes());

    assert_is_existing_account(rpc_client, &case_account)?;

    if config.verbose {
        println!("{}: {}", "Case account".bright_black(), case_account);
    }

    let mut transaction = Transaction::new_with_payer(
        &[instruction::update_case(
            &config.keypair.pubkey(),
            network_name,
            case_id,
            categories,
        )],
        Some(&config.keypair.pubkey()),
    );
    let blockhash = rpc_client.get_recent_blockhash()?.0;
    transaction.try_sign(&[&config.keypair], blockhash)?;
    rpc_client.send_and_confirm_transaction_with_spinner(&transaction)?;

    println!("{}: {}", "Case updated".green(), case_account);

    Ok(())
}