import { PublicKey } from "@solana/web3.js";

import { HapiActionResponse, ReaderClient } from "./reader-client";
import { Case, Category } from "./state";

/** HAPI client to operate reporter program functions on Solana */
export class ReporterClient extends ReaderClient {
  async createCase(
    name: string,
    categories: Category[],
    communityName?: string
  ): Promise<HapiActionResponse<Case>> {
    name;
    categories;
    communityName;
    // TODO: create an instruction
    return {
      account: new PublicKey("0"),
    };
  }

  async updateCase(): Promise<void> {
    // TODO: create an instruction
  }

  async createAddress(): Promise<void> {
    // TODO: create an instruction
  }

  async updateAddress(): Promise<void> {
    // TODO: create an instruction
  }
}
