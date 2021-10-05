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
    state::address::{assert_is_valid_address, get_address_data},
    state::case::{assert_is_valid_case, get_case_address},
    state::enums::Category,
    state::reporter::{assert_reporter_belongs_to_community, assert_reporter_can_create_address},
};

pub fn process_update_address(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    case_id: u64,
    risk: u8,
    category: Category,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let reporter_key_info = next_account_info(account_info_iter)?; // 0
    let community_info = next_account_info(account_info_iter)?; // 1
    let reporter_info = next_account_info(account_info_iter)?; // 3
    let case_info = next_account_info(account_info_iter)?; // 4
    let address_info = next_account_info(account_info_iter)?; // 5

    // Reporter must sign
    if !reporter_key_info.is_signer {
        msg!("Reporter did not sign CreateCase");
        return Err(HapiError::SignatureMissing.into());
    }

    assert_is_valid_address(address_info)?;
    assert_reporter_belongs_to_community(reporter_info, community_info, &reporter_key_info.key)?;
    assert_reporter_can_create_address(reporter_info)?;

    // Make sure that case ID and account is fine
    assert_is_valid_case(&case_info)?;
    if *case_info.key != get_case_address(community_info.key, &case_id.to_le_bytes()) {
        msg!("Invalid case ID");
        return Err(HapiError::CaseIDMismatch.into());
    }

    // Update address data
    let mut address_data = get_address_data(address_info)?;
    address_data.case_id = case_id;
    address_data.category = category;
    address_data.risk = risk;
    address_data.serialize(&mut *reporter_info.data.borrow_mut())?;

    Ok(())
}
