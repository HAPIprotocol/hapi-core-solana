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
    state::community::{assert_is_valid_community, get_community_data},
    state::enums::ReporterType,
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
    let community_info = next_account_info(account_info_iter)?; // 1
    let reporter_info = next_account_info(account_info_iter)?; // 2
    let reporter_key_info = next_account_info(account_info_iter)?; // 3

    // Authority must sign
    if !authority_info.is_signer {
        msg!("Authority did not sign initialization");
        return Err(HapiError::SignatureMissing.into());
    }

    // Authority must match community
    assert_is_valid_community(community_info)?;
    let community_data = get_community_data(community_info)?;
    if *authority_info.key != community_data.authority {
        msg!("Signer does not match community authority");
        return Err(HapiError::InvalidNetworkAuthority.into());
    }

    // Make sure that this is in fact a correct reporter
    assert_is_valid_reporter(reporter_info)?;
    let reporter_address = get_reporter_address(community_info.key, reporter_key_info.key);
    if *reporter_info.key != reporter_address {
        msg!("Reporter doesn't match Reporter account");
        return Err(HapiError::InvalidReporter.into());
    }

    // Update reporter data
    let mut reporter_data = get_reporter_data(reporter_info)?;
    reporter_data.name = name.to_string();
    reporter_data.reporter_type = reporter_type;
    reporter_data.serialize(&mut *reporter_info.data.borrow_mut())?;

    Ok(())
}
