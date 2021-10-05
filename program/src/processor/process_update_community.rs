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
};

pub fn process_update_community(
    _program_id: &Pubkey,
    accounts: &[AccountInfo],
    new_name: &str,
) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let authority_info = next_account_info(account_info_iter)?; // 0
    let community_info = next_account_info(account_info_iter)?; // 1
    let new_authority_info = next_account_info(account_info_iter); // 2

    if new_name.len() > 32 {
        msg!("Community name must not exceed 32 bytes");
        return Err(HapiError::NameTooLong.into());
    }

    // Authority must sign
    if !authority_info.is_signer {
        msg!("Authority did not sign initialization");
        return Err(HapiError::SignatureMissing.into());
    }

    // Authority must match community
    assert_is_valid_community(community_info)?;
    let mut community_data = get_community_data(community_info)?;
    if *authority_info.key != community_data.authority {
        msg!("Signer does not match community authority");
        return Err(HapiError::InvalidNetworkAuthority.into());
    }

    // Update community data
    community_data.name = new_name.to_string();

    // If new authority account is supplemented, update it
    if let Ok(info) = new_authority_info {
        community_data.authority = *info.key;
    }

    community_data.serialize(&mut *community_info.data.borrow_mut())?;

    Ok(())
}
