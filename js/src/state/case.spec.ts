import { Connection, PublicKey } from "@solana/web3.js";
import stringify from "fast-json-stable-stringify";
import nock from "nock";

import { Case, Category, HapiAccountType } from ".";
import { u64 } from "../utils";
import { assertBuffersEqual } from "../../test/util/comparison";
import { mockRpcOk } from "../../test/util/mocks";

describe("Case", () => {
  nock.disableNetConnect();

  const endpoint = "http://localhost:8899";

  const BINARY_SAMPLE_1 = Buffer.from(
    "BMD9z4HkaJp54Mtk2ICY9TQpEGUqNA3cBwPb2xA4bcZ4AAAAAAUAAABjYXNlMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
    "base64"
  );

  const BINARY_SAMPLE_2 = Buffer.from(
    "BP3WE+1FkAhS4zhPJcodNQ4RQWJLiL9PwXCCLUdnpS3qAFAAAAUAAABjYXNlMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
    "base64"
  );

  const CASE_SAMPLE_1 = new Case({
    accountType: HapiAccountType.Case,
    name: "case0",
    reporterKey: new PublicKey("DzMkTkH6ms7hEzyHisFnLLc2WDJfBb9TNNaPDQ7ADHhy"),
    categories: [],
  });

  const CASE_SAMPLE_2 = new Case({
    accountType: HapiAccountType.Case,
    name: "case1",
    reporterKey: new PublicKey("J5sUnZKuB1a9izNWDb4JEQzdB3J6mhe3sP6Ai6YCiKAZ"),
    categories: [Category.Theft, Category.Scam],
  });

  it("should serialize - case0", () => {
    assertBuffersEqual(CASE_SAMPLE_1.serialize(), BINARY_SAMPLE_1);
  });

  it("should deserialize - case0", () => {
    expect(JSON.stringify(Case.deserialize(BINARY_SAMPLE_1))).toEqual(
      JSON.stringify(CASE_SAMPLE_1)
    );
  });

  it("should retrieve - case0", async () => {
    mockRpcOk(
      endpoint,
      "getAccountInfo",
      ["63G8TLWGQpd26UZj7L9Qr9e3R1MPbybLcW3A7LXtG1Sk"],
      {
        context: { slot: 4131 },
        value: {
          data: [
            "BMD9z4HkaJp54Mtk2ICY9TQpEGUqNA3cBwPb2xA4bcZ4AAAAAAUAAABjYXNlMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
            "base64",
          ],
          executable: false,
          lamports: 1378080,
          owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
          rentEpoch: 0,
        },
      }
    );
    const conn = new Connection(endpoint);
    const state = await Case.retrieve(conn, "hapi.one", new u64(0));
    expect(stringify(state.data)).toEqual(stringify(CASE_SAMPLE_1));
  });

  it("should serialize - case1", () => {
    assertBuffersEqual(CASE_SAMPLE_2.serialize(), BINARY_SAMPLE_2);
  });

  it("should deserialize - case1", () => {
    expect(stringify(Case.deserialize(BINARY_SAMPLE_2))).toEqual(
      stringify(CASE_SAMPLE_2)
    );
  });

  it("should retrieve - case1", async () => {
    mockRpcOk(
      endpoint,
      "getAccountInfo",
      ["6vGsVQ1YMu5zkNUMJ5j5H1TVimfennBcYuYP9hXw1kB2"],
      {
        context: { slot: 4131 },
        value: {
          data: [
            "BP3WE+1FkAhS4zhPJcodNQ4RQWJLiL9PwXCCLUdnpS3qAFAAAAUAAABjYXNlMQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
            "base64",
          ],
          executable: false,
          lamports: 1378080,
          owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
          rentEpoch: 0,
        },
      }
    );

    const conn = new Connection(endpoint);
    const state = await Case.retrieve(conn, "hapi.one", new u64(1));
    expect(stringify(state.data)).toEqual(stringify(CASE_SAMPLE_2));
  });
});
