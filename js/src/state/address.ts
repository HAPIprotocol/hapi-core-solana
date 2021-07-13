import { u64, u8 } from "../utils";
import { Category, HapiAccountType } from "./enums";

export class Address {
  /// HAPI account type
  account_type: HapiAccountType;

  /// Risk score
  risk: u8;

  /// Case ID
  case_id: u64;

  /// Category
  category: Category;
}
