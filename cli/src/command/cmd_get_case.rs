use {
    crate::Config,
    colored::*,
    hapi_core_solana::state::{
        case::{get_case_address, Case},
        community::get_community_address,
    },
    solana_client::rpc_client::RpcClient,
    solana_sdk::borsh::try_from_slice_unchecked,
};

pub fn cmd_get_case(
    rpc_client: &RpcClient,
    config: &Config,
    community_name: String,
    case_id: u64,
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
    let case_address = get_case_address(&community_account, &case_id.to_le_bytes());
    if config.verbose {
        println!("{}: {}", "Case account".bright_black(), case_address);
    }
    let case_data = rpc_client.get_account_data(&case_address)?;
    let case: Case = try_from_slice_unchecked(&case_data)?;
    println!("{:#?}", case);
    Ok(())
}
