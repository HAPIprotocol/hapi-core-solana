#![allow(dead_code)]
//! Instruction types

mod network;
pub use network::*;

mod reporter;
pub use reporter::*;

// TODO: describe actors (Authority and Reporter) and their respective program accounts

use borsh::{BorshDeserialize, BorshSchema, BorshSerialize};
use solana_program::pubkey::Pubkey;

use crate::state::enums::ReporterType;

/// Instructions supported by the HAPI program
#[repr(C)]
#[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize, BorshSchema)]
pub enum HapiInstruction {
  /// Creates a new HAPI Network
  ///
  /// 0. `[signer]` Authority account
  /// 1. `[writable]` Network account. PDA seeds: ['network', name]
  /// 2. `[]` System
  /// 3. `[]` Sysvar Rent
  ///
  CreateNetwork {
    /// UTF-8 encoded HAPI Network name
    name: String,
  },

  /// Add reporter to network
  ///
  /// 0. `[signer]` Authority account
  /// 1. `[writable]` Network account
  /// 2. `[]` Reporter account (will be used as signer in address and event reports)
  /// 3. `[writable]` NetworkReporter account. PDA seeds: [`reporter`, network_account, reporter_pubkey]
  /// 4. `[]` System
  /// 5. `[]` Sysvar Rent
  ///
  AddReporter {
    /// UTF-8 encoded Reporter name
    name: String,

    /// Reporter type
    reporter_type: ReporterType,
  },

  /// Update reporter name and type
  ///
  /// 0. `[signer]` Authority account
  /// 1. `[]` Network account
  /// 2. `[writable]` NetworkReporter account. PDA seeds: [`reporter`, network_account, reporter_pubkey]
  /// 3. `[]` Reporter account
  ///
  UpdateReporter {
    /// UTF-8 encoded Reporter name
    name: String,

    /// Reporter type
    reporter_type: ReporterType,
  },

  /// Report a new event
  ///
  /// 0. `[signer]` Reporter account
  /// 1. `[writable]` Network account
  /// 2. `[]` NetworkReporter account
  /// 3. `[writable]` Event account. PDA seeds: ['event', network_account, event_id]
  /// 4. `[]` System
  /// 5. `[]` Sysvar Rent
  ///
  ReportEvent {
    /// UTF-8 encoded event name
    name: String,
  },

  /// Report an address for an existing event
  ///
  /// 0. `[signer]` Reporter account
  /// 1. `[]` Network account
  /// 2. `[]` NetworkReporter account
  /// 3. `[]` Event account. PDA seeds: ['event', network_account, event_id]
  /// 4. `[writable]` Address account. PDA seeds: ['address', network_account, address]
  /// 5. `[]` System
  /// 6. `[]` Sysvar Rent
  ///
  ReportAddress {
    /// Address value
    address: Pubkey,

    /// Address risk score: 0 is safe, 10 is maximum risk
    risk: u8,

    /// Event ID
    event_id: u64,
  },

  /// Update an existing address
  UpdateAddress {
    /// Address risk score: 0 is safe, 10 is maximum risk
    risk: u8,

    /// Event ID
    event_id: u64,
  },
}
