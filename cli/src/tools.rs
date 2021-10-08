use hapi_core_solana::state::enums::CaseStatus;

use {
    hapi_core_solana::state::enums::{Category, CategorySet, ReporterType},
    solana_client::rpc_client::RpcClient,
    solana_sdk::{program_error::ProgramError, pubkey::Pubkey},
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

pub fn case_status_from_string(input: &str) -> Result<CaseStatus, Box<dyn std::error::Error>> {
    match input {
        "Open" => Ok(CaseStatus::Open),
        "Closed" => Ok(CaseStatus::Closed),
        _ => Err("Unknown case status".into()),
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
    "Counterfeit",
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
        "Counterfeit" => Ok(Category::Counterfeit),
        "TerroristFinancing" => Ok(Category::TerroristFinancing),
        "Sanctions" => Ok(Category::Sanctions),
        "ChildAbuse" => Ok(Category::ChildAbuse),
        _ => Err("Unknown category".into()),
    }
}

pub fn parse_arg_categories(
    matches: &clap::ArgMatches,
) -> Result<CategorySet, Box<dyn std::error::Error>> {
    let mut categories: CategorySet = 0u32;
    if let Some(arg_categories) = matches.values_of("category") {
        for category in arg_categories.clone() {
            categories = categories | category_from_string(category)?;
        }
    }
    Ok(categories)
}

pub fn parse_arg_category(
    matches: &clap::ArgMatches,
) -> Result<Category, Box<dyn std::error::Error>> {
    category_from_string(matches.value_of("category").unwrap())
}

pub fn parse_arg_reporter_type(
    matches: &clap::ArgMatches,
) -> Result<ReporterType, Box<dyn std::error::Error>> {
    reporter_type_from_string(matches.value_of("reporter_type").unwrap())
}

pub fn parse_arg_case_status(
    matches: &clap::ArgMatches,
) -> Result<CaseStatus, Box<dyn std::error::Error>> {
    case_status_from_string(matches.value_of("case_status").unwrap())
}
