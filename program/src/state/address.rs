//! HAPI Address Account

use {
    borsh::{BorshDeserialize, BorshSchema, BorshSerialize},
    solana_program::{
        account_info::AccountInfo, program_error::ProgramError, program_pack::IsInitialized,
        pubkey::Pubkey,
    },
};

use crate::{
    id,
    state::enums::{Category, HapiAccountType},
    tools::account::{assert_is_valid_account, get_account_data, AccountMaxSize},
};

/// HAPI Address Account.
/// Account PDA seeds: ['address', network_name, address]
#[repr(C)]
#[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize, BorshSchema)]
pub struct Address {
    /// HAPI account type
    pub account_type: HapiAccountType,

    /// Risk score
    pub risk: u8,

    /// Case ID
    pub case_id: u64,

    /// Category
    pub category: Category,
}

impl AccountMaxSize for Address {
    fn get_max_size(&self) -> Option<usize> {
        Some(
            std::mem::size_of::<u8>()
                + std::mem::size_of::<u8>()
                + std::mem::size_of::<u64>()
                + std::mem::size_of::<u8>(),
        )
    }
}

impl IsInitialized for Address {
    fn is_initialized(&self) -> bool {
        self.account_type == HapiAccountType::Address
    }
}

/// Checks whether address account exists, is initialized and owned by HAPI program
pub fn assert_is_valid_address(address_info: &AccountInfo) -> Result<(), ProgramError> {
    assert_is_valid_account(address_info, HapiAccountType::Address, &id())
}

/// Deserializes account and checks owner program
pub fn get_address_data(address_info: &AccountInfo) -> Result<Address, ProgramError> {
    get_account_data::<Address>(address_info, &id())
}

/// Returns Address PDA seeds
pub fn get_address_address_seeds<'a>(network: &'a Pubkey, address: &'a Pubkey) -> [&'a [u8]; 3] {
    [b"address", &network.as_ref(), &address.as_ref()]
}

/// Returns Address PDA address
pub fn get_address_address<'a>(network: &'a Pubkey, address: &'a Pubkey) -> Pubkey {
    Pubkey::find_program_address(&get_address_address_seeds(&network, &address), &id()).0
}
