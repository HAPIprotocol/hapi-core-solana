use borsh::BorshSerialize;
use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

use crate::{
    error::HapiError,
    state::address::{assert_is_valid_address, get_address_data},
    state::case::{assert_is_valid_case, get_case_address},
    state::enums::Category,
    state::reporter::{assert_reporter_belongs_to_network, assert_reporter_can_report_address},
};

pub fn process_update_address(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
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

    // Reporter must sign
    if !reporter_info.is_signer {
        msg!("Reporter did not sign ReportCase");
        return Err(HapiError::SignatureMissing.into());
    }

    assert_reporter_belongs_to_network(network_reporter_info, network_info, &reporter_info.key)?;
    assert_reporter_can_report_address(network_reporter_info)?;

    // TODO: check if reporter can update this address

    // Make sure that case ID and account is fine
    assert_is_valid_case(&case_info)?;
    if *case_info.key != get_case_address(network_info.key, &case_id.to_le_bytes()) {
        msg!("Invalid case ID");
        return Err(HapiError::CaseIDMismatch.into());
    }

    assert_is_valid_address(address_info)?;

    // Update address data
    let mut address_data = get_address_data(address_info)?;
    address_data.case_id = case_id;
    address_data.category = category;
    address_data.risk = risk;
    address_data.serialize(&mut *network_reporter_info.data.borrow_mut())?;

    Ok(())
}
