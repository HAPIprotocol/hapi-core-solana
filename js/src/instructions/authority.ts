import {
  PublicKey,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TransactionInstruction,
} from "@solana/web3.js";

import { Community, Network, HapiAccountType } from "../state";
import { HAPI_PROGRAM_ID } from "../constants";

export async function createCommunityInstruction({
  payer,
  communityName,
  authority,
}: {
  payer: PublicKey;
  communityName: string;
  authority?: PublicKey;
}): Promise<TransactionInstruction> {
  const [communityAddress] = await Community.getAddress(communityName);

  const community = new Community({
    accountType: HapiAccountType.Community,
    name: communityName,
    authority: authority || payer,
  });

  const keys = [
    { pubkey: payer, isSigner: true, isWritable: false },
    { pubkey: communityAddress, isSigner: false, isWritable: true },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
  ];

  const data = Buffer.from(community.serialize());

  const instruction = new TransactionInstruction({
    keys,
    programId: HAPI_PROGRAM_ID,
    data,
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

  const network = new Network({
    accountType: HapiAccountType.Network,
    name: networkName,
  });

  const keys = [
    { pubkey: payer, isSigner: true, isWritable: false },
    { pubkey: networkAddress, isSigner: false, isWritable: true },
    { pubkey: communityAddress, isSigner: false, isWritable: true },
    {
      pubkey: SystemProgram.programId,
      isSigner: false,
      isWritable: false,
    },
    { pubkey: SYSVAR_RENT_PUBKEY, isSigner: false, isWritable: false },
  ];

  const data = Buffer.from(network.serialize());

  const instruction = new TransactionInstruction({
    keys,
    programId: HAPI_PROGRAM_ID,
    data,
  });

  return instruction;
}

export async function createReporterInstructions(): Promise<TransactionInstruction> {
  const data = Buffer.alloc(0);

  const instruction = new TransactionInstruction({
    keys: [],
    programId: HAPI_PROGRAM_ID,
    data,
  });

  return instruction;
}

export async function updateReporterInstructions(): Promise<TransactionInstruction> {
  const data = Buffer.alloc(0);

  const instruction = new TransactionInstruction({
    keys: [],
    programId: HAPI_PROGRAM_ID,
    data,
  });

  return instruction;
}
