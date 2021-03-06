import { Connection, PublicKey } from "@solana/web3.js";

import { base58ToPublicKey, u64 } from "./utils";
import { Address, Case, Community, Network, Reporter } from "./state";
import { HAPI_PROGRAM_ID } from "./constants";
import { HapiClientConfig, HapiViewResponse } from "./interfaces";

/** HAPI client to read entity data from Solana */
export class ReaderClient {
  public readonly connection: Connection;
  protected communityName?: string;
  protected programId: PublicKey;

  constructor(config: HapiClientConfig) {
    if (typeof config.endpoint === "object") {
      this.connection = config.endpoint;
    } else {
      this.connection = new Connection(config.endpoint, config.commitment);
    }
    this.communityName = config.communityName;
    this.programId = new PublicKey(this.programId || HAPI_PROGRAM_ID);
  }

  protected ensureCommunityName(communityName?: string): string {
    if (!communityName) {
      communityName = this.communityName;
    }
    if (!communityName) {
      throw new Error("Community name not set");
    }
    return communityName;
  }

  /**
   * Sets community name for context
   * @param communityName Community name
   * @returns Self
   */
  switchCommunity(communityName: string): ReaderClient {
    this.communityName = communityName;
    return this;
  }

  /**
   * Fetch community info from blockchain
   * @param communityName (Optional) The name of the community to fetch (defaults to context)
   * @returns Community info
   **/
  async getCommunity(
    communityName?: string
  ): Promise<HapiViewResponse<Community>> {
    communityName = this.ensureCommunityName(communityName);

    const state = await Community.retrieve(
      this.programId,
      this.connection,
      communityName || this.communityName
    );

    return state;
  }

  /**
   * Fetch network info from blockchain
   * @param networkName The name of the network to fetch
   * @param communityName (Optional) The name of the community to fetch network from (defaults to context)
   * @returns Network info
   **/
  async getNetwork(
    networkName: string,
    communityName?: string
  ): Promise<HapiViewResponse<Network>> {
    communityName = this.ensureCommunityName(communityName);

    if (!networkName) {
      throw new Error("Network name not specified");
    }

    const state = await Network.retrieve(
      this.programId,
      this.connection,
      communityName || this.communityName,
      networkName
    );

    return state;
  }

  /**
   * Fetch reporter info from blockchain
   * @param reporterPubkey Public key of the reporter to fetch
   * @param communityName (Optional) The name of the community to fetch reporter from (defaults to context)
   * @returns Reporter info
   **/
  async getReporter(
    reporterPubkey: string,
    communityName?: string
  ): Promise<HapiViewResponse<Reporter>> {
    communityName = this.ensureCommunityName(communityName);

    const state = await Reporter.retrieve(
      this.programId,
      this.connection,
      communityName || this.communityName,
      new PublicKey(reporterPubkey)
    );

    return state;
  }

  /**
   * Fetch case info from blockchain
   * @param caseId ID of the case to fetch
   * @param communityName (Optional) The name of the community to fetch case from (defaults to context)
   * @returns Case info
   **/
  async getCase(
    caseId: u64,
    communityName?: string
  ): Promise<HapiViewResponse<Case>> {
    communityName = this.ensureCommunityName(communityName);

    const state = await Case.retrieve(
      this.programId,
      this.connection,
      communityName || this.communityName,
      caseId
    );

    return state;
  }

  /**
   * Fetch address info from blockchain
   * @param address The address to fetch info for (string for Solana addresses, Buffer for others)
   * @param networkName The name of the network to which address belongs to
   * @param communityName (Optional) The name of the community to fetch case from (defaults to context)
   * @returns Address info
   **/
  async getAddress(
    address: string | Buffer,
    networkName: string,
    communityName?: string
  ): Promise<HapiViewResponse<Address>> {
    communityName = this.ensureCommunityName(communityName);

    if (!networkName) {
      throw new Error("Network name not specified");
    }

    const convertedAddress =
      address instanceof Buffer
        ? new PublicKey(address)
        : base58ToPublicKey(address);

    const state = await Address.retrieve(
      this.programId,
      this.connection,
      communityName || this.communityName,
      networkName,
      convertedAddress
    );

    return state;
  }
}
