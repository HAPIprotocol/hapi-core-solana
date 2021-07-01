use {
    hapi_core_solana::state::{
        address::Address, case::Case, enums::ReporterType, network::Network,
        reporter::NetworkReporter,
    },
    solana_program::pubkey::Pubkey,
    solana_sdk::signature::Keypair,
};

#[derive(Debug)]
pub struct NetworkCookie {
    pub address: Pubkey,
    pub account: Network,
    pub name: String,
}

#[derive(Debug)]
pub struct NetworkReporterCookie {
    pub address: Pubkey,
    pub account: NetworkReporter,
    pub network_address: Pubkey,
    pub reporter_keypair: Keypair,
    pub reporter_type: ReporterType,
    pub name: String,
}

#[derive(Debug)]
pub struct CaseCookie {
    pub address: Pubkey,
    pub account: Case,
    pub network_account: Pubkey,
    pub name: String,
    pub id: u64,
}

#[derive(Debug)]
pub struct AddressCookie {
    pub address: Pubkey,
    pub account: Address,
    pub value: Pubkey,
}
