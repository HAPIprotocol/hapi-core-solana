import {
  Commitment,
  Connection,
  ConnectionConfig,
  PublicKey,
} from "@solana/web3.js";

import { base58ToPublicKey, u64 } from "./utils";
import { Address, Case, Community, Network, Reporter } from "./state";

export interface HapiClientConfig {
  endpoint: string;
  commintment?: Commitment | ConnectionConfig;
  communityName?: string;
}

export interface HapiViewResponse<T> {
  account: PublicKey;
  data: T;
}

export interface HapiActionResponse<T> {
  account: PublicKey;
  txHash: string;
  data: T;
}

/** HAPI client to read entity data from Solana */
export class ReaderClient {
  protected connection: Connection;
  protected communityName?: string;

  constructor(config: HapiClientConfig) {
    this.connection = new Connection(config.endpoint, config.commintment);
    this.communityName = config.communityName;
  }

  switchCommunity(communityName: string): ReaderClient {
    this.communityName = communityName;
    return this;
  }

  async getCommunity(
    communityName?: string
  ): Promise<HapiViewResponse<Community>> {
    if (!communityName && !this.communityName) {
      throw new Error("Community name not specified");
    }

    const state = await Community.retrieve(
      this.connection,
      communityName || this.communityName
    );

    return state;
  }

  async getNetwork(
    networkName: string,
    communityName?: string
  ): Promise<HapiViewResponse<Network>> {
    if (!communityName && !this.communityName) {
      throw new Error("Community name not specified");
    }

    if (!networkName) {
      throw new Error("Network name not specified");
    }

    const state = await Network.retrieve(
      this.connection,
      communityName || this.communityName,
      networkName
    );

    return state;
  }

  async getReporter(
    reporterPubkey: string,
    communityName?: string
  ): Promise<HapiViewResponse<Reporter>> {
    if (!communityName && !this.communityName) {
      throw new Error("Community name not specified");
    }

    const state = await Reporter.retrieve(
      this.connection,
      communityName || this.communityName,
      new PublicKey(reporterPubkey)
    );

    return state;
  }

  async getCase(
    caseId: u64,
    communityName?: string
  ): Promise<HapiViewResponse<Case>> {
    if (!communityName && !this.communityName) {
      throw new Error("Community name not specified");
    }

    const state = await Case.retrieve(
      this.connection,
      communityName || this.communityName,
      caseId
    );

    return state;
  }

  async getAddress(
    address: string | Buffer,
    networkName: string,
    communityName?: string
  ): Promise<HapiViewResponse<Address>> {
    if (!communityName && !this.communityName) {
      throw new Error("Community name not specified");
    }

    if (!networkName) {
      throw new Error("Network name not specified");
    }

    const convertedAddress =
      address instanceof Buffer
        ? new PublicKey(address)
        : base58ToPublicKey(address);

    const state = await Address.retrieve(
      this.connection,
      communityName || this.communityName,
      networkName,
      convertedAddress
    );

    return state;
  }
}
