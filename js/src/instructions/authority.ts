import {
  AccountMeta,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";

import { Community, Network, Reporter, ReporterType } from "../state";
import {
  CreateCommunityIx,
  CreateNetworkIx,
  CreateReporterIx,
  UpdateReporterIx,
} from "./instructions";
import { SYSTEM_RENT_KEYS } from "./helpers";

export async function createCommunityInstruction({
  programId,
  payer,
  communityName,
}: {
  programId: PublicKey;
  payer: PublicKey;
  communityName: string;
}): Promise<TransactionInstruction> {
  if (Buffer.from(communityName).length > 28) {
    throw new Error("Community name length should not be over 28 bytes");
  }
  const [communityAddress] = await Community.getAddress(
    programId,
    communityName
  );

  const ix = new CreateCommunityIx();
  ix.name = communityName;

  const keys: AccountMeta[] = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: communityAddress, isSigner: false, isWritable: true },
    ...SYSTEM_RENT_KEYS,
  ];

  const instruction = new TransactionInstruction({
    keys,
    programId,
    data: ix.serialize(),
  });

  return instruction;
}

export async function createNetworkInstructions({
  programId,
  payer,
  communityName,
  networkName,
}: {
  programId: PublicKey;
  payer: PublicKey;
  communityName: string;
  networkName: string;
}): Promise<TransactionInstruction> {
  if (Buffer.from(networkName).length > 28) {
    throw new Error("Network name length should not be over 28 bytes");
  }

  const [communityAddress] = await Community.getAddress(
    programId,
    communityName
  );

  const [networkAddress] = await Network.getAddress(
    programId,
    communityAddress,
    networkName
  );

  const ix = new CreateNetworkIx();
  ix.name = networkName;

  const keys: AccountMeta[] = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: networkAddress, isSigner: false, isWritable: true },
    { pubkey: communityAddress, isSigner: false, isWritable: false },
    ...SYSTEM_RENT_KEYS,
  ];

  const instruction = new TransactionInstruction({
    keys,
    programId,
    data: ix.serialize(),
  });

  return instruction;
}

export async function createReporterInstructions({
  programId,
  payer,
  communityName,
  reporterPubkey,
  reporterType,
  reporterName,
}: {
  programId: PublicKey;
  payer: PublicKey;
  communityName: string;
  reporterPubkey: PublicKey;
  reporterType: ReporterType;
  reporterName: string;
}): Promise<TransactionInstruction> {
  if (Buffer.from(reporterName).length > 28) {
    throw new Error("Reporter name length should not be over 28 bytes");
  }

  const [communityAddress] = await Community.getAddress(
    programId,
    communityName
  );

  const [reporterAddress] = await Reporter.getAddress(
    programId,
    communityAddress,
    reporterPubkey
  );

  const ix = new CreateReporterIx();
  ix.reporter_type = reporterType;
  ix.name = reporterName;

  const keys: AccountMeta[] = [
    { pubkey: payer, isSigner: true, isWritable: false },
    { pubkey: communityAddress, isSigner: false, isWritable: true },
    { pubkey: reporterPubkey, isSigner: false, isWritable: false },
    { pubkey: reporterAddress, isSigner: false, isWritable: true },
    ...SYSTEM_RENT_KEYS,
  ];

  const instruction = new TransactionInstruction({
    keys,
    programId,
    data: ix.serialize(),
  });

  return instruction;
}

export async function updateReporterInstructions({
  programId,
  payer,
  communityName,
  reporterPubkey,
  reporterType,
  reporterName,
}: {
  programId: PublicKey;
  payer: PublicKey;
  communityName: string;
  reporterPubkey: PublicKey;
  reporterType: ReporterType;
  reporterName: string;
}): Promise<TransactionInstruction> {
  if (Buffer.from(reporterName).length > 28) {
    throw new Error("Reporter name length should not be over 28 bytes");
  }

  const [communityAddress] = await Community.getAddress(
    programId,
    communityName
  );

  const [reporterAddress] = await Reporter.getAddress(
    programId,
    communityAddress,
    reporterPubkey
  );

  const ix = new UpdateReporterIx();
  ix.name = reporterName;
  ix.reporter_type = reporterType;

  const keys: AccountMeta[] = [
    { pubkey: payer, isSigner: true, isWritable: false },
    { pubkey: communityAddress, isSigner: false, isWritable: true },
    { pubkey: reporterPubkey, isSigner: false, isWritable: false },
    { pubkey: reporterAddress, isSigner: false, isWritable: true },
  ];

  const instruction = new TransactionInstruction({
    keys,
    programId,
    data: ix.serialize(),
  });

  return instruction;
}
