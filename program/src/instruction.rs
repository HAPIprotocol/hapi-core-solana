//! Instruction types

use borsh::{BorshDeserialize, BorshSchema, BorshSerialize};

use solana_program::{
  instruction::{AccountMeta, Instruction},
  pubkey::Pubkey,
  system_program, sysvar,
};

use crate::{id, state::network::get_network_address};

/// Instructions supported by the HAPI program
#[repr(C)]
#[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize, BorshSchema)]
pub enum HapiInstruction {
  /// Creates a new HAPI Network
  ///
  /// 0. `[signer]` Payer
  /// 1. `[writable]` Network account. PDA seeds: ['network', name]
  /// 2. `[]` System
  /// 3. `[]` Sysvar Rent
  CreateNetwork {
    #[allow(dead_code)]
    /// UTF-8 encoded HAPI Network name
    name: String,
  },
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
