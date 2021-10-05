use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
    rent::Rent,
    sysvar::Sysvar,
};

use crate::{
    error::HapiError,
    state::address::{get_address_address_seeds, Address},
    state::case::{assert_is_valid_case, get_case_address},
    state::enums::{Category, HapiAccountType},
    state::reporter::{assert_reporter_belongs_to_community, assert_reporter_can_report_address},
    tools::account::{assert_is_empty_account, create_and_serialize_account_signed},
};

pub fn process_create_address(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    value: &Pubkey,
    case_id: u64,
    risk: u8,
    category: Category,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let reporter_key_info = next_account_info(account_info_iter)?; // 0
    let community_info = next_account_info(account_info_iter)?; // 1
    let network_info = next_account_info(account_info_iter)?; // 2
    let reporter_info = next_account_info(account_info_iter)?; // 3
    let case_info = next_account_info(account_info_iter)?; // 4
    let address_info = next_account_info(account_info_iter)?; // 5
    let system_info = next_account_info(account_info_iter)?; // 6
    let rent_sysvar_info = next_account_info(account_info_iter)?; // 7
    let rent = &Rent::from_account_info(rent_sysvar_info)?;

    // Reporter must sign
    if !reporter_key_info.is_signer {
        msg!("Reporter did not sign CreateCase");
        return Err(HapiError::SignatureMissing.into());
    }

    assert_reporter_belongs_to_community(reporter_info, community_info, &reporter_key_info.key)?;
    assert_reporter_can_report_address(reporter_info)?;
    assert_is_empty_account(address_info)?;

    // Make sure that case ID and account is fine
    assert_is_valid_case(&case_info)?;
    if *case_info.key != get_case_address(community_info.key, &case_id.to_le_bytes()) {
        msg!("Invalid case ID");
        return Err(HapiError::CaseIDMismatch.into());
    }

    let address_data = Address {
        account_type: HapiAccountType::Address,
        risk,
        case_id,
        category,
    };

    create_and_serialize_account_signed::<Address>(
        reporter_key_info,
        &address_info,
        &address_data,
        &get_address_address_seeds(&network_info.key, value),
        program_id,
        system_info,
        rent,
    )?;

    Ok(())
}
