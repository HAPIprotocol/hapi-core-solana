import { Connection, Keypair } from "@solana/web3.js";

export async function fundPayer(
  endpoint: string,
  payer: Keypair,
  amount: number
): Promise<void> {
  const connection = new Connection(endpoint);
  const signature = await connection.requestAirdrop(payer.publicKey, amount);
  await connection.confirmTransaction(signature, "confirmed");
}
