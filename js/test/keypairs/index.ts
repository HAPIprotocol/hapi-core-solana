import { Keypair } from "@solana/web3.js";

import authority_sk from "./authority.json";
import nobody_sk from "./nobody.json";
import reporter_alice_sk from "./reporter-alice.json";
import reporter_bob_sk from "./reporter-bob.json";
import reporter_carol_sk from "./reporter-carol.json";
import uninitialized_sk from "./uninitialized.json";

export const AUTHORITY = Keypair.fromSecretKey(Uint8Array.from(authority_sk));
export const NOBODY = Keypair.fromSecretKey(Uint8Array.from(nobody_sk));
export const REPORTER_ALICE = Keypair.fromSecretKey(
  Uint8Array.from(reporter_alice_sk)
);
export const REPORTER_BOB = Keypair.fromSecretKey(
  Uint8Array.from(reporter_bob_sk)
);
export const REPORTER_CAROL = Keypair.fromSecretKey(
  Uint8Array.from(reporter_carol_sk)
);
export const UNINITIALIZED = Keypair.fromSecretKey(
  Uint8Array.from(uninitialized_sk)
);
