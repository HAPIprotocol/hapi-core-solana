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
    state::{
        community::{get_community_address_seeds, Community},
        enums::HapiAccountType,
    },
    tools::account::{assert_is_empty_account, create_and_serialize_account_signed},
};

pub fn process_create_community(
    program_id: &Pubkey,
    accounts: &[AccountInfo],
    name: &str,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let authority_info = next_account_info(account_info_iter)?; // 0
    let community_info = next_account_info(account_info_iter)?; // 1
    let system_info = next_account_info(account_info_iter)?; // 2
    let rent_sysvar_info = next_account_info(account_info_iter)?; // 3
    let rent = &Rent::from_account_info(rent_sysvar_info)?;

    // Authority must sign
    if !authority_info.is_signer {
        msg!("Authority did not sign initialization");
        return Err(HapiError::SignatureMissing.into());
    }

    assert_is_empty_account(community_info)?;

    let community_data = Community {
        account_type: HapiAccountType::Community,
        authority: *authority_info.key,
        name: name.to_string(),
    };

    create_and_serialize_account_signed::<Community>(
        authority_info,
        &community_info,
        &community_data,
        &get_community_address_seeds(name),
        program_id,
        system_info,
        rent,
    )?;

    Ok(())
}
