import { Connection, PublicKey } from "@solana/web3.js";
import stringify from "fast-json-stable-stringify";
import nock from "nock";

import { HAPI_PROGRAM_ID } from "../constants";
import { Reporter, HapiAccountType, ReporterType } from ".";
import { mockRpcOk } from "../../test/util/mocks";

describe("Reporter", () => {
  nock.disableNetConnect();

  const endpoint = "http://localhost:8899";
  const programId = HAPI_PROGRAM_ID;

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
    mockRpcOk(
      endpoint,
      "getAccountInfo",
      ["GfwYi1NaoMFJUHzEXtTkXAQewxxqs7PbseAYnsfiNnS7"],
      {
        context: { slot: 1113 },
        value: {
          data: ["AwMFAAAAQWxpY2UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==", "base64"],
          executable: false,
          lamports: 1127520,
          owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
          rentEpoch: 0,
        },
      }
    );
    const conn = new Connection(endpoint);
    const reporter = await Reporter.retrieve(
      programId,
      conn,
      "hapi.one",
      ALICE_PUBKEY
    );
    expect(stringify(reporter.data)).toEqual(stringify(REPORTER_SAMPLE));
  });
});
