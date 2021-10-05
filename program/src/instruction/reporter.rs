//! Reporter operation instructions

use {
    borsh::BorshSerialize,
    solana_program::{
        instruction::{AccountMeta, Instruction},
        pubkey::Pubkey,
        system_program, sysvar,
    },
};

use crate::{
    error::GenericError,
    id,
    instruction::HapiInstruction,
    state::{
        address::get_address_address,
        case::get_case_address,
        community::get_community_address,
        enums::{Category, CategorySet},
        network::get_network_address,
        reporter::get_reporter_address,
    },
    tools::parse_network_path,
};

/// Creates CreateCase instruction
pub fn create_case(
    // Accounts
    reporter: &Pubkey,
    // Args
    community_name: &str,
    case_id: u64,
    case_name: &str,
    categories: &CategorySet,
) -> Result<Instruction, GenericError> {
    let community_address = get_community_address(&community_name);
    let case_address = get_case_address(&community_address, &case_id.to_le_bytes());
    let reporter_address = get_reporter_address(&community_address, &reporter);

    let accounts = vec![
        AccountMeta::new(*reporter, true),
        AccountMeta::new(community_address, false),
        AccountMeta::new_readonly(reporter_address, false),
        AccountMeta::new(case_address, false),
        AccountMeta::new_readonly(system_program::id(), false),
        AccountMeta::new_readonly(sysvar::rent::id(), false),
    ];

    let instruction = HapiInstruction::CreateCase {
        name: case_name.to_string(),
        categories: *categories,
    };

    Ok(Instruction {
        program_id: id(),
        accounts,
        data: instruction.try_to_vec().unwrap(),
    })
}

/// Creates UpdateCase instruction
pub fn update_case(
    // Accounts
    reporter: &Pubkey,
    // Args
    community_name: &str,
    case_id: u64,
    categories: &CategorySet,
) -> Result<Instruction, GenericError> {
    let community_address = get_community_address(&community_name);
    let case_address = get_case_address(&community_address, &case_id.to_le_bytes());
    let reporter_address = get_reporter_address(&community_address, &reporter);

    let accounts = vec![
        AccountMeta::new(*reporter, true),
        AccountMeta::new_readonly(community_address, false),
        AccountMeta::new_readonly(reporter_address, false),
        AccountMeta::new(case_address, false),
    ];

    let instruction = HapiInstruction::UpdateCase {
        categories: *categories,
    };

    Ok(Instruction {
        program_id: id(),
        accounts,
        data: instruction.try_to_vec().unwrap(),
    })
}

/// Creates ReportAddress instruction
pub fn report_address(
    // Accounts
    reporter: &Pubkey,
    // Args
    network_path: &str,
    address: &Pubkey,
    case_id: u64,
    risk: u8,
    category: Category,
) -> Result<Instruction, GenericError> {
    let (community_name, network_name) = parse_network_path(network_path)?;
    let community_address = get_community_address(&community_name);
    let network_address = get_network_address(&community_address, &network_name);
    let address_address = get_address_address(&network_address, address);
    let reporter_address = get_reporter_address(&community_address, &reporter);
    let case_address = get_case_address(&community_address, &case_id.to_le_bytes());

    let accounts = vec![
        AccountMeta::new(*reporter, true),
        AccountMeta::new_readonly(community_address, false),
        AccountMeta::new_readonly(network_address, false),
        AccountMeta::new_readonly(reporter_address, false),
        AccountMeta::new_readonly(case_address, false),
        AccountMeta::new(address_address, false),
        AccountMeta::new_readonly(system_program::id(), false),
        AccountMeta::new_readonly(sysvar::rent::id(), false),
    ];

    let instruction = HapiInstruction::ReportAddress {
        address: *address,
        risk,
        case_id,
        category,
    };

    Ok(Instruction {
        program_id: id(),
        accounts,
        data: instruction.try_to_vec().unwrap(),
    })
}

/// Creates ReportAddress instruction
pub fn update_address(
    // Accounts
    reporter: &Pubkey,
    // Args
    network_path: &str,
    address: &Pubkey,
    case_id: u64,
    risk: u8,
    category: Category,
) -> Result<Instruction, GenericError> {
    let (community_name, network_name) = parse_network_path(network_path)?;
    let community_address = get_community_address(&community_name);
    let network_address = get_network_address(&community_address, &network_name);
    let address_address = get_address_address(&network_address, address);
    let reporter_address = get_reporter_address(&community_address, &reporter);
    let case_address = get_case_address(&network_address, &case_id.to_le_bytes());

    let accounts = vec![
        AccountMeta::new(*reporter, true),
        AccountMeta::new_readonly(community_address, false),
        AccountMeta::new_readonly(reporter_address, false),
        AccountMeta::new_readonly(case_address, false),
        AccountMeta::new_readonly(address_address, false),
    ];

    let instruction = HapiInstruction::UpdateAddress {
        risk,
        case_id,
        category,
    };

    Ok(Instruction {
        program_id: id(),
        accounts,
        data: instruction.try_to_vec().unwrap(),
    })
}
