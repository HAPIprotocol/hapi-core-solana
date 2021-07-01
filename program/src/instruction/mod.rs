#![allow(dead_code)]
//! Instruction types

mod network;
pub use network::*;

mod reporter;
pub use reporter::*;

// TODO: describe actors (Authority and Reporter) and their respective program accounts

use {
    borsh::{BorshDeserialize, BorshSerialize},
    solana_program::pubkey::Pubkey,
    std::collections::BTreeSet,
};

use crate::state::enums::{Category, ReporterType};

/// Instructions supported by the HAPI program
#[repr(C)]
#[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize)]
pub enum HapiInstruction {
    /// Creates a new HAPI Network
    ///
    /// 0. `[signer]` Authority account
    /// 1. `[writable]` Network account. PDA seeds: ['network', name]
    /// 2. `[]` System
    /// 3. `[]` Sysvar Rent
    ///
    CreateNetwork {
        /// UTF-8 encoded HAPI Network name
        name: String,
    },

    /// Add reporter to network
    ///
    /// 0. `[signer]` Authority account
    /// 1. `[writable]` Network account
    /// 2. `[]` Reporter account (will be used as signer in address and case reports)
    /// 3. `[writable]` NetworkReporter account. PDA seeds: [`reporter`, network_account, reporter_pubkey]
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
    /// 1. `[]` Network account
    /// 2. `[writable]` NetworkReporter account. PDA seeds: [`reporter`, network_account, reporter_pubkey]
    /// 3. `[]` Reporter account
    ///
    UpdateReporter {
        /// UTF-8 encoded Reporter name
        name: String,

        /// Reporter type
        reporter_type: ReporterType,
    },

    /// Report a new case
    ///
    /// 0. `[signer]` Reporter account
    /// 1. `[writable]` Network account
    /// 2. `[]` NetworkReporter account
    /// 3. `[writable]` Case account. PDA seeds: ['case', network_account, case_id]
    /// 4. `[]` System
    /// 5. `[]` Sysvar Rent
    ///
    ReportCase {
        /// UTF-8 encoded case name
        name: String,

        /// Categories
        categories: BTreeSet<Category>,
    },

    /// Update an existing case
    ///
    /// 0. `[signer]` Reporter account
    /// 1. `[]` Network account
    /// 2. `[]` NetworkReporter account
    /// 3. `[writable]` Case account. PDA seeds: ['case', network_account, case_id]
    ///
    UpdateCase {
        /// Categories
        categories: BTreeSet<Category>,
    },

    /// Report an address for an existing case
    ///
    /// 0. `[signer]` Reporter account
    /// 1. `[]` Network account
    /// 2. `[]` NetworkReporter account
    /// 3. `[]` Case account. PDA seeds: ['case', network_account, case_id]
    /// 4. `[writable]` Address account. PDA seeds: ['address', network_account, address]
    /// 5. `[]` System
    /// 6. `[]` Sysvar Rent
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
