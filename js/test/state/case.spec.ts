import { Connection, PublicKey } from "@solana/web3.js";
import stringify from "fast-json-stable-stringify";
import nock from "nock";

import { Case, Category, HapiAccountType } from "../../src/state";
import { u64 } from "../../src/utils";
import { assertBuffersEqual } from "../util/comparison";

describe("Case", () => {
  nock.disableNetConnect();

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
    nock("http://localhost:8899")
      .post(
        "/",
        ({ method, params: [address] }) =>
          method === "getAccountInfo" &&
          address === "63G8TLWGQpd26UZj7L9Qr9e3R1MPbybLcW3A7LXtG1Sk"
      )
      .reply(200, {
        jsonrpc: "2.0",
        result: {
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
        },
        id: "53622823-6bd2-4e0c-aeab-44ca392dcc66",
      });
    const conn = new Connection("http://localhost:8899");
    const network = await Case.retrieve(conn, "hapi.one", new u64(0));
    expect(stringify(network)).toEqual(stringify(CASE_SAMPLE_1));
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
    nock("http://localhost:8899")
      .post(
        "/",
        ({ method, params: [address] }) =>
          method === "getAccountInfo" &&
          address === "6vGsVQ1YMu5zkNUMJ5j5H1TVimfennBcYuYP9hXw1kB2"
      )
      .reply(200, {
        jsonrpc: "2.0",
        result: {
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
        },
        id: "1b259ed3-a26b-4674-a89e-1f842372deb1",
      });

    const conn = new Connection("http://localhost:8899");
    const network = await Case.retrieve(conn, "hapi.one", new u64(1));
    expect(stringify(network)).toEqual(stringify(CASE_SAMPLE_2));
  });
});
