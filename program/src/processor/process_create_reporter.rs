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
    state::community::{assert_is_valid_community, get_community_data},
    state::enums::{HapiAccountType, ReporterType},
    state::reporter::get_reporter_address_seeds,
    state::reporter::Reporter,
    tools::account::{assert_is_empty_account, create_and_serialize_account_signed},
};

pub fn process_create_reporter(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: &str,
    reporter_type: ReporterType,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let authority_info = next_account_info(account_info_iter)?; // 0
    let community_info = next_account_info(account_info_iter)?; // 1
    let reporter_key_info = next_account_info(account_info_iter)?; // 2
    let reporter_info = next_account_info(account_info_iter)?; // 3
    let system_info = next_account_info(account_info_iter)?; // 4
    let rent_sysvar_info = next_account_info(account_info_iter)?; // 5
    let rent = &Rent::from_account_info(rent_sysvar_info)?;

    if name.len() > 32 {
        msg!("Reporter name must not exceed 32 bytes");
        return Err(HapiError::NameTooLong.into());
    }

    // Authority must sign
    if !authority_info.is_signer {
        msg!("Payer did not sign");
        return Err(HapiError::SignatureMissing.into());
    }

    // Authority must match community record
    assert_is_valid_community(community_info)?;
    let community_data = get_community_data(community_info)?;
    if community_data.authority != *authority_info.key {
        msg!("Payer is not the authority of the community");
        return Err(HapiError::InvalidNetworkAuthority.into());
    }

    assert_is_empty_account(reporter_info)?;

    let reporter_data = Reporter {
        account_type: HapiAccountType::Reporter,
        name: name.to_string(),
        reporter_type,
    };

    create_and_serialize_account_signed::<Reporter>(
        authority_info,
        &reporter_info,
        &reporter_data,
        &get_reporter_address_seeds(community_info.key, reporter_key_info.key),
        program_id,
        system_info,
        rent,
    )?;

    Ok(())
}
