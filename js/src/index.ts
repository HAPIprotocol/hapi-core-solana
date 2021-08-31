import {
  Commitment,
  Connection,
  ConnectionConfig,
  PublicKey,
} from "@solana/web3.js";

import { Case, Community, Network, Reporter } from "./state";
import { u64 } from "./utils";

export * from "./state";

export interface HapiReporterClientConfig {
  endpoint: string;
  commintment?: Commitment | ConnectionConfig;
  communityName?: string;
  networkName?: string;
}

export class HapiReporterClient {
  private connection: Connection;
  private communityName?: string;
  private networkName?: string;

  constructor(config: HapiReporterClientConfig) {
    this.connection = new Connection(config.endpoint, config.commintment);
    this.communityName = config.communityName;
    this.networkName = config.networkName;
  }

  setCommunity(communityName: string): HapiReporterClient {
    this.communityName = communityName;
    return this;
  }

  setNetwork(networkName: string): HapiReporterClient {
    this.networkName = networkName;
    return this;
  }

  async viewCommunity(communityName?: string): Promise<Community> {
    if (!communityName && !this.communityName) {
      throw new Error("Community name not specified");
    }

    return Community.retrieve(
      this.connection,
      communityName || this.communityName
    );
  }

  async viewNetwork(
    networkName?: string,
    communityName?: string
  ): Promise<Network> {
    if (!communityName && !this.communityName) {
      throw new Error("Community name not specified");
    }

    if (!networkName && !this.networkName) {
      throw new Error("Network name not specified");
    }

    return Network.retrieve(
      this.connection,
      communityName || this.communityName,
      networkName || this.networkName
    );
  }

  async viewReporter(
    reporterPubkey: PublicKey,
    communityName?: string
  ): Promise<Reporter> {
    if (!communityName && !this.communityName) {
      throw new Error("Community name not specified");
    }

    return Reporter.retrieve(
      this.connection,
      communityName || this.communityName,
      reporterPubkey
    );
  }

  async reportCase(
    newCase: Case,
    networkName?: string,
    communityName?: string
  ): Promise<void> {
    // TODO: create an instruction
  }

  // async updateCase(): Promise<void> {}

  async viewCase(
    caseId: u64,
    networkName?: string,
    communityName?: string
  ): Promise<Case> {
    if (!communityName && !this.communityName) {
      throw new Error("Community name not specified");
    }

    if (!networkName && !this.networkName) {
      throw new Error("Network name not specified");
    }

    return Case.retrieve(
      this.connection,
      communityName || this.communityName,
      networkName || this.networkName,
      caseId
    );
  }

  // async reportAddress(): Promise<void> {}

  // async updateAddress(): Promise<void> {}

  // async viewAddress(): Promise<void> {}
}
