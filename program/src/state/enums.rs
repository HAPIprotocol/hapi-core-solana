//! State enumerations

use borsh::{BorshDeserialize, BorshSchema, BorshSerialize};

/// Defines all Governance accounts types
#[repr(C)]
#[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize, BorshSchema)]
pub enum HapiAccountType {
  /// Default uninitialized account state
  Uninitialized,

  /// HAPI network account
  Network,
}

impl Default for HapiAccountType {
  fn default() -> Self {
    HapiAccountType::Uninitialized
  }
}
