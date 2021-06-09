//! State enumerations

use borsh::{BorshDeserialize, BorshSchema, BorshSerialize};

/// Defines all HAPI accounts types
#[repr(C)]
#[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize, BorshSchema)]
pub enum HapiAccountType {
  /// Default uninitialized account state
  Uninitialized,

  /// HAPI network account
  Network,

  /// Reporter account
  Reporter,
}

impl Default for HapiAccountType {
  fn default() -> Self {
    HapiAccountType::Uninitialized
  }
}

/// Reporter type
#[repr(C)]
#[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize, BorshSchema)]
pub enum ReporterType {
  /// Inactive reporter
  Inactive,

  /// Tracer - can report addresses
  Tracer,

  /// Full - can report incidents and addresses
  Full,
}

impl Default for ReporterType {
  fn default() -> Self {
    ReporterType::Inactive
  }
}
