use {
  crate::Config,
  colored::*,
  hapi_core_solana::state::{
    network::get_network_address,
    reporter::{get_reporter_address, NetworkReporter},
  },
  solana_client::rpc_client::RpcClient,
  solana_program::borsh::try_from_slice_unchecked,
  solana_sdk::pubkey::Pubkey,
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

  let network_address = get_network_address(&network_name);

  if config.verbose {
    println!("{}: {}", "Network address".bright_black(), network_address);
  }

  let reporter_address = get_reporter_address(&network_address, &reporter_pubkey);

  if config.verbose {
    println!(
      "{}: {}",
      "Reporter address".bright_black(),
      reporter_address
    );
  }

  let reporter_data = rpc_client.get_account_data(&reporter_address)?;

  let reporter: NetworkReporter = try_from_slice_unchecked(&reporter_data)?;
  println!("{:#?}", reporter);

  Ok(())
}
