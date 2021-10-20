import { serialize, deserializeUnchecked, deserialize } from "borsh";

import { ReporterType, HapiInstruction } from "../state";
import { u32, u64, u8 } from "../utils";

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

  static from(buffer: Buffer): CreateCommunityIx {
    return deserializeUnchecked(
      CreateCommunityIx.schema,
      CreateCommunityIx,
      buffer
    );
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

  static from(buffer: Buffer): UpdateCommunityIx {
    return deserializeUnchecked(
      UpdateCommunityIx.schema,
      UpdateCommunityIx,
      buffer
    );
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

  static from(buffer: Buffer): CreateNetworkIx {
    return deserializeUnchecked(
      CreateNetworkIx.schema,
      CreateNetworkIx,
      buffer
    );
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

  static from(buffer: Buffer): CreateReporterIx {
    return deserializeUnchecked(
      CreateReporterIx.schema,
      CreateReporterIx,
      buffer
    );
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

  static from(buffer: Buffer): UpdateReporterIx {
    return deserializeUnchecked(
      UpdateReporterIx.schema,
      UpdateReporterIx,
      buffer
    );
  }
}

export class CreateCaseIx extends Ix {
  protected tag = HapiInstruction.CreateCase;

  case_id: u64;
  categories: u32;
  status: number;
  name: string;

  static schema = new Map([
    [
      CreateCaseIx,
      {
        kind: "struct",
        fields: [
          ["tag", "u8"],
          ["case_id", "u64"],
          ["categories", "u32"],
          ["status", "u8"],
          ["name", "string"],
        ],
      },
    ],
  ]);

  serialize(): Buffer {
    return Buffer.from(serialize(CreateCaseIx.schema, this));
  }

  static from(buffer: Buffer): CreateCaseIx {
    return deserializeUnchecked(CreateCaseIx.schema, CreateCaseIx, buffer);
  }
}

export class UpdateCaseIx extends Ix {
  protected tag = HapiInstruction.UpdateCase;

  status: number;
  categories: u32;

  static schema = new Map([
    [
      UpdateCaseIx,
      {
        kind: "struct",
        fields: [
          ["tag", "u8"],
          ["categories", "u32"],
          ["status", "u8"],
        ],
      },
    ],
  ]);

  serialize(): Buffer {
    return Buffer.from(serialize(UpdateCaseIx.schema, this));
  }

  static from(buffer: Buffer): UpdateCaseIx {
    return deserializeUnchecked(UpdateCaseIx.schema, UpdateCaseIx, buffer);
  }
}

export class CreateAddressIx extends Ix {
  protected tag = HapiInstruction.CreateAddress;

  address: Uint8Array;
  risk: number;
  case_id: u64;
  category: u8;

  static schema = new Map([
    [
      CreateAddressIx,
      {
        kind: "struct",
        fields: [
          ["tag", "u8"],
          ["address", [32]],
          ["risk", "u8"],
          ["case_id", "u64"],
          ["category", "u8"],
        ],
      },
    ],
  ]);

  serialize(): Buffer {
    return Buffer.from(serialize(CreateAddressIx.schema, this));
  }

  static from(buffer: Buffer): CreateAddressIx {
    return deserialize(CreateAddressIx.schema, CreateAddressIx, buffer);
  }
}

export class UpdateAddressIx extends Ix {
  protected tag = HapiInstruction.UpdateAddress;

  risk: number;
  case_id: u64;
  category: u8;

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

  static from(buffer: Buffer): UpdateAddressIx {
    return deserializeUnchecked(
      UpdateAddressIx.schema,
      UpdateAddressIx,
      buffer
    );
  }
}
