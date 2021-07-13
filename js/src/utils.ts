import assert from "assert";
import BN from "bn.js";
import {
  Connection,
  Keypair,
  Transaction,
  TransactionInstruction,
} from "@solana/web3.js";

export class u8 extends BN {
  /**
   * Convert to Buffer representation
   */
  toBuffer(): Buffer {
    const a = super.toArray().reverse();
    const b = Buffer.from(a);
    if (b.length === 1) {
      return b;
    }
    assert(b.length < 1, "Numberu8 too large");

    const zeroPad = Buffer.alloc(1);
    b.copy(zeroPad);
    return zeroPad;
  }

  /**
   * Construct a Numberu8 from Buffer representation
   */
  static fromBuffer(buffer: Buffer): BN {
    assert(buffer.length === 1, `Invalid buffer length: ${buffer.length}`);
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
  /**
   * Convert to Buffer representation
   */
  toBuffer(): Buffer {
    const a = super.toArray().reverse();
    const b = Buffer.from(a);
    if (b.length === 4) {
      return b;
    }
    assert(b.length < 4, "Numberu32 too large");

    const zeroPad = Buffer.alloc(4);
    b.copy(zeroPad);
    return zeroPad;
  }

  /**
   * Construct a Numberu32 from Buffer representation
   */
  static fromBuffer(buffer: Buffer): BN {
    assert(buffer.length === 4, `Invalid buffer length: ${buffer.length}`);
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
  /**
   * Convert to Buffer representation
   */
  toBuffer(): Buffer {
    const a = super.toArray().reverse();
    const b = Buffer.from(a);
    if (b.length === 8) {
      return b;
    }
    assert(b.length < 8, "Numberu64 too large");

    const zeroPad = Buffer.alloc(8);
    b.copy(zeroPad);
    return zeroPad;
  }

  /**
   * Construct a Numberu64 from Buffer representation
   */
  static fromBuffer(buffer: Buffer): BN {
    assert(buffer.length === 8, `Invalid buffer length: ${buffer.length}`);
    return new BN(
      [...buffer]
        .reverse()
        .map((i) => `00${i.toString(16)}`.slice(-2))
        .join(""),
      16
    );
  }
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
