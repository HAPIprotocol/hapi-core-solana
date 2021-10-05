import {
  Transaction,
  TransactionInstruction,
  PublicKey,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  sendAndConfirmTransaction,
} from "@solana/web3.js";

import { Community, HapiAccountType } from "./state";
import { HapiActionResponse, ReaderClient } from "./reader-client";
import { HAPI_PROGRAM_ID } from "constants";

export class AuthorityClient extends ReaderClient {
  async createCommunity(
    communityName: string
  ): Promise<HapiActionResponse<Community>> {
    let existingAccount: PublicKey;
    try {
      const existing = await this.getCommunity(communityName);
      existingAccount = existing.account;
    } catch {
      // NOP
    }

    if (existingAccount) {
      throw new Error(
        `Community already exists: ${communityName} (${existingAccount})`
      );
    }

    const authority = new Keypair();

    const [communityAddress] = await Community.getAddress(communityName);

    const transaction = new Transaction();

    {
      SystemProgram.createAccount({
        space: Community.size,
        programId: 
      })

      // TODO: zzzzzzzzzzzzzzz....

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: authority.publicKey, isSigner: true, isWritable: true },
          { pubkey: communityAddress, isSigner: false, isWritable: true },
          { pubkey: authority.publicKey, isSigner: false, isWritable: false, }
        ],
        programId: HAPI_PROGRAM_ID,
        data: Buffer.alloc(0),
      });
    }

    {
      const community = new Community({
        accountType: HapiAccountType.Community,
        name: communityName,
        authority: authority.publicKey,
      });

      const instruction = new TransactionInstruction({
        keys: [
          { pubkey: authority.publicKey, isSigner: true, isWritable: false },
          { pubkey: communityAddress, isSigner: false, isWritable: true },
          {
            pubkey: SystemProgram.programId,
            isSigner: false,
            isWritable: false,
          },
          { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
        ],
        programId: HAPI_PROGRAM_ID,
        data: Buffer.from(community.serialize()),
      });

      transaction.add(instruction);
    }
    const signature = await sendAndConfirmTransaction(
      this.connection,
      transaction,
      [authority],
      { commitment: "confirmed" }
    );

    // TODO: create an instruction
    return {
      publicKey: communityAddress,
      txHash: signature,
    };
  }

  async createNetwork(): Promise<void> {
    // TODO: create an instruction
  }

  async createReporter(): Promise<void> {
    // TODO: create an instruction
  }

  async updateReporter(): Promise<void> {
    // TODO: create an instruction
  }
}
