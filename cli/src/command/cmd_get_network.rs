use {
    crate::Config,
    colored::*,
    hapi_core_solana::state::{
        community::get_community_address,
        network::{get_network_address, Network},
    },
    solana_client::rpc_client::RpcClient,
    solana_sdk::borsh::try_from_slice_unchecked,
};

pub fn cmd_get_network(
    rpc_client: &RpcClient,
    config: &Config,
    community_name: String,
    network_name: String,
) -> Result<(), Box<dyn std::error::Error>> {
    if config.verbose {
        println!("{}: {}", "Network".bright_black(), network_name);
    }

    let community_account = get_community_address(&community_name);
    let network_account = get_network_address(&community_account, &network_name);

    if config.verbose {
        println!("{}: {}", "Network account".bright_black(), network_account);
    }

    let network_data = rpc_client.get_account_data(&network_account)?;

    let network: Network = try_from_slice_unchecked(&network_data)?;
    println!("{:#?}", network);

    Ok(())
}
