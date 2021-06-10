use solana_program::pubkey::Pubkey;
use solana_sdk::signature::Keypair;

use hapi_core_solana::state::{enums::ReporterType, network::Network, reporter::Reporter, event::Event};

#[derive(Debug)]
pub struct NetworkCookie {
  pub address: Pubkey,
  pub account: Network,
  pub name: String,
}

#[derive(Debug)]
pub struct ReporterCookie {
  pub address: Pubkey,
  pub account: Reporter,
  pub reporter_keypair: Keypair,
  pub reporter_type: ReporterType,
  pub name: String,
}

#[derive(Debug)]
pub struct EventCookie {
  pub address: Pubkey,
  pub account: Event,
  pub network_account: Pubkey,
  pub name: String,
}
