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
    state::enums::HapiAccountType,
    state::network::get_network_address_seeds,
    state::network::Network,
    tools::account::{assert_is_empty_account, create_and_serialize_account_signed},
};

pub fn process_create_network(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: &str,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let authority_info = next_account_info(account_info_iter)?; // 0
    let network_info = next_account_info(account_info_iter)?; // 1
    let community_info = next_account_info(account_info_iter)?; // 2
    let system_info = next_account_info(account_info_iter)?; // 3
    let rent_sysvar_info = next_account_info(account_info_iter)?; // 4
    let rent = &Rent::from_account_info(rent_sysvar_info)?;

    // Authority must sign
    if !authority_info.is_signer {
        msg!("Authority did not sign initialization");
        return Err(HapiError::SignatureMissing.into());
    }

    assert_is_valid_community(community_info)?;
    assert_is_empty_account(network_info)?;

    let community_data = get_community_data(community_info)?;
    if *authority_info.key != community_data.authority {
        msg!("Payer is not the authority of the network");
        return Err(HapiError::InvalidNetworkAuthority.into());
    }

    let network_data = Network {
        account_type: HapiAccountType::Network,
        name: name.to_string(),
    };

    create_and_serialize_account_signed::<Network>(
        authority_info,
        &network_info,
        &network_data,
        &get_network_address_seeds(&community_info.key, &name),
        program_id,
        system_info,
        rent,
    )?;

    Ok(())
}
