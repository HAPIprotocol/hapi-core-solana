use {
    borsh::BorshSerialize,
    solana_program::{
        account_info::{next_account_info, AccountInfo},
        entrypoint::ProgramResult,
        msg,
        pubkey::Pubkey,
    },
};

use crate::{
    error::HapiError,
    state::{
        case::{assert_is_valid_case, get_case_data},
        enums::{CaseStatus, CategorySet},
        reporter::{
            assert_is_valid_reporter, assert_reporter_can_update_case, get_reporter_address,
        },
    },
};

pub fn process_update_case(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    categories: &CategorySet,
    status: CaseStatus,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let reporter_key_info = next_account_info(account_info_iter)?; // 0
    let community_info = next_account_info(account_info_iter)?; // 1
    let reporter_info = next_account_info(account_info_iter)?; // 2
    let case_info = next_account_info(account_info_iter)?; // 3

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

    assert_is_valid_reporter(reporter_info)?;
    assert_is_valid_case(case_info)?;

    let mut case_data = get_case_data(&case_info)?;

    assert_reporter_can_update_case(&reporter_key_info, &reporter_info, &case_data.reporter_key)?;

    case_data.categories = *categories;
    case_data.status = status;
    case_data.serialize(&mut *case_info.data.borrow_mut())?;

    Ok(())
}
