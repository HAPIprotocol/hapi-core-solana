import { Connection, PublicKey } from "@solana/web3.js";
import { deserialize, serialize } from "borsh";

import { HAPI_PROGRAM_ID } from "../constants";
import { Community } from "./community";
import { HapiAccountType, ReporterType } from "./enums";

class ReporterState {
  account_type: number;
  reporter_type: number;
  name: string;
  constructor(object: Partial<ReporterState>) {
    Object.assign(this, object);
  }
  static schema = new Map([
    [
      ReporterState,
      {
        kind: "struct",
        fields: [
          ["account_type", "u8"],
          ["reporter_type", "u8"],
          ["name", "string"],
        ],
      },
    ],
  ]);
}

export class Reporter {
  /// HAPI account type
  accountType: HapiAccountType;

  /// Reporter type
  reporterType: ReporterType;

  /// Reporter name
  name: string;

  constructor(data?: Partial<Reporter>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  static async getAddress(
    communityAddress: PublicKey,
    reporterPubkey: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        Buffer.from("reporter"),
        communityAddress.toBuffer(),
        reporterPubkey.toBuffer(),
      ],
      HAPI_PROGRAM_ID
    );
  }

  static fromState(state: ReporterState): Reporter {
    return new Reporter({
      accountType: state.account_type,
      reporterType: state.reporter_type,
      name: state.name,
    });
  }

  static deserialize(buffer: Buffer): Reporter {
    return Reporter.fromState(
      deserialize(ReporterState.schema, ReporterState, buffer)
    );
  }

  static async retrieve(
    connection: Connection,
    communityName: string,
    reporterPubkey: PublicKey
  ): Promise<Reporter> {
    const [communityAddress] = await Community.getAddress(communityName);

    const [reporterAddress] = await Reporter.getAddress(
      communityAddress,
      reporterPubkey
    );

    const account = await connection.getAccountInfo(
      reporterAddress,
      "processed"
    );
    if (!account) {
      throw new Error("Invalid reporter account provided");
    }

    return Reporter.deserialize(account.data);
  }

  serialize(): Uint8Array {
    return serialize(ReporterState.schema, this.toState());
  }

  toState(): ReporterState {
    return new ReporterState({
      account_type: this.accountType,
      reporter_type: this.reporterType,
      name: this.name,
    });
  }
}
