import { Connection, PublicKey } from "@solana/web3.js";
import stringify from "fast-json-stable-stringify";

import { Address, Category, HapiAccountType } from "../src/state";
import { u64 } from "../src/utils";
import { assertBuffersEqual } from "./util/comparison";

describe("Address", () => {
  const BINARY_SAMPLE = Buffer.from("BQUBAAAAAAAAAA8=", "base64");
  const ADDRESS_SAMPLE = new Address({
    accountType: HapiAccountType.Address,
    caseId: new u64(1),
    risk: 5,
    category: Category.Theft,
  });

  it("should serialize", () => {
    assertBuffersEqual(ADDRESS_SAMPLE.serialize(), BINARY_SAMPLE);
  });

  it("should deserialize", () => {
    expect(stringify(Address.deserialize(BINARY_SAMPLE))).toEqual(
      stringify(ADDRESS_SAMPLE)
    );
  });

  xit("should retrieve", async () => {
    const conn = new Connection("http://localhost:8899");
    const network = await Address.retrieve(
      conn,
      "hapi.one",
      "test1",
      new PublicKey("2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew")
    );
    expect(JSON.stringify(network)).toEqual(JSON.stringify(ADDRESS_SAMPLE));
  });
});
