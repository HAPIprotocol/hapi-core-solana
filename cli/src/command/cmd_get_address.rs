use {
    crate::Config,
    colored::*,
    hapi_core_solana::state::{
        address::{get_address_address, Address},
        community::get_community_address,
        network::get_network_address,
    },
    solana_client::rpc_client::RpcClient,
    solana_sdk::{borsh::try_from_slice_unchecked, pubkey::Pubkey},
};

pub fn cmd_get_address(
    rpc_client: &RpcClient,
    config: &Config,
    community_name: String,
    network_name: String,
    address: &Pubkey,
) -> Result<(), Box<dyn std::error::Error>> {
    if config.verbose {
        println!("{}: {}", "Network".bright_black(), network_name);
    }
    let community_account = get_community_address(&community_name);
    let network_account = get_network_address(&community_account, &network_name);
    if config.verbose {
        println!("{}: {}", "Network account".bright_black(), network_account);
    }

    let address_account = get_address_address(&network_account, address);
    if config.verbose {
        println!("{}: {}", "Address account".bright_black(), address_account);
    }
    let address_data = rpc_client.get_account_data(&address_account)?;
    let address: Address = try_from_slice_unchecked(&address_data)?;
    println!("{:#?}", address);

    Ok(())
}
