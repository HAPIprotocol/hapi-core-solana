import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";

import { HAPI_PROGRAM_ID } from "../constants";
import { Case, Category, Community, Reporter } from "../state";
import { setToBuffer } from "../utils";
import { HapiInstruction } from "./enums";

export async function createCaseInstruction(
  connection: Connection,
  reporterPubkey: PublicKey,
  communityName: string,
  caseName: string,
  categories: Set<Category>
): Promise<TransactionInstruction> {
  const community = await Community.retrieve(connection, communityName);

  const [reporterAddress] = await Reporter.getAddress(
    community.account,
    reporterPubkey
  );

  const caseId = community.data.nextCaseId;

  const [caseAddress] = await Case.getAddress(community.account, caseId);

  const keys = [
    {
      pubkey: reporterPubkey,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: community.account,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: reporterAddress,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: caseAddress,
      isSigner: false,
      isWritable: true,
    },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: SYSVAR_RENT_PUBKEY,
      isSigner: false,
      isWritable: false,
    },
  ];

  const buffers = [
    Buffer.from(Int8Array.from([HapiInstruction.ReportCase])),
    Buffer.from(caseName),
    setToBuffer(categories),
  ];

  const data = Buffer.concat(buffers);

  return new TransactionInstruction({
    keys,
    data,
    programId: HAPI_PROGRAM_ID,
  });
}
