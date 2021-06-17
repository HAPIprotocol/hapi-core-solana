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

  /// Network reporter account
  NetworkReporter,

  /// Case account
  Case,

  /// Address account
  Address,
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

  /// Full - can report cases and addresses
  Full,

  /// Authority - can modify cases and addresses
  Authority,
}

impl Default for ReporterType {
  fn default() -> Self {
    ReporterType::Inactive
  }
}
