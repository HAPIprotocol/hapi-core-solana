//! HAPI Config Account

use borsh::{BorshDeserialize, BorshSchema, BorshSerialize};
use solana_program::{
  account_info::AccountInfo, program_error::ProgramError, program_pack::IsInitialized,
  pubkey::Pubkey,
};

use crate::{
  id,
  state::enums::HapiAccountType,
  tools::account::{assert_is_valid_account, get_account_data, AccountMaxSize},
};

/// HAPI Network Account
/// Account PDA seeds: ['network', name]
#[repr(C)]
#[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize, BorshSchema)]
pub struct Network {
  /// HAPI account type
  pub account_type: HapiAccountType,

  /// HAPI authority account
  pub authority: Pubkey,

  /// HAPI network name
  pub name: String,

  /// ID for the next reported event
  pub next_event_id: u64,
}

impl AccountMaxSize for Network {}

impl IsInitialized for Network {
  fn is_initialized(&self) -> bool {
    self.account_type == HapiAccountType::Network
  }
}

/// Checks whether network account exists, is initialized and owned by HAPI program
pub fn assert_is_valid_network(network_info: &AccountInfo) -> Result<(), ProgramError> {
  assert_is_valid_account(network_info, HapiAccountType::Network, &id())
}

/// Deserializes account and checks owner program
pub fn get_network_data(network_info: &AccountInfo) -> Result<Network, ProgramError> {
  get_account_data::<Network>(network_info, &id())
}

/// Returns Network PDA seeds
pub fn get_network_address_seeds(name: &str) -> [&[u8]; 2] {
  [b"network", &name.as_bytes()]
}

/// Returns Network PDA address
pub fn get_network_address(name: &str) -> Pubkey {
  Pubkey::find_program_address(&get_network_address_seeds(&name), &id()).0
}
