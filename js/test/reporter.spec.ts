import { Connection, PublicKey } from "@solana/web3.js";

import { Reporter, HapiAccountType, ReporterType } from "../src/state";

describe("Reporter", () => {
  const BINARY_SAMPLE = Buffer.from("AwMFAAAAQWxpY2U=", "base64");

  const REPORTER_SAMPLE = new Reporter({
    accountType: HapiAccountType.Reporter,
    reporterType: ReporterType.Authority,
    name: "Alice",
  });

  const ALICE_PUBKEY = new PublicKey(
    "D9Na2rQcFNDtzUyrpKxDz3dayMprE26aCPorUgcEvGd6"
  );

  it("should serialize", () => {
    expect(REPORTER_SAMPLE.serialize()).toEqual(BINARY_SAMPLE);
  });

  it("should deserialize", () => {
    expect(Reporter.deserialize(BINARY_SAMPLE)).toEqual(REPORTER_SAMPLE);
  });

  xit("should retrieve", async () => {
    const conn = new Connection("http://localhost:8899");
    const reporter = await Reporter.retrieve(conn, "hapi.one", ALICE_PUBKEY);
    expect(JSON.stringify(reporter)).toEqual(JSON.stringify(REPORTER_SAMPLE));
  });
});
