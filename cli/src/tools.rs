use {
  hapi_core_solana::state::enums::{Category, ReporterType},
  solana_client::rpc_client::RpcClient,
  solana_program::program_error::ProgramError,
  solana_sdk::pubkey::Pubkey,
  std::collections::BTreeSet,
};

pub fn assert_is_empty_account(
  rpc_client: &RpcClient,
  account_address: &Pubkey,
) -> Result<(), Box<dyn std::error::Error>> {
  match rpc_client.get_account(account_address) {
    Ok(_) => Err(ProgramError::AccountAlreadyInitialized.into()),
    Err(_) => Ok(()),
  }
}

pub fn assert_is_existing_account(
  rpc_client: &RpcClient,
  account_address: &Pubkey,
) -> Result<(), Box<dyn std::error::Error>> {
  match rpc_client.get_account(account_address) {
    Ok(_) => Ok(()),
    Err(_) => Err(ProgramError::UninitializedAccount.into()),
  }
}

pub const REPORTER_TYPE_VALUES: &[&str] = &["Inactive", "Tracer", "Full", "Authority"];

pub fn reporter_type_from_string(input: &str) -> Result<ReporterType, Box<dyn std::error::Error>> {
  match input {
    "Inactive" => Ok(ReporterType::Inactive),
    "Tracer" => Ok(ReporterType::Tracer),
    "Full" => Ok(ReporterType::Full),
    "Authority" => Ok(ReporterType::Authority),
    _ => Err("Unknown reporter type".into()),
  }
}

pub const CATEGORY_VALUES: &[&str] = &[
  "Safe",
  "WalletService",
  "MerchantService",
  "MiningPool",
  "LowRiskExchange",
  "MediumRiskExchange",
  "DeFi",
  "OTCBroker",
  "ATM",
  "Gambling",
  "IllicitOrganization",
  "Mixer",
  "DarknetService",
  "Scam",
  "Ransomware",
  "Theft",
  "TerroristFinancing",
  "Sanctions",
  "ChildAbuse",
];

pub fn category_from_string(input: &str) -> Result<Category, Box<dyn std::error::Error>> {
  match input {
    "Safe" => Ok(Category::Safe),
    "WalletService" => Ok(Category::WalletService),
    "MerchantService" => Ok(Category::MerchantService),
    "MiningPool" => Ok(Category::MiningPool),
    "LowRiskExchange" => Ok(Category::LowRiskExchange),
    "MediumRiskExchange" => Ok(Category::MediumRiskExchange),
    "DeFi" => Ok(Category::DeFi),
    "OTCBroker" => Ok(Category::OTCBroker),
    "ATM" => Ok(Category::ATM),
    "Gambling" => Ok(Category::Gambling),
    "IllicitOrganization" => Ok(Category::IllicitOrganization),
    "Mixer" => Ok(Category::Mixer),
    "DarknetService" => Ok(Category::DarknetService),
    "Scam" => Ok(Category::Scam),
    "Ransomware" => Ok(Category::Ransomware),
    "Theft" => Ok(Category::Theft),
    "TerroristFinancing" => Ok(Category::TerroristFinancing),
    "Sanctions" => Ok(Category::Sanctions),
    "ChildAbuse" => Ok(Category::ChildAbuse),
    _ => Err("Unknown category".into()),
  }
}

pub fn parse_arg_categories(matches: &clap::ArgMatches) -> Result<BTreeSet<Category>, Box<dyn std::error::Error>> {
  let mut tree = BTreeSet::new();
  if let Some(arg_categories) = matches.values_of("category") {
      for category in arg_categories.clone() {
          tree.insert(category_from_string(category)?);
      }
  }
  Ok(tree)
}
