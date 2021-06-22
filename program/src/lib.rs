#![deny(missing_docs)]

//! HAPI core smart contract for the Solana blockchain

pub mod entrypoint;
pub mod error;
pub mod instruction;
pub mod processor;
pub mod state;
pub mod tools;

pub use solana_program;

solana_program::declare_id!("hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7");
