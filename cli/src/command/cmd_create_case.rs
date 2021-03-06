use hapi_core_solana::state::enums::CaseStatus;

use {
    crate::{tools::assert_is_empty_account, Config},
    colored::*,
    hapi_core_solana::{
        instruction,
        state::{
            case::get_case_address,
            community::{get_community_address, Community},
            enums::CategorySet,
        },
    },
    solana_client::rpc_client::RpcClient,
    solana_sdk::{borsh::try_from_slice_unchecked, signature::Signer, transaction::Transaction},
};

pub fn cmd_create_case(
    rpc_client: &RpcClient,
    config: &Config,
    community_name: String,
    case_name: String,
    status: CaseStatus,
    categories: CategorySet,
) -> Result<(), Box<dyn std::error::Error>> {
    let community_account = get_community_address(&community_name);
    let community_data = rpc_client.get_account_data(&community_account)?;
    let community: Community = try_from_slice_unchecked(&community_data)?;
    if config.verbose {
        println!("{}: {}", "Community".bright_black(), community.name);
        println!(
            "{}: {}",
            "New case ID".bright_black(),
            community.next_case_id
        );
    }

    let case_address = get_case_address(&community_account, &community.next_case_id.to_le_bytes());

    assert_is_empty_account(rpc_client, &case_address)?;

    let mut transaction = Transaction::new_with_payer(
        &[instruction::create_case(
            &config.keypair.pubkey(),
            &community_name,
            community.next_case_id,
            &case_name,
            status,
            &categories,
        )
        .unwrap()],
        Some(&config.keypair.pubkey()),
    );
    let blockhash = rpc_client.get_recent_blockhash()?.0;
    transaction.try_sign(&[&config.keypair], blockhash)?;
    rpc_client.send_and_confirm_transaction_with_spinner(&transaction)?;

    println!("{}: {}", "Case reported".green(), case_address);

    Ok(())
}
