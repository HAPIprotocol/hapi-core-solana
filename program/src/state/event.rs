//! HAPI Event Account

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

/// HAPI Event Account
/// Account PDA seeds: ['event', network_name, event_id]
#[repr(C)]
#[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize, BorshSchema)]
pub struct Event {
  /// HAPI account type
  pub account_type: HapiAccountType,

  /// Event name
  pub name: String,

  /// Event reporter key
  pub reporter_key: Pubkey,
}

impl AccountMaxSize for Event {}

impl IsInitialized for Event {
  fn is_initialized(&self) -> bool {
    self.account_type == HapiAccountType::Event
  }
}

/// Checks whether event account exists, is initialized and owned by HAPI program
pub fn assert_is_valid_event(event_info: &AccountInfo) -> Result<(), ProgramError> {
  assert_is_valid_account(event_info, HapiAccountType::Event, &id())
}

/// Deserializes account and checks owner program
pub fn get_event_data(event_info: &AccountInfo) -> Result<Event, ProgramError> {
  get_account_data::<Event>(event_info, &id())
}

/// Returns Event PDA seeds
pub fn get_event_address_seeds<'a>(
  network: &'a Pubkey,
  event_id_le_bytes: &'a [u8],
) -> [&'a [u8]; 3] {
  [b"event", &network.as_ref(), &event_id_le_bytes]
}

/// Returns Event PDA address
pub fn get_event_address<'a>(network: &'a Pubkey, event_id_le_bytes: &'a [u8]) -> Pubkey {
  Pubkey::find_program_address(
    &get_event_address_seeds(&network, &event_id_le_bytes),
    &id(),
  )
  .0
}
