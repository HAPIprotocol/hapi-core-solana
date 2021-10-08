use hapi_core_solana::state::enums::CaseStatus;

use {
    crate::{tools::assert_is_existing_account, Config},
    colored::*,
    hapi_core_solana::{
        instruction,
        state::{case::get_case_address, community::get_community_address, enums::CategorySet},
    },
    solana_client::rpc_client::RpcClient,
    solana_sdk::{signature::Signer, transaction::Transaction},
};

pub fn cmd_update_case(
    rpc_client: &RpcClient,
    config: &Config,
    community_name: String,
    case_id: u64,
    status: CaseStatus,
    categories: CategorySet,
) -> Result<(), Box<dyn std::error::Error>> {
    if config.verbose {
        println!("{}: {}", "Community".bright_black(), community_name);
    }
    let community_account = get_community_address(&community_name);
    if config.verbose {
        println!(
            "{}: {}",
            "Community account".bright_black(),
            community_account
        );
    }
    let case_account = get_case_address(&community_account, &case_id.to_le_bytes());

    assert_is_existing_account(rpc_client, &case_account)?;

    if config.verbose {
        println!("{}: {}", "Case account".bright_black(), case_account);
    }

    let mut transaction = Transaction::new_with_payer(
        &[instruction::update_case(
            &config.keypair.pubkey(),
            &community_name,
            case_id,
            status,
            &categories,
        )
        .unwrap()],
        Some(&config.keypair.pubkey()),
    );
    let blockhash = rpc_client.get_recent_blockhash()?.0;
    transaction.try_sign(&[&config.keypair], blockhash)?;
    rpc_client.send_and_confirm_transaction_with_spinner(&transaction)?;

    println!("{}: {}", "Case updated".green(), case_account);

    Ok(())
}
