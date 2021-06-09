//! Program processor

use borsh::BorshDeserialize;
use solana_program::{
  account_info::AccountInfo, entrypoint::ProgramResult, msg, program_error::ProgramError,
  pubkey::Pubkey,
};

mod process_add_reporter;
mod process_create_network;
mod process_update_reporter;

use crate::instruction::HapiInstruction;
use process_add_reporter::*;
use process_create_network::*;
use process_update_reporter::*;

/// Processes an instruction
pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], input: &[u8]) -> ProgramResult {
  let instruction =
    HapiInstruction::try_from_slice(input).map_err(|_| ProgramError::InvalidInstructionData)?;

  msg!("HAPI-INSTRUCTION: {:?}", instruction);

  match instruction {
    HapiInstruction::CreateNetwork { name } => process_create_network(program_id, accounts, name),

    HapiInstruction::AddReporter {
      name,
      reporter_type,
    } => process_add_reporter(program_id, accounts, name, reporter_type),

    HapiInstruction::UpdateReporter {
      name,
      reporter_type,
    } => process_update_reporter(program_id, accounts, name, reporter_type),

    // _ => todo!("Instruction not implemented yet"),
  }
}
