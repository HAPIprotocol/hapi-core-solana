export enum HapiAccountType {
  Uninitialized,
  Community,
  Network,
  Reporter,
  Case,
  Address,
}

export enum ReporterType {
  Inactive,
  Tracer,
  Full,
  Authority,
}

export enum Category {
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
