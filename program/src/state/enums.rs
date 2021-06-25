//! State enumerations

use borsh::{BorshDeserialize, BorshSchema, BorshSerialize};
use std::{collections::BTreeMap, str::FromStr};

/// Defines all HAPI accounts types
#[repr(C)]
#[derive(
    Clone, Debug, PartialEq, Eq, Ord, PartialOrd, BorshDeserialize, BorshSerialize, BorshSchema,
)]
pub enum HapiAccountType {
    /// Default uninitialized account state
    Uninitialized,

    /// HAPI network account
    Network,

    /// Network reporter account
    NetworkReporter,

    /// Case account
    Case,

    /// Address account
    Address,
}

impl Default for HapiAccountType {
    fn default() -> Self {
        HapiAccountType::Uninitialized
    }
}

/// Reporter type
#[repr(C)]
#[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize, BorshSchema)]
pub enum ReporterType {
    /// Inactive reporter
    Inactive,

    /// Tracer - can report addresses
    Tracer,

    /// Full - can report cases and addresses
    Full,

    /// Authority - can modify cases and addresses
    Authority,
}

impl Default for ReporterType {
    fn default() -> Self {
        ReporterType::Inactive
    }
}

impl FromStr for ReporterType {
    type Err = ();

    fn from_str(input: &str) -> Result<ReporterType, Self::Err> {
        match input {
            "Inactive" => Ok(ReporterType::Inactive),
            "Tracer" => Ok(ReporterType::Tracer),
            "Full" => Ok(ReporterType::Full),
            "Authority" => Ok(ReporterType::Authority),
            _ => Err(()),
        }
    }
}

/// Case category
#[repr(u8)]
#[derive(
    Copy,
    Clone,
    Debug,
    Eq,
    Hash,
    PartialEq,
    PartialOrd,
    Ord,
    BorshDeserialize,
    BorshSerialize,
    BorshSchema,
)]
pub enum Category {
    // Tier 0
    /// Safe
    Safe,

    // Tier 1 - Low risk
    /// Wallet service - custodial or mixed wallets
    WalletService,

    /// Merchant service
    MerchantService,

    /// Mining pool
    MiningPool,

    /// Exchange (Low Risk) - Exchange with high KYC standards
    LowRiskExchange,

    // Tier 2 - Medium risk
    /// Exchange (Medium Risk)
    MediumRiskExchange,

    /// DeFi application
    DeFi,

    /// OTC Broker
    OTCBroker,

    /// Cryptocurrency ATM
    ATM,

    /// Gambling
    Gambling,

    // Tier 3 - High risk
    /// Illicit organization
    IllicitOrganization,

    /// Mixer
    Mixer,

    /// Darknet market or service
    DarknetService,

    /// Scam
    Scam,

    /// Ransomware
    Ransomware,

    /// Theft - stolen funds
    Theft,

    // Tier 4 - Severe risk
    /// Terrorist financing
    TerroristFinancing,

    /// Sanctions
    Sanctions,

    /// Child abuse and porn materials
    ChildAbuse,
}

impl Default for Category {
    fn default() -> Self {
        Category::Safe
    }
}

impl Category {
    /// Create a blank map of categories
    pub fn new_map() -> BTreeMap<Category, bool> {
        let mut map: BTreeMap<Category, bool> = BTreeMap::new();

        map.insert(Category::Safe, false);
        map.insert(Category::WalletService, false);
        map.insert(Category::MerchantService, false);
        map.insert(Category::MiningPool, false);
        map.insert(Category::LowRiskExchange, false);
        map.insert(Category::MediumRiskExchange, false);
        map.insert(Category::DeFi, false);
        map.insert(Category::OTCBroker, false);
        map.insert(Category::ATM, false);
        map.insert(Category::Gambling, false);
        map.insert(Category::IllicitOrganization, false);
        map.insert(Category::Mixer, false);
        map.insert(Category::DarknetService, false);
        map.insert(Category::Scam, false);
        map.insert(Category::Ransomware, false);
        map.insert(Category::Theft, false);
        map.insert(Category::TerroristFinancing, false);
        map.insert(Category::Sanctions, false);
        map.insert(Category::ChildAbuse, false);

        map
    }
}
