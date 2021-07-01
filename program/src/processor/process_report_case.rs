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
    std::collections::BTreeSet,
};

use crate::{
    error::HapiError,
    state::case::{get_case_address_seeds, Case},
    state::enums::{Category, HapiAccountType},
    state::network::get_network_data,
    state::reporter::{assert_reporter_can_report_case, get_reporter_address},
    tools::account::{assert_is_empty_account, create_and_serialize_account_signed},
};

pub fn process_report_case(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: &str,
    category_set: &BTreeSet<Category>,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let reporter_key_info = next_account_info(account_info_iter)?; // 0
    let community_info = next_account_info(account_info_iter)?; // 1
    let network_info = next_account_info(account_info_iter)?; // 2
    let reporter_info = next_account_info(account_info_iter)?; // 3
    let case_info = next_account_info(account_info_iter)?; // 4
    let system_info = next_account_info(account_info_iter)?; // 5
    let rent_sysvar_info = next_account_info(account_info_iter)?; // 6
    let rent = &Rent::from_account_info(rent_sysvar_info)?;

    // Reporter must sign
    if !reporter_key_info.is_signer {
        msg!("Reporter did not sign ReportCase");
        return Err(HapiError::SignatureMissing.into());
    }

    // Make sure that reporter's public key matches Reporter account
    let reporter_address = get_reporter_address(&community_info.key, &reporter_key_info.key);
    if reporter_address != *reporter_info.key {
        msg!("Reporter doesn't match Reporter account");
        return Err(HapiError::InvalidReporter.into());
    }

    assert_is_empty_account(case_info)?;
    assert_reporter_can_report_case(reporter_info)?;

    // Obtain next case ID and increment it in Network account
    let mut network_data = get_network_data(network_info)?;
    let case_id = network_data.next_case_id;
    network_data.next_case_id += 1;
    network_data.serialize(&mut *network_info.data.borrow_mut())?;

    // Convert category set to category map with blank data
    let mut category_map = Category::new_map();
    for category in category_set.iter() {
        category_map.insert(*category, true);
    }

    let case_data = Case {
        account_type: HapiAccountType::Case,
        name: name.to_string(),
        reporter_key: *reporter_key_info.key,
        categories: category_map,
    };

    create_and_serialize_account_signed::<Case>(
        reporter_key_info,
        &case_info,
        &case_data,
        &get_case_address_seeds(&network_info.key, &case_id.to_le_bytes()),
        program_id,
        system_info,
        rent,
    )?;

    Ok(())
}
