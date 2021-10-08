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
import {
  HapiActionResponse,
  ReaderClient,
  HapiClientConfig,
  HapiActionResponseWithMeta,
} from "./reader-client";
import { Address, Case, Category, Community, CaseStatus } from "./state";

export interface HapiClientReporterConfig extends HapiClientConfig {
  payer: Keypair | PublicKey;
}

/** HAPI client to operate reporter program functions on Solana */
export class ReporterClient extends ReaderClient {
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

  constructor(config: HapiClientReporterConfig) {
    super(config);
    this.payer = config.payer;
  }

  /**
   * Create a case creation transaction that can be signed elsewhere
   * @param payer Public key of the payer account
   * @param communityName The name of the community to create
   * @param caseName The name of the case to create
   * @param categories An array of categories to assign to the case
   * @returns Transaction to sign
   **/
  async createCaseTransaction(
    caseName: string,
    status: CaseStatus,
    categories: Category[],
    communityName?: string
  ): Promise<{ transaction: Transaction; caseId: u64 }> {
    communityName = this.ensureCommunityName(communityName);

    const community = await Community.retrieve(
      this.programId,
      this.connection,
      communityName
    );

    const caseId = community.data.nextCaseId;

    const transaction = new Transaction();

    transaction.add(
      await createCaseInstruction({
        programId: this.programId,
        payer: this.payerPublicKey,
        caseId,
        caseName,
        status,
        categories,
        communityName,
      })
    );

    return { transaction, caseId };
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
    caseName: string,
    status: CaseStatus,
    caseCategories: Category[],
    communityName?: string
  ): Promise<HapiActionResponseWithMeta<Case, { caseId: u64 }>> {
    communityName = this.ensureCommunityName(communityName);

    const { transaction, caseId } = await this.createCaseTransaction(
      caseName,
      status,
      caseCategories,
      communityName
    );

    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payerKeypair],
      { commitment: "confirmed" }
    );

    const { data, account } = await Case.retrieve(
      this.programId,
      this.connection,
      communityName,
      caseId
    );

    return { account, data, txHash, meta: { caseId } };
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
    caseId: u64,
    status: CaseStatus,
    categories: Category[],
    communityName?: string
  ): Promise<{ transaction: Transaction }> {
    communityName = this.ensureCommunityName(communityName);

    const transaction = new Transaction();

    transaction.add(
      await updateCaseInstruction({
        programId: this.programId,
        payer: this.payerPublicKey,
        communityName,
        caseId,
        status,
        categories,
      })
    );

    return { transaction };
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
    caseId: u64,
    status: CaseStatus,
    caseCategories: Category[],
    communityName?: string
  ): Promise<HapiActionResponse<Case>> {
    communityName = this.ensureCommunityName(communityName);

    const community = await Community.retrieve(
      this.programId,
      this.connection,
      communityName
    );

    const { transaction } = await this.updateCaseTransaction(
      caseId,
      status,
      caseCategories,
      communityName
    );

    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payerKeypair],
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
    networkName: string,
    address: PublicKey,
    caseId: u64,
    category: Category,
    risk: number,
    communityName?: string
  ): Promise<{ transaction: Transaction }> {
    communityName = this.ensureCommunityName(communityName);

    const transaction = new Transaction();

    risk = parseInt(risk.toString());
    if (risk < 0 || risk > 10) {
      throw new RangeError("risk should be an integer between 0 and 10");
    }

    transaction.add(
      await createAddressInstruction({
        programId: this.programId,
        payer: this.payerPublicKey,
        communityName,
        networkName,
        address,
        caseId,
        category,
        risk,
      })
    );

    return { transaction };
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
    networkName: string,
    address: PublicKey,
    caseId: u64,
    category: Category,
    risk: number,
    communityName?: string
  ): Promise<HapiActionResponse<Address>> {
    communityName = this.ensureCommunityName(communityName);

    const { transaction } = await this.createAddressTransaction(
      networkName,
      address,
      caseId,
      category,
      risk,
      communityName
    );

    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payerKeypair],
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
    networkName: string,
    address: PublicKey,
    caseId: u64,
    category: Category,
    risk: number,
    communityName?: string
  ): Promise<{ transaction: Transaction }> {
    communityName = this.ensureCommunityName(communityName);

    const transaction = new Transaction();

    transaction.add(
      await updateAddressInstruction({
        programId: this.programId,
        payer: this.payerPublicKey,
        communityName,
        networkName,
        address,
        caseId,
        category,
        risk,
      })
    );

    return { transaction };
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
    networkName: string,
    address: PublicKey,
    caseId: u64,
    category: Category,
    risk: number,
    communityName?: string
  ): Promise<HapiActionResponse<Address>> {
    communityName = this.ensureCommunityName(communityName);

    const { transaction } = await this.updateAddressTransaction(
      networkName,
      address,
      caseId,
      category,
      risk,
      communityName
    );

    const txHash = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [this.payerKeypair],
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
