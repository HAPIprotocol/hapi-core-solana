use {
    crate::Config,
    colored::*,
    hapi_core_solana::state::network::{get_network_address, Network},
    solana_client::rpc_client::RpcClient,
    solana_program::borsh::try_from_slice_unchecked,
};

pub fn cmd_view_network(
    rpc_client: &RpcClient,
    config: &Config,
    network_name: String,
) -> Result<(), Box<dyn std::error::Error>> {
    if config.verbose {
        println!("{}: {}", "Network".bright_black(), network_name);
    }

    let address = get_network_address(&network_name);

    if config.verbose {
        println!("{}: {}", "Network address".bright_black(), address);
    }

    let data = rpc_client.get_account_data(&address)?;

    let network: Network = try_from_slice_unchecked(&data)?;
    println!("{:#?}", network);

    Ok(())
}
