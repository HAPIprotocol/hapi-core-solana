use {
    crate::Config,
    colored::*,
    hapi_core_solana::{
        id,
        state::{
            address::Address, case::Case, enums::HapiAccountType, network::Network,
            reporter::NetworkReporter,
        },
    },
    solana_client::rpc_client::RpcClient,
    solana_sdk::borsh::try_from_slice_unchecked,
};
pub fn cmd_list_accounts(
    rpc_client: &RpcClient,
    _config: &Config,
) -> Result<(), Box<dyn std::error::Error>> {
    let accounts = rpc_client.get_program_accounts(&id())?;

    for (pubkey, account) in accounts {
        let (account_type, _rest) = account
            .data
            .split_at(std::mem::size_of::<HapiAccountType>());
        let account_type: HapiAccountType = try_from_slice_unchecked(account_type).unwrap();
        let account_data: Box<dyn std::fmt::Debug> = match account_type {
            HapiAccountType::NetworkReporter => {
                Box::new(try_from_slice_unchecked::<NetworkReporter>(&account.data)?)
            }
            HapiAccountType::Network => {
                Box::new(try_from_slice_unchecked::<Network>(&account.data)?)
            }
            HapiAccountType::Case => Box::new(try_from_slice_unchecked::<Case>(&account.data)?),
            HapiAccountType::Address => {
                Box::new(try_from_slice_unchecked::<Address>(&account.data)?)
            }
            _ => unreachable!("Unknown account type"),
        };

        println!(
            "{} ({} bytes, {} lamports)\n{:#?}\n",
            pubkey.to_string().blue(),
            account.data.len(),
            account.lamports,
            account_data
        );
    }

    Ok(())
}
