import { Connection } from "@solana/web3.js";
import stringify from "fast-json-stable-stringify";

import { Network, HapiAccountType } from "../src/state";

describe("Network", () => {
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
    const conn = new Connection("http://localhost:8899");
    const network = await Network.retrieve(conn, "hapi.one", "testcoin");
    expect(stringify(network)).toEqual(stringify(NETWORK_SAMPLE));
  });
});
