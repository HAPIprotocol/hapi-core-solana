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

  // Tier 4 - Severe risk
  /// Terrorist financing
  TerroristFinancing = 32768,

  /// Sanctions
  Sanctions = 65536,

  /// Child abuse and porn materials
  ChildAbuse = 131072,
}

export const Categories = [
  Category.Safe,
  Category.WalletService,
  Category.MerchantService,
  Category.MiningPool,
  Category.LowRiskExchange,
  Category.MediumRiskExchange,
  Category.DeFi,
  Category.OTCBroker,
  Category.ATM,
  Category.Gambling,
  Category.IllicitOrganization,
  Category.Mixer,
  Category.DarknetService,
  Category.Scam,
  Category.Ransomware,
  Category.Theft,
  Category.TerroristFinancing,
  Category.Sanctions,
  Category.ChildAbuse,
];
