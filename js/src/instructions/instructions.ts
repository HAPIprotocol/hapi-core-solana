import { Struct } from "@solana/web3.js";

import { PROGRAM_SCHEMA } from "../schema";
import { ReporterType, HapiInstruction } from "../state";
import { u32, u64, u8 } from "../utils";

export class CreateCommunityIx extends Struct {
  protected tag = HapiInstruction.CreateCommunity;
  name: string;
}

PROGRAM_SCHEMA.set(CreateCommunityIx, {
  kind: "struct",
  fields: [
    ["tag", "u8"],
    ["name", "string"],
  ],
});

export class UpdateCommunityIx extends Struct {
  protected tag = HapiInstruction.UpdateCommunity;
  name: string;
}

PROGRAM_SCHEMA.set(UpdateCommunityIx, {
  kind: "struct",
  fields: [
    ["tag", "u8"],
    ["name", "string"],
  ],
});

export class CreateNetworkIx extends Struct {
  protected tag = HapiInstruction.CreateNetwork;
  name: string;
}

PROGRAM_SCHEMA.set(CreateNetworkIx, {
  kind: "struct",
  fields: [
    ["tag", "u8"],
    ["name", "string"],
  ],
});

export class CreateReporterIx extends Struct {
  protected tag = HapiInstruction.CreateReporter;
  reporterType: ReporterType;
  name: string;
}

PROGRAM_SCHEMA.set(CreateReporterIx, {
  kind: "struct",
  fields: [
    ["tag", "u8"],
    ["reporterType", "u8"],
    ["name", "string"],
  ],
});

export class UpdateReporterIx extends Struct {
  protected tag = HapiInstruction.UpdateReporter;
  reporterType: ReporterType;
  name: string;
}

PROGRAM_SCHEMA.set(UpdateReporterIx, {
  kind: "struct",
  fields: [
    ["tag", "u8"],
    ["reporterType", "u8"],
    ["name", "string"],
  ],
});

export class CreateCaseIx extends Struct {
  protected tag = HapiInstruction.CreateCase;
  caseId: u64;
  categories: u32;
  status: number;
  name: string;
}

PROGRAM_SCHEMA.set(CreateCaseIx, {
  kind: "struct",
  fields: [
    ["tag", "u8"],
    ["caseId", "u64"],
    ["categories", "u32"],
    ["status", "u8"],
    ["name", "string"],
  ],
});

export class UpdateCaseIx extends Struct {
  protected tag = HapiInstruction.UpdateCase;
  status: number;
  categories: u32;
}

PROGRAM_SCHEMA.set(UpdateCaseIx, {
  kind: "struct",
  fields: [
    ["tag", "u8"],
    ["categories", "u32"],
    ["status", "u8"],
  ],
});

export class CreateAddressIx extends Struct {
  protected tag = HapiInstruction.CreateAddress;
  address: Uint8Array;
  risk: number;
  caseId: u64;
  category: u8;
}

PROGRAM_SCHEMA.set(CreateAddressIx, {
  kind: "struct",
  fields: [
    ["tag", "u8"],
    ["address", [32]],
    ["risk", "u8"],
    ["caseId", "u64"],
    ["category", "u8"],
  ],
});

export class UpdateAddressIx extends Struct {
  protected tag = HapiInstruction.UpdateAddress;
  risk: number;
  caseId: u64;
  category: u8;
}

PROGRAM_SCHEMA.set(UpdateAddressIx, {
  kind: "struct",
  fields: [
    ["tag", "u8"],
    ["risk", "u8"],
    ["caseId", "u64"],
    ["category", "u8"],
  ],
});
