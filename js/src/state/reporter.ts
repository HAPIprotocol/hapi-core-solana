import { HapiAccountType, ReporterType } from "./enums";

export class Reporter {
  /// HAPI account type
  account_type: HapiAccountType;

  /// Reporter type
  reporter_type: ReporterType;

  /// Reporter name
  name: string;
}
