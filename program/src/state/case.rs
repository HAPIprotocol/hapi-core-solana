//! HAPI Case Account

use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::{
        account_info::AccountInfo, program_error::ProgramError, program_pack::IsInitialized,
        pubkey::Pubkey,
    },
};

use crate::{
    id,
    state::enums::{CategorySet, HapiAccountType},
    tools::account::{assert_is_valid_account, get_account_data, AccountMaxSize},
};

/// HAPI Case Account
/// Account PDA seeds: ['case', community_address, case_id]
#[repr(C)]
#[derive(Clone, Debug, PartialEq, PartialOrd, BorshDeserialize, BorshSerialize)]
pub struct Case {
    /// HAPI account type
    pub account_type: HapiAccountType,

    /// Case reporter key
    pub reporter_key: Pubkey,

    /// Categories bitmask
    pub categories: CategorySet,

    /// Case name
    pub name: String,
}

impl AccountMaxSize for Case {
    fn get_max_size(&self) -> Option<usize> {
        Some(
            std::mem::size_of::<u8>()
                + std::mem::size_of::<u8>()
                + std::mem::size_of::<Pubkey>()
                + std::mem::size_of::<u32>()
                + 32,
        )
    }
}

impl IsInitialized for Case {
    fn is_initialized(&self) -> bool {
        self.account_type == HapiAccountType::Case
    }
}

/// Checks whether case account exists, is initialized and owned by HAPI program
pub fn assert_is_valid_case(case_info: &AccountInfo) -> Result<(), ProgramError> {
    assert_is_valid_account(case_info, HapiAccountType::Case, &id())
}

/// Deserializes account and checks owner program
pub fn get_case_data(case_info: &AccountInfo) -> Result<Case, ProgramError> {
    get_account_data::<Case>(case_info, &id())
}

/// Returns Case PDA seeds
pub fn get_case_address_seeds<'a>(
    community_address: &'a Pubkey,
    case_id_le_bytes: &'a [u8],
) -> [&'a [u8]; 3] {
    [b"case", &community_address.as_ref(), &case_id_le_bytes]
}

/// Returns Case PDA address
pub fn get_case_address<'a>(community_address: &'a Pubkey, case_id_le_bytes: &'a [u8]) -> Pubkey {
    Pubkey::find_program_address(
        &get_case_address_seeds(&community_address, &case_id_le_bytes),
        &id(),
    )
    .0
}
