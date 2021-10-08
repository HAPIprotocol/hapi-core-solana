import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";

import { Community, Network, Reporter, ReporterType } from "../state";
import { HAPI_PROGRAM_ID } from "../constants";
import {
  CreateCommunityIx,
  CreateNetworkIx,
  CreateReporterIx,
  UpdateReporterIx,
} from "./instructions";

export async function createCommunityInstruction({
  payer,
  communityName,
}: {
  payer: PublicKey;
  communityName: string;
}): Promise<TransactionInstruction> {
  const [communityAddress] = await Community.getAddress(communityName);

  const ix = new CreateCommunityIx();
  ix.name = communityName;

  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: communityAddress, isSigner: false, isWritable: true },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
  ];

  const instruction = new TransactionInstruction({
    keys,
    programId: HAPI_PROGRAM_ID,
    data: ix.serialize(),
  });

  return instruction;
}

export async function createNetworkInstructions({
  payer,
  communityName,
  networkName,
}: {
  payer: PublicKey;
  communityName: string;
  networkName: string;
}): Promise<TransactionInstruction> {
  const [communityAddress] = await Community.getAddress(communityName);

  const [networkAddress] = await Network.getAddress(
    communityAddress,
    networkName
  );

  const ix = new CreateNetworkIx();
  ix.name = networkName;

  const keys = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: networkAddress, isSigner: false, isWritable: true },
    { pubkey: communityAddress, isSigner: false, isWritable: false },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
  ];

  const instruction = new TransactionInstruction({
    keys,
    programId: HAPI_PROGRAM_ID,
    data: ix.serialize(),
  });

  return instruction;
}

export async function createReporterInstructions({
  payer,
  communityName,
  reporterPubkey,
  reporterType,
  reporterName,
}: {
  payer: PublicKey;
  communityName: string;
  reporterPubkey: PublicKey;
  reporterType: ReporterType;
  reporterName: string;
}): Promise<TransactionInstruction> {
  const [communityAddress] = await Community.getAddress(communityName);

  const [reporterAddress] = await Reporter.getAddress(
    communityAddress,
    reporterPubkey
  );

  const ix = new CreateReporterIx();
  ix.reporter_type = reporterType;
  ix.name = reporterName;

  const keys = [
    { pubkey: payer, isSigner: true, isWritable: false },
    { pubkey: communityAddress, isSigner: false, isWritable: true },
    { pubkey: reporterPubkey, isSigner: false, isWritable: false },
    { pubkey: reporterAddress, isSigner: false, isWritable: true },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
  ];

  const instruction = new TransactionInstruction({
    keys,
    programId: HAPI_PROGRAM_ID,
    data: ix.serialize(),
  });

  return instruction;
}

export async function updateReporterInstructions({
  payer,
  communityName,
  reporterPubkey,
  reporterType,
  reporterName,
}: {
  payer: PublicKey;
  communityName: string;
  reporterPubkey: PublicKey;
  reporterType: ReporterType;
  reporterName: string;
}): Promise<TransactionInstruction> {
  const [communityAddress] = await Community.getAddress(communityName);

  const [reporterAddress] = await Reporter.getAddress(
    communityAddress,
    reporterPubkey
  );

  const ix = new UpdateReporterIx();
  ix.name = reporterName;
  ix.reporter_type = reporterType;

  const keys = [
    { pubkey: payer, isSigner: true, isWritable: false },
    { pubkey: communityAddress, isSigner: false, isWritable: true },
    { pubkey: reporterPubkey, isSigner: false, isWritable: false },
    { pubkey: reporterAddress, isSigner: false, isWritable: true },
  ];

  const instruction = new TransactionInstruction({
    keys,
    programId: HAPI_PROGRAM_ID,
    data: ix.serialize(),
  });

  return instruction;
}
