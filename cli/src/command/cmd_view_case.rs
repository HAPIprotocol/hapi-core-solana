use {
    crate::Config,
    colored::*,
    hapi_core_solana::state::{
        network::get_network_address,
        case::{get_case_address, Case},
    },
    solana_client::rpc_client::RpcClient,
    solana_program::borsh::try_from_slice_unchecked,
};

pub fn cmd_view_case(
    rpc_client: &RpcClient,
    config: &Config,
    network_name: String,
    case_id: u64,
) -> Result<(), Box<dyn std::error::Error>> {
    if config.verbose {
        println!("{}: {}", "Network".bright_black(), network_name);
    }
    let network_address = get_network_address(&network_name);
    if config.verbose {
        println!("{}: {}", "Network address".bright_black(), network_address);
    }
    let case_address = get_case_address(&network_address, &case_id.to_le_bytes());
    if config.verbose {
        println!("{}: {}", "Case address".bright_black(), case_address);
    }
    let case_data = rpc_client.get_account_data(&case_address)?;
    let case: Case = try_from_slice_unchecked(&case_data)?;
    println!("{:#?}", case);
    Ok(())
}
