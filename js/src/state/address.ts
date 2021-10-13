import { Connection, PublicKey } from "@solana/web3.js";
import { deserializeUnchecked, serialize } from "borsh";

import { Community } from "./community";
import { Network } from "./network";
import { u64 } from "../utils";
import { Categories, Category, HapiAccountType } from "./enums";

export class AddressState {
  account_type: HapiAccountType;
  risk: number;
  case_id: u64;
  category: number;
  constructor(object: Partial<AddressState>) {
    Object.assign(this, object);
  }
  static schema = new Map([
    [
      AddressState,
      {
        kind: "struct",
        fields: [
          ["account_type", "u8"],
          ["risk", "u8"],
          ["case_id", "u64"],
          ["category", "u8"],
        ],
      },
    ],
  ]);
  static size = 11;
}

export class Address {
  /// HAPI account type
  accountType: HapiAccountType;

  /// Risk score
  risk: number;

  /// Case ID
  caseId: u64;

  /// Category
  category: Category;

  constructor(data?: Partial<Address>) {
    if (data) {
      Object.assign(this, data);
    }
  }

  static async getAddress(
    programId: PublicKey,
    communityAddress: PublicKey,
    networkAddress: PublicKey,
    address: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [
        Buffer.from("address"),
        communityAddress.toBuffer(),
        networkAddress.toBuffer(),
        address.toBuffer(),
      ],
      programId
    );
  }

  static fromState(state: AddressState): Address {
    return new Address({
      accountType: state.account_type,
      risk: state.risk,
      caseId: state.case_id,
      category: Categories[state.category],
    });
  }

  static deserialize(buffer: Buffer): Address {
    return Address.fromState(
      deserializeUnchecked(AddressState.schema, AddressState, buffer)
    );
  }

  static async retrieve(
    programId: PublicKey,
    connection: Connection,
    communityName: string,
    networkName: string,
    address: PublicKey
  ): Promise<{ data: Address; account: PublicKey }> {
    const [communityAddress] = await Community.getAddress(
      programId,
      communityName
    );

    const [networkAddress] = await Network.getAddress(
      programId,
      communityAddress,
      networkName
    );

    const [addressAddress] = await Address.getAddress(
      programId,
      communityAddress,
      networkAddress,
      address
    );

    const account = await connection.getAccountInfo(
      addressAddress,
      "processed"
    );
    if (!account) {
      throw new Error(
        `Address not found: "${address}" in network "${networkName}" (${networkAddress}) in community "${communityName}" (${communityAddress})`
      );
    }

    return { data: Address.deserialize(account.data), account: addressAddress };
  }

  serialize(): Uint8Array {
    const buf = Buffer.alloc(AddressState.size);
    buf.set(serialize(AddressState.schema, this.toState()));
    return buf;
  }

  toState(): AddressState {
    return new AddressState({
      account_type: this.accountType,
      risk: this.risk,
      case_id: this.caseId,
      category: Categories.indexOf(this.category),
    });
  }
}
