import { Connection, PublicKey } from "@solana/web3.js";
import stringify from "fast-json-stable-stringify";
import nock from "nock";

import { Reporter, HapiAccountType, ReporterType } from "../../src/state";

describe("Reporter", () => {
  nock.disableNetConnect();

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
    nock("http://localhost:8899")
      .post(
        "/",
        ({ method, params: [address] }) =>
          method === "getAccountInfo" &&
          address === "GfwYi1NaoMFJUHzEXtTkXAQewxxqs7PbseAYnsfiNnS7"
      )
      .reply(200, {
        jsonrpc: "2.0",
        result: {
          context: { slot: 1113 },
          value: {
            data: [
              "AwMFAAAAQWxpY2UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
              "base64",
            ],
            executable: false,
            lamports: 1127520,
            owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
            rentEpoch: 0,
          },
        },
        id: "413a33f5-d343-4dad-9a58-826cef44bda7",
      });

    const conn = new Connection("http://localhost:8899");
    const reporter = await Reporter.retrieve(conn, "hapi.one", ALICE_PUBKEY);
    expect(stringify(reporter.data)).toEqual(stringify(REPORTER_SAMPLE));
  });
});
