import { Connection, Keypair } from "@solana/web3.js";

export async function fundPayer(
  endpoint: string,
  payer: Keypair,
  lamports: number
): Promise<void> {
  const connection = new Connection(endpoint);
  const signature = await connection.requestAirdrop(payer.publicKey, lamports);
  await connection.confirmTransaction(signature, "confirmed");
}
