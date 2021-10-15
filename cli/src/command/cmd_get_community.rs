use {
    crate::Config,
    colored::*,
    hapi_core_solana::state::community::{get_community_address, Community},
    solana_client::rpc_client::RpcClient,
    solana_sdk::borsh::try_from_slice_unchecked,
};

pub fn cmd_get_community(
    rpc_client: &RpcClient,
    config: &Config,
    community_name: String,
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

    let community_data = rpc_client.get_account_data(&community_account)?;

    let community: Community = try_from_slice_unchecked(&community_data)?;
    println!("{:#?}", community);

    Ok(())
}
