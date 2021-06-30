use {
  crate::Config,
  colored::*,
  hapi_core_solana::state::{
    address::{get_address_address, Address},
    network::get_network_address,
  },
  solana_client::rpc_client::RpcClient,
  solana_sdk::{borsh::try_from_slice_unchecked, pubkey::Pubkey},
};

pub fn cmd_view_address(
  rpc_client: &RpcClient,
  config: &Config,
  network_name: String,
  address: &Pubkey,
) -> Result<(), Box<dyn std::error::Error>> {
  if config.verbose {
    println!("{}: {}", "Network".bright_black(), network_name);
  }
  let network_account = get_network_address(&network_name);
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
