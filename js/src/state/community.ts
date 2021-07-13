import { Connection, PublicKey } from '@solana/web3.js';
import { Schema, serialize, deserialize } from 'borsh';

import { HAPI_PROGRAM_ID } from '..';
import { HapiAccountType } from "./enums";

class CommunityState {
  account_type: number;
  authority: Uint8Array;
  name: string;
  constructor(object: Partial<CommunityState>) {
    Object.assign(this, object);
  }
}

const CommunitySchema: Schema = new Map([[CommunityState, {
  kind: 'struct',
  fields: [
    ['account_type', 'u8'],
    ['authority', [32]],
    ['name', 'string']
  ]
}]]);

export class Community {
  /// HAPI account type
  accountType: HapiAccountType;

  /// HAPI authority account
  authority: PublicKey;

  /// HAPI community name
  name: string;

  constructor(object?: Partial<Community>) {
    if (object) {
      Object.assign(this, object);
    }
  }

  serialize(): Uint8Array {
    return serialize(CommunitySchema, this.toState());
  }

  toState(): CommunityState {
    return new CommunityState({
      account_type: this.accountType,
      authority: this.authority.toBytes(),
      name: this.name,
    })
  }

  static fromState(state: CommunityState): Community {
    const community = new Community();
    community.accountType = state.account_type;
    community.authority = new PublicKey(state.authority);
    community.name = state.name;
    return community;
  }

  static deserialize(buffer: Buffer): Community {
    return Community.fromState(deserialize(CommunitySchema, CommunityState, buffer));
  }

  static async retrieve(
    connection: Connection,
    communityName: string,
  ): Promise<Community> {
    const [communityAddress] = await PublicKey.findProgramAddress([
      Buffer.from('community'),
      Buffer.from(communityName)
    ], HAPI_PROGRAM_ID);

    const communityAccount = await connection.getAccountInfo(
      communityAddress,
      'processed'
    );
    if (!communityAccount) {
      throw new Error('Invalid community account provided');
    }

    const res: Community = Community.deserialize(communityAccount.data);
    return res;
  }
}
