import {
  Transaction,
  Keypair,
  sendAndConfirmTransaction,
  PublicKey,
} from "@solana/web3.js";

import { Community, Network, Reporter, ReporterType } from "./state";
import { HapiActionResponse, ReaderClient } from "./reader-client";
import {
  createCommunityInstruction,
  createNetworkInstructions,
  createReporterInstructions,
  updateReporterInstructions,
} from "./instructions/authority";
import { createAccountInstruction } from "./instructions/helpers";

/** HAPI client to operate authority program functions on Solana */
export class AuthorityClient extends ReaderClient {
  /** If this is true, entity account creation will not be included in transactions */
  skipAccountCreation = false;

  /**
   * Create a community creation transaction that can be signed elsewhere
   * @param payer Public key of the payer account
   * @param communityName The name of the community to create
   * @returns Transaction to sign
   **/
  async createCommunityTransaction(
    payer: PublicKey,
    communityName: string
  ): Promise<Transaction> {
    const [communityAddress] = await Community.getAddress(communityName);

    const transaction = new Transaction();

    // Create a community account
    if (!this.skipAccountCreation) {
      transaction.add(
        await createAccountInstruction(
          this.connection,
          payer,
          communityAddress,
          Community.size
        )
      );
    }

    // Form a program instruction
    transaction.add(
      await createCommunityInstruction({
        payer,
        communityName,
      })
    );

    return transaction;
  }

  /**
   * Create and sign a community creation transaction
   * @param payer Payer's key pair to sign the transaction
   * @param communityName The name of the community to create
   * @param authority (Optional) Public key of an authority of the community (defaults to payer public key)
   * @returns Transaction hash, account address and entity data
   **/
  async createCommunity(
    payer: Keypair,
    communityName: string
  ): Promise<HapiActionResponse<Community>> {
    const transaction = await this.createCommunityTransaction(
      payer.publicKey,
      communityName
    );

    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [payer],
      { commitment: "confirmed" }
    );

    const { data, account } = await Community.retrieve(
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
    payer: PublicKey,
    communityName: string,
    networkName: string
  ): Promise<Transaction> {
    const [communityAddress] = await Community.getAddress(communityName);

    const [networkAddress] = await Network.getAddress(
      communityAddress,
      networkName
    );

    const transaction = new Transaction();

    // Create a network account
    if (!this.skipAccountCreation) {
      transaction.add(
        await createAccountInstruction(
          this.connection,
          payer,
          networkAddress,
          Network.size
        )
      );
    }

    // Form a program instruction
    transaction.add(
      await createNetworkInstructions({
        payer: payer,
        communityName,
        networkName,
      })
    );

    return transaction;
  }

  /**
   * Create and sign a network creation transaction
   * @param payer Payer's key pair to sign the transaction
   * @param communityName The name of the community that the network should belong to
   * @param networkName The name of the network to create
   * @returns Transaction hash, account address and entity data
   **/
  async createNetwork(
    payer: Keypair,
    communityName: string,
    networkName: string
  ): Promise<HapiActionResponse<Network>> {
    const transaction = await this.createNetworkTransaction(
      payer.publicKey,
      communityName,
      networkName
    );

    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [payer],
      { commitment: "confirmed" }
    );

    const { data, account } = await Network.retrieve(
      this.connection,
      communityName,
      networkName
    );

    return { account, data, txHash };
  }

  async createReporterTransaction(
    payer: PublicKey,
    communityName: string,
    reporterPubkey: PublicKey,
    reporterType: ReporterType,
    reporterName: string
  ): Promise<Transaction> {
    const [communityAddress] = await Community.getAddress(communityName);

    const [reporterAddress] = await Reporter.getAddress(
      communityAddress,
      reporterPubkey
    );

    const transaction = new Transaction();

    // Create a reporter account
    if (!this.skipAccountCreation) {
      transaction.add(
        await createAccountInstruction(
          this.connection,
          payer,
          reporterAddress,
          Reporter.size
        )
      );
    }

    // Form a program instruction
    transaction.add(
      await createReporterInstructions({
        payer: payer,
        communityName,
        reporterPubkey,
        reporterType,
        reporterName,
      })
    );

    return transaction;
  }

  async createReporter(
    payer: Keypair,
    communityName: string,
    reporterPubkey: PublicKey,
    reporterType: ReporterType,
    reporterName: string
  ): Promise<HapiActionResponse<Reporter>> {
    const transaction = await this.createReporterTransaction(
      payer.publicKey,
      communityName,
      reporterPubkey,
      reporterType,
      reporterName
    );

    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [payer],
      { commitment: "confirmed" }
    );

    const { data, account } = await Reporter.retrieve(
      this.connection,
      communityName,
      reporterPubkey
    );

    return { account, data, txHash };
  }

  async updateReporterTransaction(
    payer: PublicKey,
    communityName: string,
    reporterPubkey: PublicKey,
    reporterType: ReporterType,
    reporterName: string
  ): Promise<Transaction> {
    const transaction = new Transaction();

    // Form a program instruction
    transaction.add(
      await updateReporterInstructions({
        payer: payer,
        communityName,
        reporterPubkey,
        reporterType,
        reporterName,
      })
    );

    return transaction;
  }

  async updateReporter(
    payer: Keypair,
    communityName: string,
    reporterPubkey: PublicKey,
    reporterType: ReporterType,
    reporterName: string
  ): Promise<HapiActionResponse<Reporter>> {
    const transaction = await this.updateReporterTransaction(
      payer.publicKey,
      communityName,
      reporterPubkey,
      reporterType,
      reporterName
    );

    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [payer],
      { commitment: "confirmed" }
    );

    const { data, account } = await Reporter.retrieve(
      this.connection,
      communityName,
      reporterPubkey
    );

    return { account, data, txHash };
  }
}
