use {
  crate::{
    tools::{assert_is_empty_account, assert_is_existing_account},
    Config,
  },
  colored::*,
  hapi_core_solana::{instruction, state::community::get_community_address},
  solana_client::rpc_client::RpcClient,
  solana_sdk::{pubkey::Pubkey, signature::Signer, transaction::Transaction},
};

pub fn cmd_create_community(
  rpc_client: &RpcClient,
  config: &Config,
  community_name: String,
  community_authority: &Pubkey,
) -> Result<(), Box<dyn std::error::Error>> {
  if config.verbose {
    println!("{}: {}", "Network".bright_black(), community_name.bold());
    println!(
      "{} {}",
      "Community authority pubkey:".bright_black(),
      community_authority.to_string().bold()
    );
  }

  assert_is_existing_account(rpc_client, &community_authority)?;

  let community_account = get_community_address(&community_name);

  assert_is_empty_account(rpc_client, &community_account)?;

  let mut transaction = Transaction::new_with_payer(
    &[instruction::create_community(community_authority, &community_name).unwrap()],
    Some(&config.keypair.pubkey()),
  );
  let blockhash = rpc_client.get_recent_blockhash()?.0;
  transaction.try_sign(&[&config.keypair], blockhash)?;
  rpc_client.send_and_confirm_transaction_with_spinner(&transaction)?;

  println!("{}: {}", "Community created".green(), community_account);

  Ok(())
}
