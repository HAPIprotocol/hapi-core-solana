import { Connection } from "@solana/web3.js";
import stringify from "fast-json-stable-stringify";
import nock from "nock";

import { Network, HapiAccountType } from ".";
import { mockRpcOk } from "../../test/util/mocks";

describe("Network", () => {
  nock.disableNetConnect();

  const endpoint = "http://localhost:8899";

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
    mockRpcOk(
      endpoint,
      "getAccountInfo",
      ["2viJmmn2pEfd6cogyqdDGWS9YkrVdnx87L994Qo3GwLx"],
      {
        context: { slot: 4628 },
        value: {
          data: ["AggAAAB0ZXN0Y29pbgAAAAAAAAAAAAAAAAAAAAAAAAAA", "base64"],
          executable: false,
          lamports: 1120560,
          owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
          rentEpoch: 0,
        },
      }
    );
    const conn = new Connection(endpoint);
    const network = await Network.retrieve(conn, "hapi.one", "testcoin");
    expect(stringify(network.data)).toEqual(stringify(NETWORK_SAMPLE));
  });
});
