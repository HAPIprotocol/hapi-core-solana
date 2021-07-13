import { PublicKey } from "@solana/web3.js";

import { Category, HapiAccountType } from "./enums"

export class Case {
  /// HAPI account type
  account_type: HapiAccountType;

  /// Case name
  name: string;

  /// Case reporter key
  reporter_key: PublicKey;

  /// Categories
  categories: Map<Category, boolean>;
}
