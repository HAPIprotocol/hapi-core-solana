import { Connection, PublicKey } from "@solana/web3.js";
import { deserialize, serialize } from "borsh";

import { HAPI_PROGRAM_ID } from "../constants";
import { u64 } from "../utils";
import { Community } from "./community";
import { Category, HapiAccountType } from "./enums";
import { Network } from "./network";

export class AddressState {
  account_type: HapiAccountType;
  risk: number;
  case_id: u64;
  category: Category;
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
    networkAddress: PublicKey,
    address: PublicKey
  ): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddress(
      [Buffer.from("address"), networkAddress.toBuffer(), address.toBuffer()],
      HAPI_PROGRAM_ID
    );
  }

  static fromState(state: AddressState): Address {
    return new Address({
      accountType: state.account_type,
      risk: state.risk,
      caseId: state.case_id,
      category: state.category,
    });
  }

  static deserialize(buffer: Buffer): Address {
    return Address.fromState(
      deserialize(AddressState.schema, AddressState, buffer)
    );
  }

  static async retrieve(
    connection: Connection,
    communityName: string,
    networkName: string,
    address: PublicKey
  ): Promise<Address> {
    const [communityAddress] = await Community.getAddress(communityName);

    const [networkAddress] = await Network.getAddress(
      communityAddress,
      networkName
    );

    const [addressAddress] = await Address.getAddress(networkAddress, address);

    const account = await connection.getAccountInfo(
      addressAddress,
      "processed"
    );
    if (!account) {
      throw new Error("Invalid case account provided");
    }

    return Address.deserialize(account.data);
  }

  serialize(): Uint8Array {
    return serialize(AddressState.schema, this.toState());
  }

  toState(): AddressState {
    return new AddressState({
      account_type: this.accountType,
      risk: this.risk,
      case_id: this.caseId,
      category: this.category,
    });
  }
}
