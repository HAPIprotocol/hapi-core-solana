import { Connection, PublicKey } from "@solana/web3.js";

export * from "./state";

export const HAPI_PROGRAM_ID = new PublicKey(
  "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7"
);

export class HapiClient {
  connection: Connection;
}
