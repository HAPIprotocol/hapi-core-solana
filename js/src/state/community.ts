import { Connection, PublicKey } from "@solana/web3.js";
import { serialize, deserializeUnchecked } from "borsh";
import BN from "bn.js";

import { u64 } from "../utils";
import { HapiAccountType } from "./enums";

class CommunityState {
  account_type: number;
  authority: Uint8Array;
  name: string;
  next_case_id: BN;
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
  accountType = HapiAccountType.Community;

  /// HAPI authority account
  authority: PublicKey;

  /// ID of the next created case
  nextCaseId: u64;

  /// HAPI community name
  name: string;

  static size = CommunityState.size;

  constructor(data?: Partial<Community>) {
    if (data) {
      this.authority = data.authority;
      this.nextCaseId = data.nextCaseId;
      this.name = data.name;
    }
  }

  static async getAddress(
    programId: PublicKey,
    communityName: string
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      Community.getAddressSeeds(communityName),
      programId
    );
  }

  static getAddressSeeds(communityName: string): Uint8Array[] {
    return [Buffer.from("community"), Buffer.from(communityName)];
  }

  static fromState(state: CommunityState): Community {
    return new Community({
      authority: new PublicKey(state.authority),
      nextCaseId: new u64(state.next_case_id),
      name: state.name,
    });
  }

  static deserialize(buffer: Buffer): Community {
    return Community.fromState(
      deserializeUnchecked(CommunityState.schema, CommunityState, buffer)
    );
  }

  static async retrieve(
    programId: PublicKey,
    connection: Connection,
    communityName: string
  ): Promise<{ data: Community; account: PublicKey }> {
    const [communityAddress] = await Community.getAddress(
      programId,
      communityName
    );

    const communityAccount = await connection.getAccountInfo(communityAddress);
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
