use solana_program::pubkey::Pubkey;

use hapi_core_solana::{ state::{network::Network, reporter::Reporter, enums::ReporterType}};

#[derive(Debug)]
pub struct NetworkCookie {
  pub address: Pubkey,
  pub account: Network,
}

#[derive(Debug)]
pub struct ReporterCookie {
  pub address: Pubkey,
  pub account: Reporter,
  pub reporter_key: Pubkey,
  pub reporter_type: ReporterType,
  pub name: String,
}
