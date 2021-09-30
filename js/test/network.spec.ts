import { Connection } from "@solana/web3.js";

import { Network, HapiAccountType } from "../src/state";

describe("Network", () => {
  const BINARY_SAMPLE = Buffer.from("AggAAAB0ZXN0Y29pbg==", "base64");

  const NETWORK_SAMPLE = new Network({
    accountType: HapiAccountType.Network,
    name: "testcoin",
  });

  it("should serialize", () => {
    expect(NETWORK_SAMPLE.serialize()).toEqual(BINARY_SAMPLE);
  });

  it("should deserialize", () => {
    expect(JSON.stringify(Network.deserialize(BINARY_SAMPLE))).toEqual(
      JSON.stringify(NETWORK_SAMPLE)
    );
  });

  xit("should retrieve", async () => {
    const conn = new Connection("http://localhost:8899");
    const network = await Network.retrieve(conn, "hapi.one", "testcoin");
    expect(JSON.stringify(network)).toEqual(JSON.stringify(NETWORK_SAMPLE));
  });
});
