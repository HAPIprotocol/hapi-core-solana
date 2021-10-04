import { Connection, PublicKey } from "@solana/web3.js";
import stringify from "fast-json-stable-stringify";

import { Reporter, HapiAccountType, ReporterType } from "../src/state";

describe("Reporter", () => {
  const BINARY_SAMPLE = Buffer.from(
    "AwMFAAAAQWxpY2UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
    "base64"
  );

  const REPORTER_SAMPLE = new Reporter({
    accountType: HapiAccountType.Reporter,
    reporterType: ReporterType.Authority,
    name: "Alice",
  });

  const ALICE_PUBKEY = new PublicKey(
    "DzMkTkH6ms7hEzyHisFnLLc2WDJfBb9TNNaPDQ7ADHhy"
  );

  it("should serialize", () => {
    expect(REPORTER_SAMPLE.serialize()).toEqual(BINARY_SAMPLE);
  });

  it("should deserialize", () => {
    expect(Reporter.deserialize(BINARY_SAMPLE)).toEqual(REPORTER_SAMPLE);
  });

  it("should retrieve", async () => {
    const conn = new Connection("http://localhost:8899");
    const reporter = await Reporter.retrieve(conn, "hapi.one", ALICE_PUBKEY);
    expect(stringify(reporter)).toEqual(stringify(REPORTER_SAMPLE));
  });
});
