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
    state::enums::{HapiAccountType, ReporterType},
    state::network::{assert_is_valid_network, get_network_data},
    state::reporter::get_reporter_address_seeds,
    state::reporter::NetworkReporter,
    tools::account::{assert_is_empty_account, create_and_serialize_account_signed},
};

pub fn process_add_reporter(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: &str,
    reporter_type: ReporterType,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let authority_info = next_account_info(account_info_iter)?; // 0
    let network_info = next_account_info(account_info_iter)?; // 1
    let reporter_info = next_account_info(account_info_iter)?; // 2
    let network_reporter_info = next_account_info(account_info_iter)?; // 3
    let system_info = next_account_info(account_info_iter)?; // 4
    let rent_sysvar_info = next_account_info(account_info_iter)?; // 5
    let rent = &Rent::from_account_info(rent_sysvar_info)?;

    // Authority must sign
    if !authority_info.is_signer {
        msg!("Payer did not sign");
        return Err(HapiError::SignatureMissing.into());
    }

    // Authority must match network record
    assert_is_valid_network(network_info)?;
    let network_data = get_network_data(network_info)?;
    if network_data.authority != *authority_info.key {
        msg!("Payer is not authority of the network");
        return Err(HapiError::InvalidNetworkAuthority.into());
    }

    assert_is_empty_account(network_reporter_info)?;

    let network_reporter_data = NetworkReporter {
        account_type: HapiAccountType::NetworkReporter,
        name: name.to_string(),
        reporter_type,
    };

    create_and_serialize_account_signed::<NetworkReporter>(
        authority_info,
        &network_reporter_info,
        &network_reporter_data,
        &get_reporter_address_seeds(network_info.key, reporter_info.key),
        program_id,
        system_info,
        rent,
    )?;

    Ok(())
}
