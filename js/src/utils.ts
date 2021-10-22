import BN from "bn.js";
import { decode } from "bs58";
import {
  Connection,
  Keypair,
  PublicKey,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

export class u8 extends BN {
  static size = 1;

  constructor(...args: ConstructorParameters<typeof BN>) {
    super(...args);
    Object.setPrototypeOf(this, u8.prototype);
  }

  /**
   * Convert to Buffer representation
   */
  toBuffer(): Buffer {
    return bnToBuffer(this, u8.size);
  }

  /**
   * Construct a Numberu8 from Buffer representation
   */
  static fromBuffer(buffer: Buffer): BN {
    if (buffer.length !== u8.size) {
      throw new Error(`Invalid buffer length: ${buffer.length}`);
    }
    return new BN(
      [...buffer]
        .reverse()
        .map((i) => `00${i.toString(4)}`.slice(-2))
        .join(""),
      16
    );
  }
}

export class u32 extends BN {
  static size = 4;

  constructor(...args: ConstructorParameters<typeof BN>) {
    super(...args);
    Object.setPrototypeOf(this, u32.prototype);
  }

  /**
   * Convert to Buffer representation
   */
  toBuffer(): Buffer {
    return bnToBuffer(this, u32.size);
  }

  /**
   * Construct a Numberu32 from Buffer representation
   */
  static fromBuffer(buffer: Buffer): BN {
    if (buffer.length !== u32.size) {
      throw new Error(`Invalid buffer length: ${buffer.length}`);
    }
    return new BN(
      [...buffer]
        .reverse()
        .map((i) => `00${i.toString(16)}`.slice(-2))
        .join(""),
      16
    );
  }
}

export class u64 extends BN {
  static size = 8;

  constructor(...args: ConstructorParameters<typeof BN>) {
    super(...args);
    Object.setPrototypeOf(this, u64.prototype);
  }

  /**
   * Convert to Buffer representation
   */
  toBuffer(): Buffer {
    return bnToBuffer(this, u64.size);
  }

  /**
   * Construct a Numberu64 from Buffer representation
   */
  static fromBuffer(buffer: Buffer): BN {
    if (buffer.length !== u64.size) {
      throw new Error(`Invalid buffer length: ${buffer.length}`);
    }
    return new BN(
      [...buffer]
        .reverse()
        .map((i) => `00${i.toString(16)}`.slice(-2))
        .join(""),
      16
    );
  }
}

export function bnToBuffer(bn: BN, size: number): Buffer {
  const a = bn.toArray().reverse();
  const b = Buffer.from(a);
  if (b.length === size) {
    return b;
  }
  if (b.length > size) {
    throw new Error(`Buffer too large (size: ${size})`);
  }

  const zeroPad = Buffer.alloc(size);
  b.copy(zeroPad);
  return zeroPad;
}

export const signAndSendTransactionInstructions = async (
  // sign and send transaction
  connection: Connection,
  signers: Array<Keypair>,
  feePayer: Keypair,
  txInstructions: Array<TransactionInstruction>
): Promise<string> => {
  const tx = new Transaction();
  tx.feePayer = feePayer.publicKey;
  signers.push(feePayer);
  tx.add(...txInstructions);
  return await connection.sendTransaction(tx, signers, {
    preflightCommitment: "single",
  });
};

export function mapToBuffer<K extends number, V extends number | boolean>(
  map: Map<K, V>
): Buffer {
  const buffer = Buffer.alloc(4 + map.size * 2);

  // Write size header
  buffer.writeUInt32LE(map.size);

  // Write map KVs
  let i = 4;
  const keys = Array.from(map.keys()).sort((a, b) => a - b);
  for (const key of keys) {
    buffer.writeUInt8(key, i);
    buffer.writeUInt8(map.get(key) ? 1 : 0, i + 1);
    i += 2;
  }

  return buffer;
}

export function setToBuffer<T extends number>(set: Set<T>, size = 4): Buffer {
  let value = new BN(0);

  for (const i of set.values()) {
    value = value.or(new BN(i));
  }

  return value.toBuffer("le", size);
}

export function base58ToPublicKey(address: string): PublicKey {
  const buffer = decode(address);
  return new PublicKey(buffer);
}

export function hexToPublicKey(hex: string): PublicKey {
  const byteLength = Buffer.from(hex, "hex").length;
  if (byteLength > 32) {
    throw RangeError(
      `hexToPublicKey: input length can't be longer than 32 bytes`
    );
  }
  const buffer = Buffer.alloc(32);
  buffer.write(hex, 32 - byteLength, "hex");
  return PublicKey.decodeUnchecked(buffer);
}
