//! HAPI Community Account

use {
    borsh::{BorshDeserialize, BorshSchema, BorshSerialize},
    solana_program::{
        account_info::AccountInfo, program_error::ProgramError, program_pack::IsInitialized,
        pubkey::Pubkey,
    },
};

use crate::{
    id,
    state::enums::HapiAccountType,
    tools::account::{assert_is_valid_account, get_account_data, AccountMaxSize},
};

/// HAPI Community Account
/// Account PDA seeds: ['community', name]
#[repr(C)]
#[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize, BorshSchema)]
pub struct Community {
    /// HAPI account type
    pub account_type: HapiAccountType,

    /// HAPI authority account
    pub authority: Pubkey,

    /// HAPI community name
    pub name: String,
}

impl AccountMaxSize for Community {}

impl IsInitialized for Community {
    fn is_initialized(&self) -> bool {
        self.account_type == HapiAccountType::Community
    }
}

/// Checks whether community account exists, is initialized and owned by HAPI program
pub fn assert_is_valid_community(community_info: &AccountInfo) -> Result<(), ProgramError> {
    assert_is_valid_account(community_info, HapiAccountType::Community, &id())
}

/// Deserializes account and checks owner program
pub fn get_community_data(community_info: &AccountInfo) -> Result<Community, ProgramError> {
    get_account_data::<Community>(community_info, &id())
}

/// Returns Community PDA seeds
pub fn get_community_address_seeds(name: &str) -> [&[u8]; 2] {
    [b"community", &name.as_bytes()]
}

/// Returns Community PDA address
pub fn get_community_address(name: &str) -> Pubkey {
    Pubkey::find_program_address(&get_community_address_seeds(&name), &id()).0
}
