//! State enumerations

use borsh::{BorshDeserialize, BorshSchema, BorshSerialize};

/// Defines all HAPI accounts types
#[repr(C)]
#[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize, BorshSchema)]
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

/// Case category
#[repr(C)]
#[derive(Clone, Debug, PartialEq, BorshDeserialize, BorshSerialize, BorshSchema)]
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
