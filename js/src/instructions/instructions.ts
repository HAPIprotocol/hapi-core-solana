import { serialize } from "borsh";

import { Category, ReporterType } from "../state";
import { u64 } from "../utils";

// This enum must match the order of a smart contract enum
export enum HapiInstruction {
  CreateCommunity,
  UpdateCommunity,
  CreateNetwork,
  CreateReporter,
  UpdateReporter,
  CreateCase,
  UpdateCase,
  CreateAddress,
  UpdateAddress,
}

abstract class Ix {
  protected tag: HapiInstruction;
  static schema = new Map();
  abstract serialize(): Buffer;
}

export class CreateCommunityIx extends Ix {
  protected tag = HapiInstruction.CreateCommunity;

  name: string;

  static schema = new Map([
    [
      CreateCommunityIx,
      {
        kind: "struct",
        fields: [
          ["tag", "u8"],
          ["name", "string"],
        ],
      },
    ],
  ]);

  serialize(): Buffer {
    return Buffer.from(serialize(CreateCommunityIx.schema, this));
  }
}

export class UpdateCommunityIx extends Ix {
  protected tag = HapiInstruction.UpdateCommunity;

  name: string;

  static schema = new Map([
    [
      UpdateCommunityIx,
      {
        kind: "struct",
        fields: [
          ["tag", "u8"],
          ["name", "string"],
        ],
      },
    ],
  ]);

  serialize(): Buffer {
    return Buffer.from(serialize(UpdateCommunityIx.schema, this));
  }
}

export class CreateNetworkIx extends Ix {
  protected tag = HapiInstruction.CreateNetwork;

  name: string;

  static schema = new Map([
    [
      CreateNetworkIx,
      {
        kind: "struct",
        fields: [
          ["tag", "u8"],
          ["name", "string"],
        ],
      },
    ],
  ]);

  serialize(): Buffer {
    return Buffer.from(serialize(CreateNetworkIx.schema, this));
  }
}

export class CreateReporterIx extends Ix {
  protected tag = HapiInstruction.CreateReporter;

  reporter_type: ReporterType;
  name: string;

  static schema = new Map([
    [
      CreateReporterIx,
      {
        kind: "struct",
        fields: [
          ["tag", "u8"],
          ["reporter_type", "u8"],
          ["name", "string"],
        ],
      },
    ],
  ]);

  serialize(): Buffer {
    return Buffer.from(serialize(CreateReporterIx.schema, this));
  }
}

export class UpdateReporterIx extends Ix {
  protected tag = HapiInstruction.UpdateReporter;

  reporter_type: ReporterType;
  name: string;

  static schema = new Map([
    [
      UpdateReporterIx,
      {
        kind: "struct",
        fields: [
          ["tag", "u8"],
          ["reporter_type", "u8"],
          ["name", "string"],
        ],
      },
    ],
  ]);

  serialize(): Buffer {
    return Buffer.from(serialize(UpdateReporterIx.schema, this));
  }
}

export class CreateCaseIx extends Ix {
  protected tag = HapiInstruction.CreateCase;

  categories: number;
  name: string;

  static schema = new Map([
    [
      CreateCaseIx,
      {
        kind: "struct",
        fields: [
          ["tag", "u8"],
          ["categories", "u32"],
          ["name", "string"],
        ],
      },
    ],
  ]);

  serialize(): Buffer {
    return Buffer.from(serialize(CreateCaseIx.schema, this));
  }
}

export class UpdateCaseIx extends Ix {
  protected tag = HapiInstruction.UpdateCase;

  categories: number;

  static schema = new Map([
    [
      UpdateCaseIx,
      {
        kind: "struct",
        fields: [
          ["tag", "u8"],
          ["categories", "u32"],
        ],
      },
    ],
  ]);

  serialize(): Buffer {
    return Buffer.from(serialize(UpdateCaseIx.schema, this));
  }
}

export class CreateAddressIx extends Ix {
  protected tag = HapiInstruction.CreateAddress;

  address: Uint8Array;
  risk: number;
  case_id: u64;
  category: Category;

  static schema = new Map([
    [
      CreateAddressIx,
      {
        kind: "struct",
        fields: [
          ["tag", "u8"],
          ["address", [32]],
          ["case_id", "u64"],
          ["category", "u8"],
        ],
      },
    ],
  ]);

  serialize(): Buffer {
    return Buffer.from(serialize(CreateAddressIx.schema, this));
  }
}

export class UpdateAddressIx extends Ix {
  protected tag = HapiInstruction.UpdateAddress;

  risk: number;
  case_id: u64;
  category: Category;

  static schema = new Map([
    [
      UpdateAddressIx,
      {
        kind: "struct",
        fields: [
          ["tag", "u8"],
          ["case_id", "u64"],
          ["category", "u8"],
        ],
      },
    ],
  ]);

  serialize(): Buffer {
    return Buffer.from(serialize(UpdateAddressIx.schema, this));
  }
}