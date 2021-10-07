use solana_program::{
    account_info::{next_account_info, AccountInfo},
    entrypoint::ProgramResult,
    msg,
    pubkey::Pubkey,
};

use crate::{
    error::HapiError,
    state::{
        community::{assert_is_valid_community, get_community_data},
        network::{assert_is_valid_network, get_network_address, get_network_data},
    },
};
pub fn process_update_network(_program_id: &Pubkey, accounts: &[AccountInfo]) -> ProgramResult {
    let account_info_iter = &mut accounts.iter();
    let authority_info = next_account_info(account_info_iter)?; // 0
    let community_info = next_account_info(account_info_iter)?; // 1
    let network_info = next_account_info(account_info_iter)?; // 2

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

    assert_is_valid_network(network_info)?;
    let network_data = get_network_data(network_info)?;
    let network_address = get_network_address(community_info.key, &network_data.name);
    if *network_info.key != network_address {
        msg!("Network doesn't match Network account");
        return Err(HapiError::InvalidReporter.into());
    }

    Err(HapiError::NotImplemented.into())
}
