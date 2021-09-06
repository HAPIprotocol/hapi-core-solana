import { Connection, PublicKey } from "@solana/web3.js";
import { deserialize, serialize } from "borsh";

import { HAPI_PROGRAM_ID } from "../constants";
import { mapToBuffer, u64 } from "../utils";
import { Community } from "./community";
import { Categories, Category, HapiAccountType } from "./enums";
import { Network } from "./network";

class CaseState {
  account_type: number;
  name: string;
  reporter_key: Uint8Array;
  categories: Uint8Array;
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
          ["name", "string"],
          ["reporter_key", [32]],
          ["categories", "u32"],
        ],
      },
    ],
  ]);
}

export class Case {
  /// HAPI account type
  accountType: HapiAccountType;

  /// Case name
  name: string;

  /// Case reporter key
  reporterKey: PublicKey;

  /// Categories
  categories: Map<Category, boolean>;

  constructor(data?: Partial<Case>) {
    if (data) {
      Object.assign(this, data);
      for (const category of Categories) {
        if (!this.categories.has(category)) {
          this.categories.set(category, false);
        }
      }
    }
  }

  static async getAddress(
    networkAddress: PublicKey,
    caseId: u64
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [Buffer.from("case"), networkAddress.toBuffer(), caseId.toBuffer()],
      HAPI_PROGRAM_ID
    );
  }

  static fromState(state: CaseState): Case {
    return new Case({
      accountType: state.account_type,
      name: state.name,
      reporterKey: new PublicKey(state.reporter_key),
      categories: new Map<Category, boolean>(),
    });
  }

  static deserialize(buffer: Buffer): Case {
    return Case.fromState(deserialize(CaseState.schema, CaseState, buffer));
  }

  static async retrieve(
    connection: Connection,
    communityName: string,
    networkName: string,
    caseId: u64
  ): Promise<Case> {
    const [communityAddress] = await Community.getAddress(communityName);

    const [networkAddress] = await Network.getAddress(
      communityAddress,
      networkName
    );

    const [caseAddress] = await Case.getAddress(networkAddress, caseId);

    const account = await connection.getAccountInfo(caseAddress, "processed");
    if (!account) {
      throw new Error("Invalid case account provided");
    }

    return Case.deserialize(account.data);
  }

  serialize(): Uint8Array {
    return serialize(CaseState.schema, this.toState());
  }

  toState(): CaseState {
    return new CaseState({
      account_type: this.accountType,
      name: this.name,
      reporter_key: this.reporterKey.toBytes(),
      categories: mapToBuffer(this.categories),
    });
  }
}
