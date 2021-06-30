use {
    crate::Config,
    colored::*,
    hapi_core_solana::state::{
        network::get_network_address,
        reporter::{get_reporter_address, NetworkReporter},
    },
    solana_client::rpc_client::RpcClient,
    solana_sdk::{borsh::try_from_slice_unchecked, pubkey::Pubkey},
};

pub fn cmd_view_reporter(
    rpc_client: &RpcClient,
    config: &Config,
    network_name: String,
    reporter_pubkey: &Pubkey,
) -> Result<(), Box<dyn std::error::Error>> {
    if config.verbose {
        println!("{}: {}", "Network".bright_black(), network_name);
    }

    let network_account = get_network_address(&network_name);
    if config.verbose {
        println!("{}: {}", "Network account".bright_black(), network_account);
    }

    let reporter_account = get_reporter_address(&network_account, &reporter_pubkey);
    if config.verbose {
        println!(
            "{}: {}",
            "Reporter address".bright_black(),
            reporter_account
        );
    }

    let reporter_data = rpc_client.get_account_data(&reporter_account)?;
    let reporter: NetworkReporter = try_from_slice_unchecked(&reporter_data)?;
    println!("{:#?}", reporter);

    Ok(())
}
