import { Numberu64 } from "../utils";
import { HapiAccountType } from "./enums";

export class Network {
  /// HAPI account type
  account_type: HapiAccountType;

  /// HAPI network name
  name: string;

  /// ID for the next reported case
  next_case_id: Numberu64;
}
