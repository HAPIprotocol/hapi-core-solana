#![allow(dead_code)]
//! Instruction types

mod authority;
pub use authority::*;

mod reporter;
pub use reporter::*;

// TODO: describe actors (Authority and Reporter) and their respective program accounts

use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::pubkey::Pubkey,
};

use crate::state::enums::{Category, CategorySet, ReporterType};

/// Instructions supported by the HAPI program
#[repr(C)]
#[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize)]
pub enum HapiInstruction {
    /// Creates a new HAPI Community
    ///
    /// 0. `[signer]` Authority account
    /// 1. `[writable]` Community account. PDA seeds: ['community', name]
    /// 2. `[]` System
    /// 3. `[]` Sysvar Rent
    ///
    CreateCommunity {
        /// UTF-8 encoded HAPI Community name
        name: String,
    },

    /// Creates a new HAPI Network
    ///
    /// 0. `[signer]` Authority account
    /// 1. `[]` Community account. PDA seeds: ['community', name]
    /// 2. `[writable]` Network account. PDA seeds: ['network', community_address, network_name]
    /// 3. `[]` System
    /// 4. `[]` Sysvar Rent
    ///
    CreateNetwork {
        /// UTF-8 encoded HAPI Network name
        name: String,
    },

    /// Add reporter to network
    ///
    /// 0. `[signer]` Authority account
    /// 1. `[]` Community account. PDA seeds: ['community', name]
    /// 2. `[]` Reporter key (will be used as signer in address and case reports)
    /// 3. `[writable]` Reporter account. PDA seeds: [`reporter`, community_address, reporter_pubkey]
    /// 4. `[]` System
    /// 5. `[]` Sysvar Rent
    ///
    AddReporter {
        /// UTF-8 encoded Reporter name
        name: String,

        /// Reporter type
        reporter_type: ReporterType,
    },

    /// Update reporter name and type
    ///
    /// 0. `[signer]` Authority account
    /// 1. `[]` Community account. PDA seeds: ['community', name]
    /// 2. `[writable]` Reporter account. PDA seeds: [`reporter`, community_address, reporter_pubkey]
    /// 3. `[]` Reporter key
    ///
    UpdateReporter {
        /// UTF-8 encoded Reporter name
        name: String,

        /// Reporter type
        reporter_type: ReporterType,
    },

    /// Report a new case
    ///
    /// 0. `[signer]` Reporter key
    /// 1. `[writable]` Network account
    /// 2. `[]` Reporter account
    /// 3. `[writable]` Case account. PDA seeds: ['case', network_account, case_id]
    /// 4. `[]` System
    /// 5. `[]` Sysvar Rent
    ///
    ReportCase {
        /// UTF-8 encoded case name
        name: String,

        /// Categories
        categories: CategorySet,
    },

    /// Update an existing case
    ///
    /// 0. `[signer]` Reporter key
    /// 1. `[]` Network account
    /// 2. `[]` Reporter account
    /// 3. `[writable]` Case account. PDA seeds: ['case', network_account, case_id]
    ///
    UpdateCase {
        /// Categories
        categories: CategorySet,
    },

    /// Report an address for an existing case
    ///
    /// 0. `[signer]` Reporter key
    /// 1. `[]` Community account
    /// 2. `[]` Network account
    /// 3. `[]` Reporter account
    /// 4. `[]` Case account. PDA seeds: ['case', network_account, case_id]
    /// 5. `[writable]` Address account. PDA seeds: ['address', network_account, address]
    /// 6. `[]` System
    /// 7. `[]` Sysvar Rent
    ///
    ReportAddress {
        /// Address value
        address: Pubkey,

        /// Address risk score: 0 is safe, 10 is maximum risk
        risk: u8,

        /// Case ID
        case_id: u64,

        /// Category
        category: Category,
    },

    /// Update an existing address
    UpdateAddress {
        /// Address risk score: 0 is safe, 10 is maximum risk
        risk: u8,

        /// Case ID
        case_id: u64,

        /// Category
        category: Category,
    },
}
