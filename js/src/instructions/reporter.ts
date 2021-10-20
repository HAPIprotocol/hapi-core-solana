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
  Categories,
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
  if (Buffer.from(caseName).length > 28) {
    throw new Error("Case name length should not be over 28 bytes");
  }

  if (status !== CaseStatus.Open && status !== CaseStatus.Closed) {
    throw new Error(`Unknown case status ${status}`);
  }

  categories.forEach((category) => {
    if (Categories.indexOf(category) < 0) {
      throw new Error(`Unknown category ${category}`);
    }
  });

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

  const ix = new CreateCaseIx({
    caseId,
    status,
    name: caseName,
    categories: categoriesToBitmask(categories),
  });

  const keys: AccountMeta[] = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: communityAddress, isSigner: false, isWritable: true },
    { pubkey: reporterAddress, isSigner: false, isWritable: false },
    { pubkey: caseAddress, isSigner: false, isWritable: true },
    ...SYSTEM_RENT_KEYS,
  ];

  const instruction = new TransactionInstruction({
    keys,
    programId,
    data: ix.encode(),
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
  categories.forEach((category) => {
    if (Categories.indexOf(category) < 0) {
      throw new Error(`Unknown category ${category}`);
    }
  });

  if (status !== CaseStatus.Open && status !== CaseStatus.Closed) {
    throw new Error(`Unknown case status ${status}`);
  }

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

  const ix = new UpdateCaseIx({
    status,
    categories: categoriesToBitmask(categories),
  });

  const keys: AccountMeta[] = [
    { pubkey: payer, isSigner: true, isWritable: true },
    { pubkey: communityAddress, isSigner: false, isWritable: false },
    { pubkey: reporterAddress, isSigner: false, isWritable: false },
    { pubkey: caseAddress, isSigner: false, isWritable: true },
  ];

  const instruction = new TransactionInstruction({
    keys,
    programId,
    data: ix.encode(),
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
  if (Categories.indexOf(category) < 0) {
    throw new Error(`Unknown category: ${category}`);
  }

  if (risk < 0 || risk > 10) {
    throw new RangeError(`Risk must have a value between 0 and 10`);
  }

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

  const ix = new CreateAddressIx({
    address: address.toBytes(),
    risk,
    caseId,
    category: categoryToBinary(category),
  });

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
    data: ix.encode(),
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
  if (Categories.indexOf(category) < 0) {
    throw new Error(`Unknown category: ${category}`);
  }

  if (risk < 0 || risk > 10) {
    throw new RangeError(`Risk must have a value between 0 and 10`);
  }

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

  const ix = new UpdateAddressIx({
    risk,
    caseId,
    category: categoryToBinary(category),
  });

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
    data: ix.encode(),
  });

  return instruction;
}
