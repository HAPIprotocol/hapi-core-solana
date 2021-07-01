//! Network operation instructions

use {
    borsh::BorshSerialize,
    solana_program::{
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
        system_program, sysvar,
    },
};

use crate::{id, instruction::HapiInstruction, state::network::get_network_address};

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
