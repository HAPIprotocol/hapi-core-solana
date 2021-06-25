use {
  crate::{
    tools::{assert_is_empty_account, assert_is_existing_account},
    Config,
  },
  colored::*,
  hapi_core_solana::{instruction, state::network::get_network_address},
  solana_client::rpc_client::RpcClient,
  solana_sdk::{pubkey::Pubkey, signature::Signer, transaction::Transaction},
};

pub fn cmd_create_network(
  rpc_client: &RpcClient,
  config: &Config,
  network_name: String,
  network_authority: &Pubkey,
) -> Result<(), Box<dyn std::error::Error>> {
  if config.verbose {
    println!("{}: {}", "Network".bright_black(), network_name.bold());
    println!(
      "{} {}",
      "Network authority pubkey:".bright_black(),
      network_authority.to_string().bold()
    );
  }

  assert_is_existing_account(rpc_client, &network_authority)?;

  let network_address = get_network_address(&network_name);

  assert_is_empty_account(rpc_client, &network_address)?;

  let mut transaction = Transaction::new_with_payer(
    &[instruction::create_network(
      network_authority,
      network_name,
    )],
    Some(&config.keypair.pubkey()),
  );
  let blockhash = rpc_client.get_recent_blockhash()?.0;
  transaction.try_sign(&[&config.keypair], blockhash)?;
  rpc_client.send_and_confirm_transaction_with_spinner(&transaction)?;

  println!("{}: {}", "Network created".green(), network_address);

  Ok(())
}
