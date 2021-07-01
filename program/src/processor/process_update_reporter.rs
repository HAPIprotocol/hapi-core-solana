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
    state::enums::ReporterType,
    state::network::{assert_is_valid_network, get_network_data},
    state::reporter::{assert_is_valid_reporter, get_reporter_address, get_reporter_data},
};

pub fn process_update_reporter(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: &str,
    reporter_type: ReporterType,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let authority_info = next_account_info(account_info_iter)?; // 0
    let network_info = next_account_info(account_info_iter)?; // 1
    let network_reporter_info = next_account_info(account_info_iter)?; // 2
    let reporter_info = next_account_info(account_info_iter)?; // 3

    // Authority must sign
    if !authority_info.is_signer {
        msg!("Authority did not sign initialization");
        return Err(HapiError::SignatureMissing.into());
    }

    // Authority must match network
    assert_is_valid_network(network_info)?;
    let network_data = get_network_data(network_info)?;
    if *authority_info.key != network_data.authority {
        msg!("Signer does not match network authority");
        return Err(HapiError::InvalidNetworkAuthority.into());
    }

    // Make sure that this is in fact a correct reporter
    assert_is_valid_reporter(network_reporter_info)?;
    let reporter_address = get_reporter_address(network_info.key, reporter_info.key);
    if *network_reporter_info.key != reporter_address {
        msg!("Reporter doesn't match NetworkReporter account");
        return Err(HapiError::InvalidNetworkReporter.into());
    }

    // Update reporter data
    let mut reporter_data = get_reporter_data(network_reporter_info)?;
    reporter_data.name = name.to_string();
    reporter_data.reporter_type = reporter_type;
    reporter_data.serialize(&mut *network_reporter_info.data.borrow_mut())?;

    Ok(())
}
