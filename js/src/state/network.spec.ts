import { Connection } from "@solana/web3.js";
import stringify from "fast-json-stable-stringify";
import nock from "nock";

import { Network, HapiAccountType } from ".";

describe("Network", () => {
  nock.disableNetConnect();

  const BINARY_SAMPLE = Buffer.from(
    "AggAAAB0ZXN0Y29pbgAAAAAAAAAAAAAAAAAAAAAAAAAA",
    "base64"
  );

  const NETWORK_SAMPLE = new Network({
    accountType: HapiAccountType.Network,
    name: "testcoin",
  });

  it("should serialize", () => {
    expect(NETWORK_SAMPLE.serialize()).toEqual(BINARY_SAMPLE);
  });

  it("should deserialize", () => {
    expect(stringify(Network.deserialize(BINARY_SAMPLE))).toEqual(
      stringify(NETWORK_SAMPLE)
    );
  });

  it("should retrieve", async () => {
    nock("http://localhost:8899")
      .post(
        "/",
        ({ method, params: [address] }) =>
          method === "getAccountInfo" &&
          address === "2viJmmn2pEfd6cogyqdDGWS9YkrVdnx87L994Qo3GwLx"
      )
      .reply(200, {
        jsonrpc: "2.0",
        result: {
          context: { slot: 4628 },
          value: {
            data: ["AggAAAB0ZXN0Y29pbgAAAAAAAAAAAAAAAAAAAAAAAAAA", "base64"],
            executable: false,
            lamports: 1120560,
            owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
            rentEpoch: 0,
          },
        },
        id: "330bad4f-c2bb-4ab3-a0a5-9c8b87a84382",
      });
    const conn = new Connection("http://localhost:8899");
    const network = await Network.retrieve(conn, "hapi.one", "testcoin");
    expect(stringify(network.data)).toEqual(stringify(NETWORK_SAMPLE));
  });
});
