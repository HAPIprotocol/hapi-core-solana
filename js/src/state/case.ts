import { Connection, PublicKey } from "@solana/web3.js";
import { deserializeUnchecked, serialize } from "borsh";

import { HAPI_PROGRAM_ID } from "../constants";
import { u64 } from "../utils";
import { Community } from "./community";
import { Categories, Category, HapiAccountType } from "./enums";

class CaseState {
  account_type: number;
  reporter_key: Uint8Array;
  categories: number;
  name: string;
  constructor(object: Partial<CaseState>) {
    Object.assign(this, object);
  }
  static schema = new Map([
    [
      CaseState,
      {
        kind: "struct",
        fields: [
          ["account_type", "u8"],
          ["reporter_key", [32]],
          ["categories", "u32"],
          ["name", "string"],
        ],
      },
    ],
  ]);
  static size = 70;
}

export class Case {
  /// HAPI account type
  accountType: HapiAccountType;

  /// Case reporter key
  reporterKey: PublicKey;

  /// Categories
  categories: Category[];

  /// Case name
  name: string;

  constructor(data?: Partial<Case>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  static async getAddress(
    communityAddress: PublicKey,
    caseId: u64
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [Buffer.from("case"), communityAddress.toBuffer(), caseId.toBuffer()],
      HAPI_PROGRAM_ID
    );
  }

  static fromState(state: CaseState): Case {
    return new Case({
      accountType: state.account_type,
      name: state.name,
      reporterKey: new PublicKey(state.reporter_key),
      categories: Categories.filter(
        (category) => state.categories & category
      ).sort(),
    });
  }

  static deserialize(buffer: Buffer): Case {
    return Case.fromState(
      deserializeUnchecked(CaseState.schema, CaseState, buffer)
    );
  }

  static async retrieve(
    connection: Connection,
    communityName: string,
    caseId: u64
  ): Promise<{ data: Case; account: PublicKey }> {
    const [communityAddress] = await Community.getAddress(communityName);

    const [caseAddress] = await Case.getAddress(communityAddress, caseId);

    const account = await connection.getAccountInfo(caseAddress, "processed");
    if (!account) {
      throw new Error("Invalid case account provided");
    }

    return { data: Case.deserialize(account.data), account: communityAddress };
  }

  serialize(): Uint8Array {
    const buf = Buffer.alloc(CaseState.size);
    buf.set(serialize(CaseState.schema, this.toState()));
    return buf;
  }

  toState(): CaseState {
    return new CaseState({
      account_type: this.accountType,
      name: this.name,
      reporter_key: this.reporterKey.toBytes(),
      categories: this.categories.reduce((acc, category) => {
        return acc | category;
      }, 0),
    });
  }
}
