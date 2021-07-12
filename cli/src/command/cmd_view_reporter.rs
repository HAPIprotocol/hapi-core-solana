use {
    crate::Config,
    colored::*,
    hapi_core_solana::state::{
        community::get_community_address,
        reporter::{get_reporter_address, Reporter},
    },
    solana_client::rpc_client::RpcClient,
    solana_sdk::{borsh::try_from_slice_unchecked, pubkey::Pubkey},
};

pub fn cmd_view_reporter(
    rpc_client: &RpcClient,
    config: &Config,
    community_name: String,
    reporter_pubkey: &Pubkey,
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

    let reporter_account = get_reporter_address(&community_account, &reporter_pubkey);
    if config.verbose {
        println!(
            "{}: {}",
            "Reporter address".bright_black(),
            reporter_account
        );
    }

    let reporter_data = rpc_client.get_account_data(&reporter_account)?;
    let reporter: Reporter = try_from_slice_unchecked(&reporter_data)?;
    println!("{:#?}", reporter);

    Ok(())
}
