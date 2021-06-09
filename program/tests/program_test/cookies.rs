use solana_program::pubkey::Pubkey;

use hapi_core_solana::state::{network::Network};

#[derive(Debug)]
pub struct NetworkCookie {
    pub address: Pubkey,
    pub account: Network,
}
