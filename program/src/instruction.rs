//! Instruction types

use borsh::{BorshDeserialize, BorshSchema, BorshSerialize};

use solana_program::{
  instruction::{AccountMeta, Instruction},
  pubkey::Pubkey,
  system_program, sysvar,
};

use crate::{
  id, state::enums::ReporterType, state::network::get_network_address,
  state::reporter::get_reporter_address,
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

  /// Add reporter credentials
  ///
  /// 0. `[signer]` Authority account
  /// 1. `[]` Reporter account (will be used as signer in address and incident reports)
  /// 1. `[writable]` Reporter info account. PDA seeds: [`reporter`, pubkey]
  /// 2. `[]` System
  /// 3. `[]` Sysvar Rent
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
  /// 1. `[writable` Reporter account. PDA seeds: ['reporter', pubkey]
  /// 
  UpdateReporter {
    #[allow(dead_code)]
    /// UTF-8 encoded Reporter name
    name: String,

    #[allow(dead_code)]
    /// Reporter type
    reporter_type: ReporterType,
  }
}

/// Creates CreateNetwork instruction
pub fn create_network(
  // Accounts
  payer: &Pubkey,
  // Args
  name: String,
) -> Instruction {
  let network_address = get_network_address(&name);

  let accounts = vec![
    AccountMeta::new_readonly(*payer, true),
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
  reporter_account: &Pubkey,
  // Args
  name: String,
  reporter_type: ReporterType,
) -> Instruction {
  let reporter_info = get_reporter_address(reporter_account);

  let accounts = vec![
    AccountMeta::new_readonly(*payer, true),
    AccountMeta::new_readonly(*reporter_account, false),
    AccountMeta::new(reporter_info, false),
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
  payer: &Pubkey,
  reporter_key: &Pubkey,
  // Args
  name: String,
  reporter_type: ReporterType,
) -> Instruction {
  let reporter_address = get_reporter_address(reporter_key);

  let accounts = vec![
    AccountMeta::new_readonly(*payer, true),
    AccountMeta::new(reporter_address, false),
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
