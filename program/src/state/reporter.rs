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

/// HAPI Reporter Account
/// Account PDA seeds: ['reporter', pubkey]
#[repr(C)]
#[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize, BorshSchema)]
pub struct Reporter {
  /// HAPI account type
  pub account_type: HapiAccountType,

  /// Reporter public key
  pub reporter_key: Pubkey,

  /// Reporter name
  pub name: String,
}

impl AccountMaxSize for Reporter {}

impl IsInitialized for Reporter {
  fn is_initialized(&self) -> bool {
    self.account_type == HapiAccountType::Reporter
  }
}

/// Checks whether reporter account exists, is initialized and owned by HAPI program
pub fn assert_is_valid_reporter(reporter_info: &AccountInfo) -> Result<(), ProgramError> {
  assert_is_valid_account(reporter_info, HapiAccountType::Reporter, &id())
}

/// Deserializes account and checks owner program
pub fn get_reporter_data(reporter_info: &AccountInfo) -> Result<Reporter, ProgramError> {
  get_account_data::<Reporter>(reporter_info, &id())
}

/// Returns Network PDA seeds
pub fn get_reporter_address_seeds(pubkey: &Pubkey) -> [&[u8]; 2] {
  [b"reporter", pubkey.as_ref()]
}

/// Returns Network PDA address
pub fn get_reporter_address(pubkey: &Pubkey) -> Pubkey {
  Pubkey::find_program_address(&get_reporter_address_seeds(pubkey), &id()).0
}
