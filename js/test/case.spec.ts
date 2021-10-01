import { Connection, PublicKey } from "@solana/web3.js";

import { Case, Category, HapiAccountType } from "../src/state";
import { u64 } from "../src/utils";
import { assertBuffersEqual } from "./util/comparison";

describe("Case", () => {
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

  xit("should retrieve - case0", async () => {
    const conn = new Connection("http://localhost:8899");
    const network = await Case.retrieve(conn, "hapi.one", new u64(0));
    expect(JSON.stringify(network)).toEqual(JSON.stringify(CASE_SAMPLE_1));
  });

  it("should serialize - case1", () => {
    assertBuffersEqual(CASE_SAMPLE_2.serialize(), BINARY_SAMPLE_2);
  });

  it("should deserialize - case1", () => {
    expect(JSON.stringify(Case.deserialize(BINARY_SAMPLE_2))).toEqual(
      JSON.stringify(CASE_SAMPLE_2)
    );
  });

  xit("should retrieve - case1", async () => {
    const conn = new Connection("http://localhost:8899");
    const network = await Case.retrieve(conn, "hapi.one", new u64(1));
    expect(JSON.stringify(network)).toEqual(JSON.stringify(CASE_SAMPLE_2));
  });
});
