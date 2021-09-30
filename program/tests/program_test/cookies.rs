use {
    hapi_core_solana::state::{
        address::Address, case::Case, community::Community, enums::ReporterType, network::Network,
        reporter::Reporter,
    },
    solana_program::pubkey::Pubkey,
    solana_sdk::signature::Keypair,
};

#[derive(Debug)]
pub struct CommunityCookie {
    pub address: Pubkey,
    pub account: Community,
    pub name: String,
}

#[derive(Debug)]
pub struct NetworkCookie {
    pub address: Pubkey,
    pub account: Network,
    pub name: String,
}

#[derive(Debug)]
pub struct ReporterCookie {
    pub address: Pubkey,
    pub account: Reporter,
    pub community_address: Pubkey,
    pub reporter_keypair: Keypair,
    pub reporter_type: ReporterType,
    pub name: String,
}

#[derive(Debug)]
pub struct CaseCookie {
    pub address: Pubkey,
    pub account: Case,
    pub name: String,
    pub id: u64,
}

#[derive(Debug)]
pub struct AddressCookie {
    pub address: Pubkey,
    pub account: Address,
    pub value: Pubkey,
}
