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
    state::reporter::{assert_reporter_belongs_to_network, assert_reporter_can_report_address},
    tools::account::{assert_is_empty_account, create_and_serialize_account_signed},
};

pub fn process_report_address(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    value: &Pubkey,
    case_id: u64,
    risk: u8,
    category: Category,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let reporter_info = next_account_info(account_info_iter)?; // 0
    let network_info = next_account_info(account_info_iter)?; // 1
    let network_reporter_info = next_account_info(account_info_iter)?; // 2
    let case_info = next_account_info(account_info_iter)?; // 3
    let address_info = next_account_info(account_info_iter)?; // 4
    let system_info = next_account_info(account_info_iter)?; // 5
    let rent_sysvar_info = next_account_info(account_info_iter)?; // 6
    let rent = &Rent::from_account_info(rent_sysvar_info)?;

    // Reporter must sign
    if !reporter_info.is_signer {
        msg!("Reporter did not sign ReportCase");
        return Err(HapiError::SignatureMissing.into());
    }

    assert_reporter_belongs_to_network(network_reporter_info, network_info, &reporter_info.key)?;
    assert_reporter_can_report_address(network_reporter_info)?;

    // Make sure that case ID and account is fine
    assert_is_valid_case(&case_info)?;
    if *case_info.key != get_case_address(network_info.key, &case_id.to_le_bytes()) {
        msg!("Invalid case ID");
        return Err(HapiError::CaseIDMismatch.into());
    }

    assert_is_empty_account(address_info)?;

    let address_data = Address {
        account_type: HapiAccountType::Address,
        risk,
        case_id,
        category,
    };

    create_and_serialize_account_signed::<Address>(
        reporter_info,
        &address_info,
        &address_data,
        &get_address_address_seeds(&network_info.key, value),
        program_id,
        system_info,
        rent,
    )?;

    Ok(())
}
