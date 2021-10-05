//! Network operation instructions

use {
    borsh::BorshSerialize,
    solana_program::{
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
        system_program, sysvar,
    },
};

use crate::{
    error::GenericError, id, instruction::HapiInstruction, state::community::get_community_address,
    state::enums::ReporterType, state::network::get_network_address,
    state::reporter::get_reporter_address, tools::parse_network_path,
};

/// Creates CreateCommunity instruction
pub fn create_community(
    // Accounts
    authority: &Pubkey,
    // Args
    name: &str,
) -> Result<Instruction, GenericError> {
    let community_address = get_community_address(&name);

    let accounts = vec![
        AccountMeta::new(*authority, true),
        AccountMeta::new(community_address, false),
        AccountMeta::new_readonly(system_program::id(), false),
        AccountMeta::new_readonly(sysvar::rent::id(), false),
    ];

    let instruction = HapiInstruction::CreateCommunity {
        name: name.to_string(),
    };

    Ok(Instruction {
        program_id: id(),
        accounts,
        data: instruction.try_to_vec().unwrap(),
    })
}

/// Creates UpdateCommunity instruction
pub fn update_community(
    // Accounts
    authority: &Pubkey,
    new_authority: Option<&Pubkey>,
    // Args
    old_name: &str,
    new_name: &str,
) -> Result<Instruction, GenericError> {
    let community_address = get_community_address(&old_name);

    let mut accounts = vec![
        AccountMeta::new(*authority, true),
        AccountMeta::new(community_address, false),
    ];

    if let Some(new_authority) = new_authority {
        accounts.push(AccountMeta::new(*new_authority, false));
    }

    let instruction = HapiInstruction::UpdateCommunity {
        name: new_name.to_string(),
    };

    Ok(Instruction {
        program_id: id(),
        accounts,
        data: instruction.try_to_vec().unwrap(),
    })
}

/// Creates CreateNetwork instruction
pub fn create_network(
    // Accounts
    authority: &Pubkey,
    // Args
    network_path: &str,
) -> Result<Instruction, GenericError> {
    let (community_name, network_name) = parse_network_path(network_path)?;
    let community_address = get_community_address(&community_name);
    let network_address = get_network_address(&community_address, &network_name);

    let accounts = vec![
        AccountMeta::new(*authority, true),
        AccountMeta::new(network_address, false),
        AccountMeta::new_readonly(community_address, false),
        AccountMeta::new_readonly(system_program::id(), false),
        AccountMeta::new_readonly(sysvar::rent::id(), false),
    ];

    let instruction = HapiInstruction::CreateNetwork { name: network_name };

    Ok(Instruction {
        program_id: id(),
        accounts,
        data: instruction.try_to_vec().unwrap(),
    })
}

/// Creates CreateReporter instruction
pub fn create_reporter(
    // Accounts
    payer: &Pubkey,
    // Args
    community_name: &str,
    reporter_name: &str,
    reporter_pubkey: &Pubkey,
    reporter_type: ReporterType,
) -> Result<Instruction, GenericError> {
    let community_address = get_community_address(&community_name);
    let reporter_account = get_reporter_address(&community_address, reporter_pubkey);

    let accounts = vec![
        AccountMeta::new(*payer, true),
        AccountMeta::new_readonly(community_address, false),
        AccountMeta::new_readonly(*reporter_pubkey, false),
        AccountMeta::new(reporter_account, false),
        AccountMeta::new_readonly(system_program::id(), false),
        AccountMeta::new_readonly(sysvar::rent::id(), false),
    ];

    let instruction = HapiInstruction::CreateReporter {
        name: reporter_name.to_string(),
        reporter_type,
    };

    Ok(Instruction {
        program_id: id(),
        accounts,
        data: instruction.try_to_vec().unwrap(),
    })
}

/// Creates UpdateReporter instruction
pub fn update_reporter(
    // Accounts
    authority: &Pubkey,
    // Args
    community_name: &str,
    reporter_name: &str,
    reporter_pubkey: &Pubkey,
    reporter_type: ReporterType,
) -> Result<Instruction, GenericError> {
    let community_address = get_community_address(&community_name);
    let reporter_address = get_reporter_address(&community_address, reporter_pubkey);

    let accounts = vec![
        AccountMeta::new_readonly(*authority, true),
        AccountMeta::new_readonly(community_address, false),
        AccountMeta::new(reporter_address, false),
        AccountMeta::new_readonly(*reporter_pubkey, false),
    ];

    let instruction = HapiInstruction::UpdateReporter {
        name: reporter_name.to_string(),
        reporter_type,
    };

    Ok(Instruction {
        program_id: id(),
        accounts,
        data: instruction.try_to_vec().unwrap(),
    })
}
