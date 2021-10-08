import {
  Transaction,
  Keypair,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";

import { Community, Network, Reporter, ReporterType } from "./state";
import {
  HapiActionResponse,
  ReaderClient,
  HapiClientConfig,
} from "./reader-client";
import {
  createCommunityInstruction,
  createNetworkInstructions,
  createReporterInstructions,
  updateReporterInstructions,
} from "./instructions/authority";

export interface HapiClientAuthorityConfig extends HapiClientConfig {
  payer: Keypair | PublicKey;
}

/** HAPI client to operate authority program functions on Solana */
export class AuthorityClient extends ReaderClient {
  payer: Keypair | PublicKey;

  get payerPublicKey(): PublicKey {
    return this.payer instanceof Keypair ? this.payer.publicKey : this.payer;
  }

  get payerKeypair(): Keypair | undefined {
    if (this.payer instanceof Keypair) {
      return this.payer;
    }
    throw new Error(`Client is not initialized with payer secret key`);
  }

  constructor(config: HapiClientAuthorityConfig) {
    super(config);
    this.payer = config.payer;
  }

  /**
   * Create a community creation transaction that can be signed elsewhere
   * @param payer Public key of the payer account
   * @param communityName The name of the community to create
   * @returns Transaction to sign
   **/
  async createCommunityTransaction(
    communityName?: string
  ): Promise<{ transaction: Transaction }> {
    communityName = this.ensureCommunityName(communityName);

    const transaction = new Transaction();

    // Form a program instruction
    transaction.add(
      await createCommunityInstruction({
        programId: this.programId,
        payer: this.payerPublicKey,
        communityName,
      })
    );

    return { transaction };
  }

  /**
   * Create and sign a community creation transaction
   * @param payer Payer's key pair to sign the transaction
   * @param communityName The name of the community to create
   * @param authority (Optional) Public key of an authority of the community (defaults to payer public key)
   * @returns Transaction hash, account address and entity data
   **/
  async createCommunity(
    communityName?: string
  ): Promise<HapiActionResponse<Community>> {
    communityName = this.ensureCommunityName(communityName);

    const { transaction } = await this.createCommunityTransaction(
      communityName
    );

    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payerKeypair],
      { commitment: "confirmed" }
    );

    const { data, account } = await Community.retrieve(
      this.programId,
      this.connection,
      communityName
    );

    return { account, data, txHash };
  }

  /**
   * Create a network creation transaction that can be signed elsewhere
   * @param payer Public key of the payer account (must be the community authority)
   * @param communityName The name of the community that the network should belong to
   * @param networkName The name of the network to create
   * @returns Transaction to sign
   **/
  async createNetworkTransaction(
    networkName: string,
    communityName?: string
  ): Promise<{ transaction: Transaction }> {
    communityName = this.ensureCommunityName(communityName);

    const transaction = new Transaction();

    // Form a program instruction
    transaction.add(
      await createNetworkInstructions({
        programId: this.programId,
        payer: this.payerPublicKey,
        communityName,
        networkName,
      })
    );

    return { transaction };
  }

  /**
   * Create and sign a network creation transaction
   * @param payer Payer's key pair to sign the transaction
   * @param communityName The name of the community that the network should belong to
   * @param networkName The name of the network to create
   * @returns Transaction hash, account address and entity data
   **/
  async createNetwork(
    networkName: string,
    communityName?: string
  ): Promise<HapiActionResponse<Network>> {
    communityName = this.ensureCommunityName(communityName);

    const { transaction } = await this.createNetworkTransaction(
      networkName,
      communityName
    );

    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payerKeypair],
      { commitment: "confirmed" }
    );

    const { data, account } = await Network.retrieve(
      this.programId,
      this.connection,
      communityName,
      networkName
    );

    return { account, data, txHash };
  }

  /**
   * Create a reporter creation transaction that can be signed elsewhere
   * @param payer Public key of the payer account (must be the community authority)
   * @param communityName The name of the community that the network should belong to
   * @param reporterPubkey Public key of the reporter
   * @param reporterType Type of the reporter
   * @param reporterName The name of the reporter to create
   * @returns Transaction to sign
   **/
  async createReporterTransaction(
    reporterPubkey: PublicKey,
    reporterType: ReporterType,
    reporterName: string,
    communityName?: string
  ): Promise<{ transaction: Transaction }> {
    communityName = this.ensureCommunityName(communityName);

    const transaction = new Transaction();

    // Form a program instruction
    transaction.add(
      await createReporterInstructions({
        programId: this.programId,
        payer: this.payerPublicKey,
        communityName,
        reporterPubkey,
        reporterType,
        reporterName,
      })
    );

    return { transaction };
  }

  /**
   * Create and sign a reporter creation transaction
   * @param payer Payer's key pair to sign the transaction
   * @param communityName The name of the community that the network should belong to
   * @param reporterPubkey Public key of the reporter
   * @param reporterType Type of the reporter
   * @param reporterName The name of the reporter to create
   * @returns Transaction hash, account address and entity data
   **/
  async createReporter(
    reporterPubkey: PublicKey,
    reporterType: ReporterType,
    reporterName: string,
    communityName?: string
  ): Promise<HapiActionResponse<Reporter>> {
    communityName = this.ensureCommunityName(communityName);

    const { transaction } = await this.createReporterTransaction(
      reporterPubkey,
      reporterType,
      reporterName,
      communityName
    );

    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payerKeypair],
      { commitment: "confirmed" }
    );

    const { data, account } = await Reporter.retrieve(
      this.programId,
      this.connection,
      communityName,
      reporterPubkey
    );

    return { account, data, txHash };
  }

  /**
   * Create a reporter updating transaction that can be signed elsewhere
   * @param payer Public key of the payer account (must be the community authority)
   * @param communityName The name of the community that the network should belong to
   * @param reporterPubkey Public key of the reporter
   * @param reporterType New type of the reporter
   * @param reporterName New name of the reporter
   * @returns Transaction to sign
   **/
  async updateReporterTransaction(
    reporterPubkey: PublicKey,
    reporterType: ReporterType,
    reporterName: string,
    communityName?: string
  ): Promise<{ transaction: Transaction }> {
    communityName = this.ensureCommunityName(communityName);

    const transaction = new Transaction();

    // Form a program instruction
    transaction.add(
      await updateReporterInstructions({
        programId: this.programId,
        payer: this.payerPublicKey,
        communityName,
        reporterPubkey,
        reporterType,
        reporterName,
      })
    );

    return { transaction };
  }

  /**
   * Create and sign a reporter updating transaction
   * @param payer Public key of the payer account (must be the community authority)
   * @param communityName The name of the community that the network should belong to
   * @param reporterPubkey Public key of the reporter
   * @param reporterType New type of the reporter
   * @param reporterName New name of the reporter
   * @returns Transaction hash, account address and updated entity data
   **/
  async updateReporter(
    reporterPubkey: PublicKey,
    reporterType: ReporterType,
    reporterName: string,
    communityName?: string
  ): Promise<HapiActionResponse<Reporter>> {
    communityName = this.ensureCommunityName(communityName);

    const { transaction } = await this.updateReporterTransaction(
      reporterPubkey,
      reporterType,
      reporterName,
      communityName
    );

    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payerKeypair],
      { commitment: "confirmed" }
    );

    const { data, account } = await Reporter.retrieve(
      this.programId,
      this.connection,
      communityName,
      reporterPubkey
    );

    return { account, data, txHash };
  }
}
