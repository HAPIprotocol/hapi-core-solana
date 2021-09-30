//! State enumerations
use {
    borsh::{BorshDeserialize, BorshSchema, BorshSerialize},
    std::{collections::BTreeMap, ops::BitOr},
};

/// Defines all HAPI accounts types
#[repr(C)]
#[derive(
    Clone, Debug, PartialEq, Eq, Ord, PartialOrd, BorshDeserialize, BorshSerialize, BorshSchema,
)]
pub enum HapiAccountType {
    /// Default uninitialized account state
    Uninitialized,

    /// HAPI community account
    Community,

    /// HAPI network account
    Network,

    /// Reporter account
    Reporter,

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

/// Case category
#[repr(u32)]
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
    Safe = 0,

    // Tier 1 - Low risk
    /// Wallet service - custodial or mixed wallets
    WalletService = 1,

    /// Merchant service
    MerchantService = 2,

    /// Mining pool
    MiningPool = 4,

    /// Exchange (Low Risk) - Exchange with high KYC standards
    LowRiskExchange = 8,

    // Tier 2 - Medium risk
    /// Exchange (Medium Risk)
    MediumRiskExchange = 16,

    /// DeFi application
    DeFi = 32,

    /// OTC Broker
    OTCBroker = 64,

    /// Cryptocurrency ATM
    ATM = 128,

    /// Gambling
    Gambling = 256,

    // Tier 3 - High risk
    /// Illicit organization
    IllicitOrganization = 512,

    /// Mixer
    Mixer = 1024,

    /// Darknet market or service
    DarknetService = 2048,

    /// Scam
    Scam = 4096,

    /// Ransomware
    Ransomware = 8192,

    /// Theft - stolen funds
    Theft = 16384,

    /// Counterfeit - fake assets
    Counterfeit = 32768,

    // Tier 4 - Severe risk
    /// Terrorist financing
    TerroristFinancing = 65536,

    /// Sanctions
    Sanctions = 131072,

    /// Child abuse and porn materials
    ChildAbuse = 262144,
}

/// A set bitmasked set of categories
pub type CategorySet = u32;

/// Bitmast functions trait for category set
pub trait CategorySetBitmask {
    /// Checks if category set contains the category
    fn contains(self, category: Category) -> bool;
}

impl CategorySetBitmask for CategorySet {
    fn contains(self, category: Category) -> bool {
        self & category as u32 != 0
    }
}

impl Default for Category {
    fn default() -> Self {
        Category::Safe
    }
}

impl BitOr for Category {
    type Output = CategorySet;

    // rhs is the "right-hand side" of the expression `a | b`
    fn bitor(self, rhs: Self) -> Self::Output {
        self as CategorySet | rhs as CategorySet
    }
}

impl BitOr<Category> for CategorySet {
    type Output = CategorySet;

    // rhs is the "right-hand side" of the expression `a | b`
    fn bitor(self, rhs: Category) -> Self::Output {
        self as CategorySet | rhs as CategorySet
    }
}

impl BitOr<CategorySet> for Category {
    type Output = CategorySet;

    // rhs is the "right-hand side" of the expression `a | b`
    fn bitor(self, rhs: CategorySet) -> Self::Output {
        self as CategorySet | rhs as CategorySet
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
        map.insert(Category::Counterfeit, false);
        map.insert(Category::TerroristFinancing, false);
        map.insert(Category::Sanctions, false);
        map.insert(Category::ChildAbuse, false);

        map
    }
}
