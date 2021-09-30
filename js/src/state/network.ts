import { Connection, PublicKey } from "@solana/web3.js";
import { deserializeUnchecked, Schema, serialize } from "borsh";

import { HAPI_PROGRAM_ID } from "../constants";
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
}

export class Network {
  /// HAPI account type
  accountType: HapiAccountType;

  /// HAPI network name
  name: string;

  constructor(object?: Partial<Network>) {
    if (object) {
      Object.assign(this, object);
    }
  }

  static getAddress(
    communityAddress: PublicKey,
    networkName: string
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        Buffer.from("network"),
        communityAddress.toBuffer(),
        Buffer.from(networkName),
      ],
      HAPI_PROGRAM_ID
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
    connection: Connection,
    communityName: string,
    networkName: string
  ): Promise<Network> {
    const [communityAddress] = await Community.getAddress(communityName);

    const [networkAddress] = await Network.getAddress(
      communityAddress,
      networkName
    );

    const account = await connection.getAccountInfo(
      networkAddress,
      "processed"
    );
    if (!account) {
      throw new Error("Invalid network account provided");
    }

    return Network.deserialize(account.data);
  }

  serialize(): Uint8Array {
    return serialize(NetworkState.schema, this.toState());
  }

  toState(): NetworkState {
    return new NetworkState({
      account_type: this.accountType,
      name: this.name,
    });
  }
}
