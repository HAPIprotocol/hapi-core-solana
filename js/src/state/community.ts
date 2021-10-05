import { Connection, PublicKey } from "@solana/web3.js";
import { serialize, deserializeUnchecked } from "borsh";
import { u64 } from "utils";

import { HAPI_PROGRAM_ID } from "../constants";
import { HapiAccountType } from "./enums";

class CommunityState {
  account_type: number;
  authority: Uint8Array;
  name: string;
  next_case_id: u64;
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
          ["next_case_id", "u64"],
          ["name", "string"],
        ],
      },
    ],
  ]);
  static size = 73;
}

export class Community {
  /// HAPI account type
  accountType: HapiAccountType;

  /// HAPI authority account
  authority: PublicKey;

  /// ID of the next created case
  nextCaseId: u64;

  /// HAPI community name
  name: string;

  static size = CommunityState.size;

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
      nextCaseId: state.next_case_id,
      name: state.name,
    });
  }

  static deserialize(buffer: Buffer): Community {
    return Community.fromState(
      deserializeUnchecked(CommunityState.schema, CommunityState, buffer)
    );
  }

  static async retrieve(
    connection: Connection,
    communityName: string
  ): Promise<{ data: Community; account: PublicKey }> {
    const [communityAddress] = await Community.getAddress(communityName);

    const communityAccount = await connection.getAccountInfo(
      communityAddress,
      "confirmed"
    );
    if (!communityAccount) {
      throw new Error(
        `Community not found: ${communityName} (${communityAddress})`
      );
    }

    return {
      data: Community.deserialize(communityAccount.data),
      account: communityAddress,
    };
  }

  serialize(): Uint8Array {
    const buf = Buffer.alloc(CommunityState.size);
    buf.set(serialize(CommunityState.schema, this.toState()));
    return buf;
  }

  toState(): CommunityState {
    return new CommunityState({
      account_type: this.accountType,
      authority: this.authority.toBytes(),
      next_case_id: this.nextCaseId,
      name: this.name,
    });
  }
}
