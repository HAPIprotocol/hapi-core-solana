import {
  Commitment,
  Connection,
  ConnectionConfig,
  Keypair,
  PublicKey,
} from "@solana/web3.js";

export interface HapiClientConfig {
  endpoint: string | Connection;
  commitment?: Commitment | ConnectionConfig;
  communityName?: string;
  programId?: string;
}

export interface HapiViewResponse<T> {
  account: PublicKey;
  data: T;
}

export interface HapiActionResponse<T> {
  txHash: string;
  account: PublicKey;
  data: T;
}

export interface HapiActionResponseWithMeta<T, U> {
  txHash: string;
  account: PublicKey;
  data: T;
  meta: U;
}

export interface HapiClientAuthorityConfig extends HapiClientConfig {
  payer: Keypair | PublicKey;
}

export interface HapiClientReporterConfig extends HapiClientConfig {
  payer: Keypair | PublicKey;
}
