//! Program processor

use {
    borsh::BorshDeserialize,
    solana_program::{
        account_info::AccountInfo, entrypoint::ProgramResult, msg, program_error::ProgramError,
        pubkey::Pubkey,
    },
};

mod process_add_reporter;
mod process_create_network;
mod process_report_address;
mod process_report_case;
mod process_update_address;
mod process_update_case;
mod process_update_reporter;

use crate::instruction::HapiInstruction;
use process_add_reporter::*;
use process_create_network::*;
use process_report_address::*;
use process_report_case::*;
use process_update_address::*;
use process_update_case::*;
use process_update_reporter::*;

/// Processes an instruction
pub fn process(program_id: &Pubkey, accounts: &[AccountInfo], input: &[u8]) -> ProgramResult {
    let instruction =
        HapiInstruction::try_from_slice(input).map_err(|_| ProgramError::InvalidInstructionData)?;

    msg!("HAPI-INSTRUCTION: {:?}", instruction);

    match instruction {
        HapiInstruction::CreateNetwork { name } => {
            process_create_network(program_id, accounts, &name)
        }

        HapiInstruction::AddReporter {
            name,
            reporter_type,
        } => process_add_reporter(program_id, accounts, &name, reporter_type),

        HapiInstruction::UpdateReporter {
            name,
            reporter_type,
        } => process_update_reporter(program_id, accounts, &name, reporter_type),

        HapiInstruction::ReportCase { name, categories } => {
            process_report_case(program_id, accounts, &name, &categories)
        }

        HapiInstruction::UpdateCase { categories } => {
            process_update_case(program_id, accounts, &categories)
        }

        HapiInstruction::ReportAddress {
            address,
            risk,
            case_id,
            category,
        } => process_report_address(program_id, accounts, &address, case_id, risk, category),

        HapiInstruction::UpdateAddress {
            risk,
            case_id,
            category,
        } => process_update_address(program_id, accounts, case_id, risk, category),
    }
}
