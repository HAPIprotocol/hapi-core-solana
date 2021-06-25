use {
  crate::Config,
  colored::*,
  solana_client::rpc_client::RpcClient,
  solana_sdk::{pubkey::Pubkey, signature::Signer, transaction::Transaction},
};

pub fn process_create_network(
  rpc_client: &RpcClient,
  config: &Config,
  network_name: String,
  network_authority: &Pubkey,
) -> Result<(), Box<dyn std::error::Error>> {
  println!("Creating network {}...", network_name.bold());
  if config.verbose {
    println!(
      "Network authority pubkey: {}",
      network_authority.to_string().bold()
    );
  }

  // Verify that network_authority is an existing account
  rpc_client.get_account(network_authority)?;

  let mut transaction = Transaction::new_with_payer(
    &[hapi_core_solana::instruction::create_network(
      network_authority,
      network_name,
    )],
    Some(&config.keypair.pubkey()),
  );
  let blockhash = rpc_client.get_recent_blockhash()?.0;
  transaction.try_sign(&[&config.keypair], blockhash)?;
  rpc_client.send_and_confirm_transaction_with_spinner(&transaction)?;

  Ok(())
}
