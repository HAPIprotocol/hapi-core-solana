import { Connection, PublicKey } from "@solana/web3.js";
import stringify from "fast-json-stable-stringify";
import nock from "nock";

import { Address, Category, HapiAccountType } from "../../src/state";
import { u64 } from "../../src/utils";
import { assertBuffersEqual } from "../util/comparison";

describe("Address", () => {
  // nock.disableNetConnect();

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

  it("should retrieve", async () => {
    nock("http://localhost:8899")
      .post(
        "/",
        ({ method, params: [address] }) =>
          method === "getAccountInfo" &&
          address === "EGP3s7nD3dFaT9jGtwT7UoZndi58W3VexaJ41N1y5yMm"
      )
      .reply(200, {
        jsonrpc: "2.0",
        result: {
          context: { slot: 2223 },
          value: {
            data: ["BQUBAAAAAAAAAA8=", "base64"],
            executable: false,
            lamports: 967440,
            owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
            rentEpoch: 0,
          },
        },
        id: "1f792dd8-0368-4e2c-8056-974e3d78d604",
      });

    const conn = new Connection("http://localhost:8899");
    const network = await Address.retrieve(
      conn,
      "hapi.one",
      "testcoin",
      new PublicKey("2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew")
    );
    expect(stringify(network.data)).toEqual(stringify(ADDRESS_SAMPLE));
  });
});
