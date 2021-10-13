import {
  AccountMeta,
  PublicKey,
  TransactionInstruction,
} from "@solana/web3.js";

import { u64 } from "../utils";
import {
  Address,
  Case,
  Network,
  Category,
  Community,
  Reporter,
  CaseStatus,
} from "../state";
import {
  categoriesToBitmask,
  categoryToBinary,
  SYSTEM_RENT_KEYS,
} from "./helpers";
import {
  CreateAddressIx,
  CreateCaseIx,
  UpdateAddressIx,
  UpdateCaseIx,
} from "./instructions";

export async function createCaseInstruction({
  programId,
  payer,
  communityName,
  caseId,
  caseName,
  status,
  categories,
}: {
  programId: PublicKey;
  payer: PublicKey;
  communityName: string;
  caseId: u64;
  caseName: string;
  status: CaseStatus;
  categories: Category[];
}): Promise<TransactionInstruction> {
  const [communityAddress] = await Community.getAddress(
    programId,
    communityName
  );

  const [reporterAddress] = await Reporter.getAddress(
    programId,
    communityAddress,
    payer
  );

  const [caseAddress] = await Case.getAddress(
    programId,
    communityAddress,
    caseId
  );

  const ix = new CreateCaseIx();
  ix.name = caseName;
  ix.categories = categoriesToBitmask(categories);
  ix.status = status;

  const keys: AccountMeta[] = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: communityAddress, isSigner: false, isWritable: false },
    { pubkey: reporterAddress, isSigner: false, isWritable: false },
    { pubkey: caseAddress, isSigner: false, isWritable: false },
    ...SYSTEM_RENT_KEYS,
  ];

  const instruction = new TransactionInstruction({
    keys,
    programId,
    data: ix.serialize(),
  });

  return instruction;
}

export async function updateCaseInstruction({
  programId,
  payer,
  communityName,
  caseId,
  status,
  categories,
}: {
  programId: PublicKey;
  payer: PublicKey;
  communityName: string;
  caseId: u64;
  status: CaseStatus;
  categories: Category[];
}): Promise<TransactionInstruction> {
  const [communityAddress] = await Community.getAddress(
    programId,
    communityName
  );

  const [reporterAddress] = await Reporter.getAddress(
    programId,
    communityAddress,
    payer
  );

  const [caseAddress] = await Case.getAddress(
    programId,
    communityAddress,
    caseId
  );

  const ix = new UpdateCaseIx();
  ix.categories = categoriesToBitmask(categories);
  ix.status = status;

  const keys: AccountMeta[] = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: communityAddress, isSigner: false, isWritable: false },
    { pubkey: reporterAddress, isSigner: false, isWritable: false },
    { pubkey: caseAddress, isSigner: false, isWritable: false },
  ];

  const instruction = new TransactionInstruction({
    keys,
    programId,
    data: ix.serialize(),
  });

  return instruction;
}

export async function createAddressInstruction({
  programId,
  payer,
  communityName,
  networkName,
  address,
  caseId,
  risk,
  category,
}: {
  programId: PublicKey;
  payer: PublicKey;
  communityName: string;
  networkName: string;
  address: PublicKey;
  caseId: u64;
  risk: number;
  category: Category;
}): Promise<TransactionInstruction> {
  const [communityAddress] = await Community.getAddress(
    programId,
    communityName
  );

  const [reporterAddress] = await Reporter.getAddress(
    programId,
    communityAddress,
    payer
  );

  const [networkAddress] = await Network.getAddress(
    programId,
    communityAddress,
    networkName
  );

  const [caseAddress] = await Case.getAddress(
    programId,
    communityAddress,
    caseId
  );

  const [addressAddress] = await Address.getAddress(
    programId,
    networkAddress,
    address
  );

  const ix = new CreateAddressIx();
  ix.address = address.toBytes();
  ix.risk = risk;
  ix.case_id = caseId;
  ix.category = categoryToBinary(category);

  const keys: AccountMeta[] = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: communityAddress, isSigner: false, isWritable: true },
    { pubkey: networkAddress, isSigner: false, isWritable: false },
    { pubkey: reporterAddress, isSigner: false, isWritable: false },
    { pubkey: caseAddress, isSigner: false, isWritable: false },
    { pubkey: addressAddress, isSigner: false, isWritable: true },
    ...SYSTEM_RENT_KEYS,
  ];

  const instruction = new TransactionInstruction({
    keys,
    programId,
    data: ix.serialize(),
  });

  return instruction;
}

export async function updateAddressInstruction({
  programId,
  payer,
  communityName,
  networkName,
  address,
  caseId,
  risk,
  category,
}: {
  programId: PublicKey;
  payer: PublicKey;
  communityName: string;
  networkName: string;
  address: PublicKey;
  caseId: u64;
  risk: number;
  category: Category;
}): Promise<TransactionInstruction> {
  const [communityAddress] = await Community.getAddress(
    programId,
    communityName
  );

  const [reporterAddress] = await Reporter.getAddress(
    programId,
    communityAddress,
    payer
  );

  const [networkAddress] = await Network.getAddress(
    programId,
    communityAddress,
    networkName
  );

  const [caseAddress] = await Case.getAddress(
    programId,
    communityAddress,
    caseId
  );

  const [addressAddress] = await Address.getAddress(
    programId,
    networkAddress,
    address
  );

  const ix = new UpdateAddressIx();
  ix.risk = risk;
  ix.case_id = caseId;
  ix.category = categoryToBinary(category);

  const keys: AccountMeta[] = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: communityAddress, isSigner: false, isWritable: false },
    { pubkey: networkAddress, isSigner: false, isWritable: false },
    { pubkey: reporterAddress, isSigner: false, isWritable: false },
    { pubkey: caseAddress, isSigner: false, isWritable: false },
    { pubkey: addressAddress, isSigner: false, isWritable: true },
  ];

  const instruction = new TransactionInstruction({
    keys,
    programId,
    data: ix.serialize(),
  });

  return instruction;
}
