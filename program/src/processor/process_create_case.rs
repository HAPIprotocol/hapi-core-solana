use {
    borsh::BorshSerialize,
    solana_program::{
        account_info::{next_account_info, AccountInfo},
        entrypoint::ProgramResult,
        msg,
        pubkey::Pubkey,
        rent::Rent,
        sysvar::Sysvar,
    },
};

use crate::{
    error::HapiError,
    state::{
        case::{get_case_address_seeds, Case},
        enums::{CategorySet, HapiAccountType},
        community::get_community_data,
        reporter::{assert_reporter_can_create_case, get_reporter_address},
    },
    tools::account::{assert_is_empty_account, create_and_serialize_account_signed},
};

pub fn process_create_case(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: &str,
    categories: &CategorySet,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let reporter_key_info = next_account_info(account_info_iter)?; // 0
    let community_info = next_account_info(account_info_iter)?; // 1
    let reporter_info = next_account_info(account_info_iter)?; // 2
    let case_info = next_account_info(account_info_iter)?; // 3
    let system_info = next_account_info(account_info_iter)?; // 4
    let rent_sysvar_info = next_account_info(account_info_iter)?; // 5
    let rent = &Rent::from_account_info(rent_sysvar_info)?;

    if name.len() > 32 {
        msg!("Case name must not exceed 32 bytes");
        return Err(HapiError::NameTooLong.into());
    }

    // Reporter must sign
    if !reporter_key_info.is_signer {
        msg!("Reporter did not sign CreateCase");
        return Err(HapiError::SignatureMissing.into());
    }

    // Make sure that reporter's public key matches Reporter account
    let reporter_address = get_reporter_address(&community_info.key, &reporter_key_info.key);
    if reporter_address != *reporter_info.key {
        msg!("Reporter doesn't match Reporter account");
        return Err(HapiError::InvalidReporter.into());
    }

    assert_is_empty_account(case_info)?;
    assert_reporter_can_create_case(reporter_info)?;

    // Obtain next case ID and increment it in Community account
    let mut community_data = get_community_data(community_info)?;
    let case_id = community_data.next_case_id;
    community_data.next_case_id += 1;
    community_data.serialize(&mut *community_info.data.borrow_mut())?;

    let case_data = Case {
        account_type: HapiAccountType::Case,
        reporter_key: *reporter_key_info.key,
        categories: *categories,
        name: name.to_string(),
    };

    create_and_serialize_account_signed::<Case>(
        reporter_key_info,
        &case_info,
        &case_data,
        &get_case_address_seeds(&community_info.key, &case_id.to_le_bytes()),
        program_id,
        system_info,
        rent,
    )?;

    Ok(())
}
