import { Connection, PublicKey } from "@solana/web3.js";
import { deserializeUnchecked, Schema, serialize } from "borsh";

import { Community } from "./community";
import { HapiAccountType } from "./enums";

class NetworkState {
  account_type: number;
  name: string;
  constructor(object: Partial<NetworkState>) {
    Object.assign(this, object);
  }
  static schema: Schema = new Map([
    [
      NetworkState,
      {
        kind: "struct",
        fields: [
          ["account_type", "u8"],
          ["name", "string"],
        ],
      },
    ],
  ]);
  static size = 33;
}

export class Network {
  /// HAPI account type
  accountType = HapiAccountType.Network;

  /// HAPI network name
  name: string;

  static size = NetworkState.size;

  constructor(object?: Partial<Network>) {
    if (object) {
      Object.assign(this, object);
    }
  }

  static async getAddress(
    programId: PublicKey,
    communityAddress: PublicKey,
    networkName: string
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        Buffer.from("network"),
        communityAddress.toBuffer(),
        Buffer.from(networkName),
      ],
      programId
    );
  }

  static fromState(state: NetworkState): Network {
    const network = new Network();
    network.accountType = state.account_type;
    network.name = state.name;
    return network;
  }

  static deserialize(buffer: Buffer): Network {
    return Network.fromState(
      deserializeUnchecked(NetworkState.schema, NetworkState, buffer)
    );
  }

  static async retrieve(
    programId: PublicKey,
    connection: Connection,
    communityName: string,
    networkName: string
  ): Promise<{ data: Network; account: PublicKey }> {
    const [communityAddress] = await Community.getAddress(
      programId,
      communityName
    );

    const [networkAddress] = await Network.getAddress(
      programId,
      communityAddress,
      networkName
    );

    const account = await connection.getAccountInfo(networkAddress);
    if (!account) {
      throw new Error(
        `Network not found: "${networkName}" (${networkAddress}) in community "${communityName}" (${communityAddress})`
      );
    }

    return { data: Network.deserialize(account.data), account: networkAddress };
  }

  serialize(): Uint8Array {
    const buf = Buffer.alloc(NetworkState.size);
    buf.set(serialize(NetworkState.schema, this.toState()));
    return buf;
  }

  toState(): NetworkState {
    return new NetworkState({
      account_type: this.accountType,
      name: this.name,
    });
  }
}
