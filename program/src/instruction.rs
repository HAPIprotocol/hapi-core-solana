//! Instruction types

// TODO: describe actors (Authority and Reporter) and their respective program accounts

use borsh::{BorshDeserialize, BorshSchema, BorshSerialize};
use solana_program::{
  instruction::{AccountMeta, Instruction},
  pubkey::Pubkey,
  system_program, sysvar,
};

use crate::{
  id, state::enums::ReporterType, state::event::get_event_address,
  state::network::get_network_address, state::reporter::get_reporter_address,
};

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
    #[allow(dead_code)]
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
    #[allow(dead_code)]
    /// UTF-8 encoded Reporter name
    name: String,

    #[allow(dead_code)]
    /// Reporter type
    reporter_type: ReporterType,
  },

  /// Update reporter name and type
  ///
  /// 0. `[signer]` Authority account
  /// 1. `[writable]` NetworkReporter account. PDA seeds: ['reporter', pubkey]
  ///
  UpdateReporter {
    #[allow(dead_code)]
    /// UTF-8 encoded Reporter name
    name: String,

    #[allow(dead_code)]
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
    #[allow(dead_code)]
    /// UTF-8 encoded event name
    name: String,
  },

  /// Report an address for an existing event
  ///
  /// 0. `[signer]` Reporter account
  /// 1. `[]` Network account
  /// 2. `[writable]` Address account. PDA seeds: ['address', network_account, address]
  /// 3. `[]` Incident account
  ///
  ReportAddress {
    #[allow(dead_code)]
    /// Address risk score: 0 is safe, 10 is maximum risk
    risk: u8,

    #[allow(dead_code)]
    /// Event ID
    event_id: u64,
  },
}

/// Creates CreateNetwork instruction
pub fn create_network(
  // Accounts
  authority: &Pubkey,
  // Args
  name: String,
) -> Instruction {
  let network_address = get_network_address(&name);

  let accounts = vec![
    AccountMeta::new(*authority, true),
    AccountMeta::new(network_address, false),
    AccountMeta::new_readonly(system_program::id(), false),
    AccountMeta::new_readonly(sysvar::rent::id(), false),
  ];

  let instruction = HapiInstruction::CreateNetwork { name };

  Instruction {
    program_id: id(),
    accounts,
    data: instruction.try_to_vec().unwrap(),
  }
}

/// Creates AddReporter instruction
pub fn add_reporter(
  // Accounts
  payer: &Pubkey,
  network_account: &Pubkey,
  reporter_pubkey: &Pubkey,
  // Args
  name: String,
  reporter_type: ReporterType,
) -> Instruction {
  let reporter_account = get_reporter_address(network_account, reporter_pubkey);

  let accounts = vec![
    AccountMeta::new(*payer, true),
    AccountMeta::new_readonly(*network_account, false),
    AccountMeta::new_readonly(*reporter_pubkey, false),
    AccountMeta::new(reporter_account, false),
    AccountMeta::new_readonly(system_program::id(), false),
    AccountMeta::new_readonly(sysvar::rent::id(), false),
  ];

  let instruction = HapiInstruction::AddReporter {
    name,
    reporter_type,
  };

  Instruction {
    program_id: id(),
    accounts,
    data: instruction.try_to_vec().unwrap(),
  }
}

/// Creates UpdateReporter instruction
pub fn update_reporter(
  // Accounts
  authority: &Pubkey,
  network_account: &Pubkey,
  reporter_account: &Pubkey,
  // Args
  name: String,
  reporter_type: ReporterType,
) -> Instruction {
  let network_reporter_address = get_reporter_address(network_account, reporter_account);

  let accounts = vec![
    AccountMeta::new_readonly(*authority, true),
    AccountMeta::new(network_reporter_address, false),
  ];

  let instruction = HapiInstruction::UpdateReporter {
    name,
    reporter_type,
  };

  Instruction {
    program_id: id(),
    accounts,
    data: instruction.try_to_vec().unwrap(),
  }
}

/// Creates ReportEvent instruction
pub fn report_event(
  // Accounts
  reporter: &Pubkey,
  // Args
  network_name: String,
  event_id: u64,
  event_name: String,
) -> Instruction {
  let network_address = get_network_address(&network_name);
  let event_address = get_event_address(&network_address, &event_id.to_le_bytes());
  let reporter_address = get_reporter_address(&network_address, &reporter);

  let accounts = vec![
    AccountMeta::new(*reporter, true),
    AccountMeta::new(network_address, false),
    AccountMeta::new(reporter_address, false),
    AccountMeta::new(event_address, false),
    AccountMeta::new_readonly(system_program::id(), false),
    AccountMeta::new_readonly(sysvar::rent::id(), false),
  ];

  let instruction = HapiInstruction::ReportEvent { name: event_name };

  Instruction {
    program_id: id(),
    accounts,
    data: instruction.try_to_vec().unwrap(),
  }
}
