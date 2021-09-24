import {
  Connection,
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";

import { HAPI_PROGRAM_ID } from "../constants";
import { Case, Category, Community, Network, Reporter } from "../state";
import { setToBuffer } from "../utils";
import { HapiInstruction } from "./enums";

export async function reportCaseInstruction(
  connection: Connection,
  reporterPubkey: PublicKey,
  communityName: string,
  networkName: string,
  caseName: string,
  categories: Set<Category>
): Promise<TransactionInstruction> {
  const [communityAddress] = await Community.getAddress(communityName);

  const [networkAddress] = await Network.getAddress(
    communityAddress,
    networkName
  );

  const [reporterAddress] = await Reporter.getAddress(
    communityAddress,
    reporterPubkey
  );

  const network = await Network.retrieve(
    connection,
    communityName,
    networkName
  );

  const caseId = network.nextCaseId;

  const [caseAddress] = await Case.getAddress(networkAddress, caseId);

  const keys = [
    {
      pubkey: reporterPubkey,
      isSigner: true,
      isWritable: true,
    },
    {
      pubkey: communityAddress,
      isSigner: false,
      isWritable: false,
    },
    {
      pubkey: networkAddress,
      isSigner: false,
      isWritable: true,
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
