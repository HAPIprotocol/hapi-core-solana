//! Reporter operation instructions

use borsh::BorshSerialize;
use solana_program::{
  instruction::{AccountMeta, Instruction},
  pubkey::Pubkey,
  system_program, sysvar,
};

use crate::{
  id, instruction::HapiInstruction, state::address::get_address_address,
  state::enums::ReporterType, state::event::get_event_address, state::network::get_network_address,
  state::reporter::get_reporter_address,
};

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
    AccountMeta::new_readonly(*network_account, false),
    AccountMeta::new(network_reporter_address, false),
    AccountMeta::new_readonly(*reporter_account, false),
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

/// Creates ReportAddress instruction
pub fn report_address(
  // Accounts
  reporter: &Pubkey,
  // Args
  network_name: String,
  event_id: u64,
  address: &Pubkey,
  risk: u8,
) -> Instruction {
  let network_address = get_network_address(&network_name);
  let address_address = get_address_address(&network_address, address);
  let reporter_address = get_reporter_address(&network_address, &reporter);
  let event_address = get_event_address(&network_address, &event_id.to_le_bytes());

  let accounts = vec![
    AccountMeta::new(*reporter, true),
    AccountMeta::new(network_address, false),
    AccountMeta::new(reporter_address, false),
    AccountMeta::new(event_address, false),
    AccountMeta::new(address_address, false),
    AccountMeta::new_readonly(system_program::id(), false),
    AccountMeta::new_readonly(sysvar::rent::id(), false),
  ];

  let instruction = HapiInstruction::ReportAddress { address: *address, risk, event_id };

  Instruction {
    program_id: id(),
    accounts,
    data: instruction.try_to_vec().unwrap(),
  }
}
