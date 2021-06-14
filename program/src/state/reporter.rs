//! HAPI Reporter Account

use borsh::{BorshDeserialize, BorshSchema, BorshSerialize};
use solana_program::{
  account_info::AccountInfo, program_error::ProgramError, program_pack::IsInitialized,
  pubkey::Pubkey,
};

use crate::{
  id,
  state::enums::{HapiAccountType, ReporterType},
  tools::account::{assert_is_valid_account, get_account_data, AccountMaxSize},
};

/// HAPI Reporter Account
/// Account PDA seeds: ['reporter', pubkey]
#[repr(C)]
#[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize, BorshSchema)]
pub struct NetworkReporter {
  /// HAPI account type
  pub account_type: HapiAccountType,

  /// Reporter type
  pub reporter_type: ReporterType,

  /// Reporter name
  pub name: String,
}

impl AccountMaxSize for NetworkReporter {}

impl IsInitialized for NetworkReporter {
  fn is_initialized(&self) -> bool {
    self.account_type == HapiAccountType::NetworkReporter
  }
}

/// Checks whether reporter account exists, is initialized and owned by HAPI program
pub fn assert_is_valid_reporter(reporter_info: &AccountInfo) -> Result<(), ProgramError> {
  assert_is_valid_account(reporter_info, HapiAccountType::NetworkReporter, &id())
}

/// Deserializes account and checks owner program
pub fn get_reporter_data(reporter_info: &AccountInfo) -> Result<NetworkReporter, ProgramError> {
  get_account_data::<NetworkReporter>(reporter_info, &id())
}

/// Returns Reporter PDA seeds
pub fn get_reporter_address_seeds<'a>(network: &'a Pubkey, pubkey: &'a Pubkey) -> [&'a [u8]; 3] {
  [b"reporter", network.as_ref(), pubkey.as_ref()]
}

/// Returns Reporter PDA address
pub fn get_reporter_address<'a>(network: &'a Pubkey, pubkey: &'a Pubkey) -> Pubkey {
  Pubkey::find_program_address(&get_reporter_address_seeds(network, pubkey), &id()).0
}
