import { Connection, PublicKey } from "@solana/web3.js";
import { serialize, deserialize } from "borsh";

import { HAPI_PROGRAM_ID } from "../constants";
import { HapiAccountType } from "./enums";

class CommunityState {
  account_type: number;
  authority: Uint8Array;
  name: string;
  constructor(object: Partial<CommunityState>) {
    Object.assign(this, object);
  }
  static schema = new Map([
    [
      CommunityState,
      {
        kind: "struct",
        fields: [
          ["account_type", "u8"],
          ["authority", [32]],
          ["name", "string"],
        ],
      },
    ],
  ]);
}

export class Community {
  /// HAPI account type
  accountType: HapiAccountType;

  /// HAPI authority account
  authority: PublicKey;

  /// HAPI community name
  name: string;

  constructor(data?: Partial<Community>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  static async getAddress(communityName: string): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [Buffer.from("community"), Buffer.from(communityName)],
      HAPI_PROGRAM_ID
    );
  }

  static fromState(state: CommunityState): Community {
    return new Community({
      accountType: state.account_type,
      authority: new PublicKey(state.authority),
      name: state.name,
    });
  }

  static deserialize(buffer: Buffer): Community {
    return Community.fromState(
      deserialize(CommunityState.schema, CommunityState, buffer)
    );
  }

  static async retrieve(
    connection: Connection,
    communityName: string
  ): Promise<Community> {
    const [communityAddress] = await Community.getAddress(communityName);

    const communityAccount = await connection.getAccountInfo(
      communityAddress,
      "processed"
    );
    if (!communityAccount) {
      throw new Error("Invalid community account provided");
    }

    return Community.deserialize(communityAccount.data);
  }

  serialize(): Uint8Array {
    return serialize(CommunityState.schema, this.toState());
  }

  toState(): CommunityState {
    return new CommunityState({
      account_type: this.accountType,
      authority: this.authority.toBytes(),
      name: this.name,
    });
  }
}
