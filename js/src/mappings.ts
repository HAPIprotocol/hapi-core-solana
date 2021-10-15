import {
  HapiAccountType,
  HapiInstruction,
  ReporterType,
  Category,
  CaseStatus,
} from "./state/enums";

const HAPI_INSTRUCTION_NAMES = {
  [HapiInstruction.CreateCommunity]: "CreateCommunity",
  [HapiInstruction.UpdateCommunity]: "UpdateCommunity",
  [HapiInstruction.CreateNetwork]: "CreateNetwork",
  [HapiInstruction.UpdateNetwork]: "UpdateNetwork",
  [HapiInstruction.CreateReporter]: "CreateReporter",
  [HapiInstruction.UpdateReporter]: "UpdateReporter",
  [HapiInstruction.CreateCase]: "CreateCase",
  [HapiInstruction.UpdateCase]: "UpdateCase",
  [HapiInstruction.CreateAddress]: "CreateAddress",
  [HapiInstruction.UpdateAddress]: "UpdateAddress",
};
export function getHapiInstructionName(instruction: HapiInstruction): string {
  return HAPI_INSTRUCTION_NAMES[instruction] || "<Unknown>";
}

const HAPI_ACCOUNT_TYPE_NAMES = {
  [HapiAccountType.Uninitialized]: "Uninitialized",
  [HapiAccountType.Community]: "Community",
  [HapiAccountType.Network]: "Network",
  [HapiAccountType.Reporter]: "Reporter",
  [HapiAccountType.Case]: "Case",
  [HapiAccountType.Address]: "Address",
};
export function getHapiAccountTypeName(accountType: HapiAccountType): string {
  return HAPI_ACCOUNT_TYPE_NAMES[accountType] || "<Unknown>";
}

const REPORTER_TYPE_NAMES = {
  [ReporterType.Inactive]: "Inactive",
  [ReporterType.Tracer]: "Tracer",
  [ReporterType.Full]: "Full",
  [ReporterType.Authority]: "Authority",
};
export function getReporterTypeName(reporterType: ReporterType): string {
  return REPORTER_TYPE_NAMES[reporterType] || "<Unknown>";
}

const CATEGORY_NAMES = {
  [Category.Safe]: "Safe",
  [Category.WalletService]: "WalletService",
  [Category.MerchantService]: "MerchantService",
  [Category.MiningPool]: "MiningPool",
  [Category.LowRiskExchange]: "LowRiskExchange",
  [Category.MediumRiskExchange]: "MediumRiskExchange",
  [Category.DeFi]: "DeFi",
  [Category.OTCBroker]: "OTCBroker",
  [Category.ATM]: "ATM",
  [Category.Gambling]: "Gambling",
  [Category.IllicitOrganization]: "IllicitOrganization",
  [Category.Mixer]: "Mixer",
  [Category.DarknetService]: "DarknetService",
  [Category.Scam]: "Scam",
  [Category.Ransomware]: "Ransomware",
  [Category.Theft]: "Theft",
  [Category.Counterfeit]: "Counterfeit",
  [Category.TerroristFinancing]: "TerroristFinancing",
  [Category.Sanctions]: "Sanctions",
  [Category.ChildAbuse]: "ChildAbuse",
};
export function getCategoryName(category: Category): string {
  return CATEGORY_NAMES[category] || "<Unknown>";
}

const CASE_STATUS_NAMES = {
  [CaseStatus.Open]: "Open",
  [CaseStatus.Closed]: "Closed",
};
export function getCaseStatusName(caseStatus: CaseStatus): string {
  return CASE_STATUS_NAMES[caseStatus] || "<Unknown>";
}
