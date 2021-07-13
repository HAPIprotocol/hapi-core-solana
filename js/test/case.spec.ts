import { Connection, PublicKey } from "@solana/web3.js";

import { Case, Category, HapiAccountType } from "../src/state";
import { u64 } from "../src/utils";

describe("Case", () => {
  const BINARY_SAMPLE_1 = Buffer.from(
    "04050000006361736530c0fdcf81e4689a79e0cb64d88098f5342910652a340ddc0703dbdb10386dc6781300000000000100020003000400050006000700080009000a000b000c000d000e000f00100011001200",
    "hex"
  );

  const BINARY_SAMPLE_2 = Buffer.from(
    "04050000006361736531fdd613ed45900852e3384f25ca1d350e1141624b88bf4fc170822d4767a52dea1300000000000100020003000400050006000700080009000a000b000c000d010e000f01100011001200",
    "hex"
  );

  const CASE_SAMPLE_1 = new Case({
    accountType: HapiAccountType.Case,
    name: "case0",
    reporterKey: new PublicKey("DzMkTkH6ms7hEzyHisFnLLc2WDJfBb9TNNaPDQ7ADHhy"),
    categories: new Map<Category, boolean>(),
  });

  const CASE_SAMPLE_2 = new Case({
    accountType: HapiAccountType.Case,
    name: "case1",
    reporterKey: new PublicKey("J5sUnZKuB1a9izNWDb4JEQzdB3J6mhe3sP6Ai6YCiKAZ"),
    categories: new Map<Category, boolean>([
      [Category.Theft, true],
      [Category.Scam, true],
    ]),
  });

  it("should serialize - case0", () => {
    expect(CASE_SAMPLE_1.serialize()).toEqual(BINARY_SAMPLE_1);
  });

  it("should deserialize - case0", () => {
    expect(JSON.stringify(Case.deserialize(BINARY_SAMPLE_1))).toEqual(
      JSON.stringify(CASE_SAMPLE_1)
    );
  });

  xit("shoud retrieve - case0", async () => {
    const conn = new Connection("http://localhost:8899");
    const network = await Case.retrieve(conn, "hapi.one", "test1", new u64(0));
    expect(JSON.stringify(network)).toEqual(JSON.stringify(CASE_SAMPLE_1));
  });

  it("should serialize - case1", () => {
    expect(CASE_SAMPLE_2.serialize()).toEqual(BINARY_SAMPLE_2);
  });

  it("should deserialize - case1", () => {
    expect(JSON.stringify(Case.deserialize(BINARY_SAMPLE_2))).toEqual(
      JSON.stringify(CASE_SAMPLE_2)
    );
  });

  xit("shoud retrieve - case1", async () => {
    const conn = new Connection("http://localhost:8899");
    const network = await Case.retrieve(conn, "hapi.one", "test1", new u64(1));
    expect(JSON.stringify(network)).toEqual(JSON.stringify(CASE_SAMPLE_2));
  });
});
