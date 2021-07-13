import { Numberu64, Numberu8 } from "../utils";
import { Category, HapiAccountType } from "./enums";

export class Address {
  /// HAPI account type
  account_type: HapiAccountType;

  /// Risk score
  risk: Numberu8;

  /// Case ID
  case_id: Numberu64;

  /// Category
  category: Category;
}
