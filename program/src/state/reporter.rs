//! HAPI Reporter Account

use borsh::{BorshDeserialize, BorshSchema, BorshSerialize};
use solana_program::{
    account_info::AccountInfo, msg, program_error::ProgramError, program_pack::IsInitialized,
    pubkey::Pubkey,
};

use crate::{
    error::HapiError,
    id,
    state::enums::{HapiAccountType, ReporterType},
    tools::account::{assert_is_valid_account, get_account_data, AccountMaxSize},
};

/// HAPI Reporter Account
/// Account PDA seeds: ['reporter', pubkey]
#[repr(C)]
#[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize, BorshSchema)]
pub struct NetworkReporter {
    /// HAPI account type
    pub account_type: HapiAccountType,

    /// Reporter type
    pub reporter_type: ReporterType,

    /// Reporter name
    pub name: String,
}

impl AccountMaxSize for NetworkReporter {}

impl IsInitialized for NetworkReporter {
    fn is_initialized(&self) -> bool {
        self.account_type == HapiAccountType::NetworkReporter
    }
}

/// Checks whether reporter account exists, is initialized and owned by HAPI program
pub fn assert_is_valid_reporter(reporter_info: &AccountInfo) -> Result<(), ProgramError> {
    assert_is_valid_account(reporter_info, HapiAccountType::NetworkReporter, &id())
}

/// Checks network reporter against network and pubkey
pub fn assert_reporter_belongs_to_network(
    network_reporter_info: &AccountInfo,
    network_info: &AccountInfo,
    reporter_pubkey: &Pubkey,
) -> Result<(), ProgramError> {
    assert_is_valid_reporter(network_reporter_info)?;

    let network_reporter_address = get_reporter_address(&network_info.key, &reporter_pubkey);
    if network_reporter_address != *network_reporter_info.key {
        msg!("Reporter doesn't match NetworkReporter account");
        return Err(HapiError::InvalidNetworkReporter.into());
    }

    Ok(())
}

/// Checks reporter's ability to report an address
pub fn assert_reporter_can_report_address(
    network_reporter_info: &AccountInfo,
) -> Result<(), ProgramError> {
    let network_reporter_data = get_reporter_data(&network_reporter_info)?;
    if network_reporter_data.reporter_type == ReporterType::Inactive {
        msg!("Reporter doesn't have a permission to report an address in this network");
        return Err(HapiError::ReportingNotPermitted.into());
    }

    Ok(())
}

/// Checks reporter's ability to update the case
pub fn assert_reporter_can_update_case(
    reporter_info: &AccountInfo,
    network_reporter_info: &AccountInfo,
    case_reporter: &Pubkey,
) -> Result<(), ProgramError> {
    let reporter_data = get_reporter_data(&network_reporter_info)?;

    match reporter_data.reporter_type {
        ReporterType::Authority => Ok(()),
        ReporterType::Full => {
            if case_reporter != reporter_info.key {
                msg!("Reporter doesn't have a permission to update this case");
                return Err(HapiError::InvalidReporterPermissions.into());
            }
            Ok(())
        }
        _ => {
            msg!("Reporter doesn't have a permission to update this case");
            Err(HapiError::InvalidReporterPermissions.into())
        }
    }
}

/// Checks reporter's ability to report cases
pub fn assert_reporter_can_report_case(network_reporter_info: &AccountInfo) -> Result<(), ProgramError> {
    let reporter_data = get_reporter_data(&network_reporter_info)?;

    match reporter_data.reporter_type {
        ReporterType::Authority | ReporterType::Full => Ok(()),
        _ => {
            msg!("Reporter doesn't have a permission to report a case");
            Err(HapiError::InvalidReporterPermissions.into())
        }
    }
}

/// Deserializes account and checks owner program
pub fn get_reporter_data(reporter_info: &AccountInfo) -> Result<NetworkReporter, ProgramError> {
    get_account_data::<NetworkReporter>(reporter_info, &id())
}

/// Returns Reporter PDA seeds
pub fn get_reporter_address_seeds<'a>(network: &'a Pubkey, pubkey: &'a Pubkey) -> [&'a [u8]; 3] {
    [b"reporter", network.as_ref(), pubkey.as_ref()]
}

/// Returns Reporter PDA address
pub fn get_reporter_address<'a>(network: &'a Pubkey, pubkey: &'a Pubkey) -> Pubkey {
    Pubkey::find_program_address(&get_reporter_address_seeds(network, pubkey), &id()).0
}
