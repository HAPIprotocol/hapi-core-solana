//! Utility functions

pub mod account;

use thiserror::Error;

/// Parse error for parsing of "community_name/network_name" format
#[derive(Error, Debug)]
pub enum NetworkParseError {
    #[error("Community name not found")]
    /// Community name not found
    InvalidCommunityName,

    #[error("Network name not found")]
    /// Network name not found
    InvalidNetworkName,
}

/// Parse a string "community_name/network_name" to a tuple
pub fn parse_network_path(path: &str) -> Result<(String, String), NetworkParseError> {
    let mut path = path.splitn(2, '/');

    let community_name = match path.next() {
        Some(name) => name,
        None => return Err(NetworkParseError::InvalidCommunityName),
    };

    let network_name = match path.next() {
        Some(name) => name,
        None => return Err(NetworkParseError::InvalidNetworkName),
    };

    Ok((community_name.to_string(), network_name.to_string()))
}
