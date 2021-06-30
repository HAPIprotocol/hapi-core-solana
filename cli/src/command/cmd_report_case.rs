use {
    crate::{tools::assert_is_empty_account, Config},
    colored::*,
    hapi_core_solana::{
        instruction,
        state::{
            case::get_case_address,
            enums::Category,
            network::{get_network_address, Network},
        },
    },
    solana_client::rpc_client::RpcClient,
    solana_sdk::{borsh::try_from_slice_unchecked, signature::Signer, transaction::Transaction},
    std::collections::BTreeSet,
};

pub fn cmd_report_case(
    rpc_client: &RpcClient,
    config: &Config,
    network_name: String,
    case_name: String,
    categories: BTreeSet<Category>,
) -> Result<(), Box<dyn std::error::Error>> {
    let network_account = &get_network_address(&network_name);
    let network_data = rpc_client.get_account_data(&network_account)?;
    let network: Network = try_from_slice_unchecked(&network_data)?;
    if config.verbose {
        println!("{}: {}", "Network".bright_black(), network.name);
        println!("{}: {}", "New case ID".bright_black(), network.next_case_id);
    }

    let case_address = get_case_address(&network_account, &network.next_case_id.to_le_bytes());

    assert_is_empty_account(rpc_client, &case_address)?;

    let mut transaction = Transaction::new_with_payer(
        &[instruction::report_case(
            &config.keypair.pubkey(),
            network_name,
            network.next_case_id,
            case_name,
            categories,
        )],
        Some(&config.keypair.pubkey()),
    );
    let blockhash = rpc_client.get_recent_blockhash()?.0;
    transaction.try_sign(&[&config.keypair], blockhash)?;
    rpc_client.send_and_confirm_transaction_with_spinner(&transaction)?;

    println!("{}: {}", "Case reported".green(), case_address);

    Ok(())
}
