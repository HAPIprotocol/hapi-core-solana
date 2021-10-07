//! Error types

use {
    num_derive::FromPrimitive,
    solana_program::{
        decode_error::DecodeError,
        msg,
        program_error::{PrintProgramError, ProgramError},
    },
    thiserror::Error,
};

/// Generic error type
pub type GenericError = Box<dyn std::error::Error>;

/// Errors that may be returned by the HAPI program
#[derive(Clone, Debug, Eq, Error, FromPrimitive, PartialEq)]
pub enum HapiError {
    /// Lamport balance below rent-exempt threshold
    #[error("Lamport balance below rent-exempt threshold")]
    NotRentExempt,

    /// Insufficient funds for the operation requested
    #[error("Insufficient funds")]
    InsufficientFunds,

    /// Invalid instruction
    #[error("Invalid instruction")]
    InvalidInstruction,

    /// The account cannot be initialized because it is already being used
    #[error("Already in use")]
    AlreadyInUse,

    /// Required signature is missing
    #[error("SignatureMissing")]
    SignatureMissing,

    /// Invalid case ID for a network
    #[error("CaseIDMismatch")]
    CaseIDMismatch,

    /// Invalid network authority
    #[error("InvalidNetworkAuthority")]
    InvalidNetworkAuthority,

    /// Invalid network reporter
    #[error("InvalidReporter")]
    InvalidReporter,

    /// This reporter has no permission to report
    #[error("ReportingNotPermitted")]
    ReportingNotPermitted,

    /// This reporter has no permissions to operate this way
    #[error("InvalidReporterPermissions")]
    InvalidReporterPermissions,

    /// Name of this entity is too long
    #[error("NameTooLong")]
    NameTooLong,

    /// Not implemented
    #[error("NotImplemented")]
    NotImplemented,

    /// ---- Account Tools Errors ----

    /// Invalid account owner
    #[error("Invalid account owner")]
    InvalidAccountOwner,

    /// Invalid Account type
    #[error("Invalid Account type")]
    InvalidAccountType,
}

impl From<HapiError> for ProgramError {
    fn from(e: HapiError) -> Self {
        ProgramError::Custom(e as u32)
    }
}

impl<T> DecodeError<T> for HapiError {
    fn type_of() -> &'static str {
        "HapiError"
    }
}

impl PrintProgramError for HapiError {
    fn print<E>(&self) {
        msg!("HAPI-ERROR: {}", &self.to_string());
    }
}
