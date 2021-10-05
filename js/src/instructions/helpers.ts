import {
  PublicKey,
  SystemProgram,
  TransactionInstruction,
} from "@solana/web3.js";

import { HAPI_PROGRAM_ID } from "../constants";

/**
 * Create an instruction for the system program to create an entity state account
 * @param payer Public key of the payer account
 * @param publicKey Public key of an account to create
 * @param space Size in bytes of an account to create
 * @returns An instruction to append to a transaction
 **/
export async function createAccountInstruction(
  payer: PublicKey,
  publicKey: PublicKey,
  space: number
): Promise<TransactionInstruction> {
  const lamports = await this.connection.getMinimumBalanceForRentExemption(
    space
  );

  return SystemProgram.createAccount({
    fromPubkey: payer,
    newAccountPubkey: publicKey,
    lamports,
    space,
    programId: HAPI_PROGRAM_ID,
  });
}
