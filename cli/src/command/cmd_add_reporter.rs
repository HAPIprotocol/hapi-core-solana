use {
    crate::{
        tools::{assert_is_empty_account, assert_is_existing_account},
        Config,
    },
    colored::*,
    hapi_core_solana::{
        instruction,
        state::{
            community::{get_community_address, Community},
            enums::ReporterType,
            reporter::get_reporter_address,
        },
    },
    solana_client::rpc_client::RpcClient,
    solana_sdk::{
        borsh::try_from_slice_unchecked, pubkey::Pubkey, signature::Signer,
        transaction::Transaction,
    },
};

pub fn cmd_add_reporter(
    rpc_client: &RpcClient,
    config: &Config,
    community_name: String,
    reporter_pubkey: &Pubkey,
    name: String,
    reporter_type: ReporterType,
) -> Result<(), Box<dyn std::error::Error>> {
    let community_account = get_community_address(&community_name);
    let community_data = rpc_client.get_account_data(&community_account)?;
    let community: Community = try_from_slice_unchecked(&community_data)?;

    if config.verbose {
        println!("{}: {}", "Community".bright_black(), community.name);
    }

    assert_is_existing_account(rpc_client, &reporter_pubkey)?;

    let reporter_address = get_reporter_address(&community_account, reporter_pubkey);

    assert_is_empty_account(rpc_client, &reporter_address)?;

    let mut transaction = Transaction::new_with_payer(
        &[instruction::add_reporter(
            &config.keypair.pubkey(),
            &community_name,
            &name,
            reporter_pubkey,
            reporter_type,
        )
        .unwrap()],
        Some(&config.keypair.pubkey()),
    );
    let blockhash = rpc_client.get_recent_blockhash()?.0;
    transaction.try_sign(&[&config.keypair], blockhash)?;
    rpc_client.send_and_confirm_transaction_with_spinner(&transaction)?;

    println!("{}: {}", "Reporter added".green(), reporter_address);

    Ok(())
}
