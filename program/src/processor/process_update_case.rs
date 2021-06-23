use borsh::BorshSerialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};
use std::collections::BTreeSet;

use crate::{
    error::HapiError,
    state::case::{assert_is_valid_case, get_case_data},
    state::enums::Category,
    state::reporter::{
        assert_is_valid_reporter, assert_reporter_can_update_case, get_reporter_address,
    },
};

pub fn process_update_case(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    category_set: &BTreeSet<Category>,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let reporter_info = next_account_info(account_info_iter)?; // 0
    let network_info = next_account_info(account_info_iter)?; // 1
    let network_reporter_info = next_account_info(account_info_iter)?; // 2
    let case_info = next_account_info(account_info_iter)?; // 3

    // Reporter must sign
    if !reporter_info.is_signer {
        msg!("Reporter did not sign ReportCase");
        return Err(HapiError::SignatureMissing.into());
    }

    // Make sure that reporter's public key matches NetworkReporter account
    let network_reporter_address = get_reporter_address(&network_info.key, &reporter_info.key);
    if network_reporter_address != *network_reporter_info.key {
        msg!("Reporter doesn't match NetworkReporter account");
        return Err(HapiError::InvalidNetworkReporter.into());
    }

    assert_is_valid_reporter(network_reporter_info)?;

    let mut case_data = get_case_data(&case_info)?;
    // let reporter_data = get_reporter_data(&network_reporter_info)?;

    assert_reporter_can_update_case(
        &reporter_info,
        &network_reporter_info,
        &case_data.reporter_key,
    )?;

    assert_is_valid_case(case_info)?;

    // Convert category set to category map with blank data
    let mut category_map = Category::new_map();
    for category in category_set.iter() {
        category_map.insert(*category, true);
    }

    case_data.categories = category_map;

    case_data.serialize(&mut *case_info.data.borrow_mut())?;

    Ok(())
}
