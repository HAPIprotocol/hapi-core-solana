//! Program processor

use {
    borsh::BorshDeserialize,
    solana_program::{
        account_info::AccountInfo, entrypoint::ProgramResult, msg, program_error::ProgramError,
        pubkey::Pubkey,
    },
};

mod process_create_reporter;
mod process_create_community;
mod process_create_network;
mod process_create_address;
mod process_create_case;
mod process_update_address;
mod process_update_case;
mod process_update_reporter;

use crate::instruction::HapiInstruction;
use process_create_reporter::*;
use process_create_community::*;
use process_create_network::*;
use process_create_address::*;
use process_create_case::*;
use process_update_address::*;
use process_update_case::*;
use process_update_reporter::*;

/// Processes an instruction
pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], input: &[u8]) -> ProgramResult {
    let instruction =
        HapiInstruction::try_from_slice(input).map_err(|_| ProgramError::InvalidInstructionData)?;

    msg!("HAPI-INSTRUCTION: {:?}", instruction);

    match instruction {
        HapiInstruction::CreateCommunity { name } => {
            process_create_community(program_id, accounts, &name)
        }

        HapiInstruction::CreateNetwork { name } => {
            process_create_network(program_id, accounts, &name)
        }

        HapiInstruction::CreateReporter {
            name,
            reporter_type,
        } => process_create_reporter(program_id, accounts, &name, reporter_type),

        HapiInstruction::UpdateReporter {
            name,
            reporter_type,
        } => process_update_reporter(program_id, accounts, &name, reporter_type),

        HapiInstruction::CreateCase { name, categories } => {
            process_create_case(program_id, accounts, &name, &categories)
        }

        HapiInstruction::UpdateCase { categories } => {
            process_update_case(program_id, accounts, &categories)
        }

        HapiInstruction::ReportAddress {
            address,
            risk,
            case_id,
            category,
        } => process_create_address(program_id, accounts, &address, case_id, risk, category),

        HapiInstruction::UpdateAddress {
            risk,
            case_id,
            category,
        } => process_update_address(program_id, accounts, case_id, risk, category),
    }
}
