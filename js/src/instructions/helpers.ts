import {
  AccountMeta,
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";
import BN from "bn.js";

import { Category, Categories } from "../state";
import { u32, u8 } from "../utils";
import { HAPI_PROGRAM_ID } from "../constants";

/**
 * Create an instruction for the system program to create an entity state account
 * @param connection Web3 connection to fetch rent exemption data
 * @param payer Public key of the payer account
 * @param publicKey Public key of an account to create
 * @param space Size in bytes of an account to create
 * @returns An instruction to append to a transaction
 **/
export async function createAccountInstruction(
  connection: Connection,
  payer: PublicKey,
  publicKey: PublicKey,
  space: number
): Promise<TransactionInstruction> {
  const lamports = await connection.getMinimumBalanceForRentExemption(space);

  return SystemProgram.createAccount({
    fromPubkey: payer,
    newAccountPubkey: publicKey,
    lamports,
    space,
    programId: HAPI_PROGRAM_ID,
  });
}

export function categoriesToBitmask(categories: Category[]): u32 {
  let bitmask = new u32(0);
  for (const category of categories) {
    bitmask = bitmask.or(new BN(category));
  }
  return bitmask;
}

export function categoryToBinary(category: Category): u8 {
  return new u8(Categories.indexOf(category));
}

export const SYSTEM_RENT_KEYS: AccountMeta[] = [
  {
    pubkey: SystemProgram.programId,
    isSigner: false,
    isWritable: false,
  },
  { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
];
