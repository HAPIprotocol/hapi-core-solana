import {
  Keypair,
  PublicKey,
  sendAndConfirmTransaction,
  Transaction,
} from "@solana/web3.js";

import { u64 } from "./utils";
import {
  createAddressInstruction,
  createCaseInstruction,
  updateAddressInstruction,
  updateCaseInstruction,
} from "./instructions/reporter";
import { HapiActionResponse, ReaderClient } from "./reader-client";
import { Address, Case, Category, Community } from "./state";

/** HAPI client to operate reporter program functions on Solana */
export class ReporterClient extends ReaderClient {
  /**
   * Create a case creation transaction that can be signed elsewhere
   * @param payer Public key of the payer account
   * @param communityName The name of the community to create
   * @param caseName The name of the case to create
   * @param categories An array of categories to assign to the case
   * @returns Transaction to sign
   **/
  async createCaseTransaction(
    payer: PublicKey,
    communityName: string,
    caseName: string,
    categories: Category[]
  ): Promise<Transaction> {
    const community = await Community.retrieve(
      this.programId,
      this.connection,
      communityName
    );

    const transaction = new Transaction();

    transaction.add(
      await createCaseInstruction({
        programId: this.programId,
        payer,
        caseId: community.data.nextCaseId,
        caseName,
        categories,
        communityName,
      })
    );

    return transaction;
  }

  /**
   * Create and sign a case creation transaction
   * @param payer Public key of the payer account
   * @param communityName The name of the community to create
   * @param caseName The name of the case to create
   * @param categories An array of categories to assign to the case
   * @returns Transaction hash, account address and entity data
   **/
  async createCase(
    payer: Keypair,
    communityName: string,
    caseName: string,
    caseCategories: Category[]
  ): Promise<HapiActionResponse<Case>> {
    const community = await Community.retrieve(
      this.programId,
      this.connection,
      communityName
    );

    const transaction = await this.createCaseTransaction(
      payer.publicKey,
      communityName,
      caseName,
      caseCategories
    );

    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [payer],
      { commitment: "confirmed" }
    );

    const { data, account } = await Case.retrieve(
      this.programId,
      this.connection,
      communityName,
      community.data.nextCaseId
    );

    return { account, data, txHash };
  }

  /**
   * Create a case updating transaction that can be signed elsewhere
   * @param payer Public key of the payer account
   * @param communityName The name of the community to create
   * @param caseId The ID of the case to update
   * @param categories An array of categories to assign to the case
   * @returns Transaction to sign
   **/
  async updateCaseTransaction(
    payer: PublicKey,
    communityName: string,
    caseId: u64,
    categories: Category[]
  ): Promise<Transaction> {
    const transaction = new Transaction();

    transaction.add(
      await updateCaseInstruction({
        programId: this.programId,
        payer,
        communityName,
        caseId,
        categories,
      })
    );

    return transaction;
  }

  /**
   * Create and sign a case updating transaction
   * @param payer Public key of the payer account
   * @param communityName The name of the community to create
   * @param caseID The ID of the case to update
   * @param categories An array of categories to assign to the case
   * @returns Transaction hash, account address and entity data
   **/
  async updateCase(
    payer: Keypair,
    communityName: string,
    caseId: u64,
    caseCategories: Category[]
  ): Promise<HapiActionResponse<Case>> {
    const community = await Community.retrieve(
      this.programId,
      this.connection,
      communityName
    );

    const transaction = await this.updateCaseTransaction(
      payer.publicKey,
      communityName,
      caseId,
      caseCategories
    );

    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [payer],
      { commitment: "confirmed" }
    );

    const { data, account } = await Case.retrieve(
      this.programId,
      this.connection,
      communityName,
      community.data.nextCaseId
    );

    return { account, data, txHash };
  }

  /**
   * Create an address creation transaction that can be signed elsewhere
   * @param payer Public key of the payer account
   * @param communityName The name of the community to create
   * @param networkName The name of the network of the address
   * @param address Public key of the address
   * @param caseId The ID of the case to assign to the address
   * @param category Category to assign to the address
   * @param risk Risk score to assign to the address (0 to 10)
   * @returns Transaction to sign
   **/
  async createAddressTransaction(
    payer: PublicKey,
    communityName: string,
    networkName: string,
    address: PublicKey,
    caseId: u64,
    category: Category,
    risk: number
  ): Promise<Transaction> {
    const transaction = new Transaction();

    risk = parseInt(risk.toString());
    if (risk < 0 || risk > 10) {
      throw new RangeError("risk should be an integer between 0 and 10");
    }

    transaction.add(
      await createAddressInstruction({
        programId: this.programId,
        payer,
        communityName,
        networkName,
        address,
        caseId,
        category,
        risk,
      })
    );

    return transaction;
  }

  /**
   * Create and sign a address creation transaction
   * @param payer Public key of the payer account
   * @param communityName The name of the community to create
   * @param networkName The name of the network of the address
   * @param address Public key of the address
   * @param caseId The ID of the case to assign to the address
   * @param category Category to assign to the address
   * @param risk Risk score to assign to the address (0 to 10)
   * @returns Transaction hash, account address and entity data
   **/
  async createAddress(
    payer: Keypair,
    communityName: string,
    networkName: string,
    address: PublicKey,
    caseId: u64,
    category: Category,
    risk: number
  ): Promise<HapiActionResponse<Address>> {
    const transaction = await this.createAddressTransaction(
      payer.publicKey,
      communityName,
      networkName,
      address,
      caseId,
      category,
      risk
    );

    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [payer],
      { commitment: "confirmed" }
    );

    const { data, account } = await Address.retrieve(
      this.programId,
      this.connection,
      communityName,
      networkName,
      address
    );

    return { account, data, txHash };
  }

  /**
   * Create an address updating transaction that can be signed elsewhere
   * @param payer Public key of the payer account
   * @param communityName The name of the community to create
   * @param networkName The name of the network of the address
   * @param address Public key of the address
   * @param caseId The ID of the case to assign to the address
   * @param category Category to assign to the address
   * @param risk Risk score to assign to the address (0 to 10)
   * @returns Transaction to sign
   **/
  async updateAddressTransaction(
    payer: PublicKey,
    communityName: string,
    networkName: string,
    address: PublicKey,
    caseId: u64,
    category: Category,
    risk: number
  ): Promise<Transaction> {
    const transaction = new Transaction();

    transaction.add(
      await updateAddressInstruction({
        programId: this.programId,
        payer,
        communityName,
        networkName,
        address,
        caseId,
        category,
        risk,
      })
    );

    return transaction;
  }

  /**
   * Create and sign a address updating transaction
   * @param payer Public key of the payer account
   * @param communityName The name of the community to create
   * @param networkName The name of the network of the address
   * @param address Public key of the address
   * @param caseId The ID of the case to assign to the address
   * @param category Category to assign to the address
   * @param risk Risk score to assign to the address (0 to 10)
   * @returns Transaction hash, account address and entity data
   **/
  async updateAddress(
    payer: Keypair,
    communityName: string,
    networkName: string,
    address: PublicKey,
    caseId: u64,
    category: Category,
    risk: number
  ): Promise<HapiActionResponse<Address>> {
    const transaction = await this.updateAddressTransaction(
      payer.publicKey,
      communityName,
      networkName,
      address,
      caseId,
      category,
      risk
    );

    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [payer],
      { commitment: "confirmed" }
    );

    const { data, account } = await Address.retrieve(
      this.programId,
      this.connection,
      communityName,
      networkName,
      address
    );

    return { account, data, txHash };
  }
}
