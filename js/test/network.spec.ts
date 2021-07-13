import { Connection } from "@solana/web3.js";

import { Network, HapiAccountType } from "../src/state";
import { u64 } from "../src/utils";

describe("Network", () => {
  const BINARY_SAMPLE = Buffer.from(
    "020500000074657374310200000000000000",
    "hex"
  );

  const NETWORK_SAMPLE = new Network({
    accountType: HapiAccountType.Network,
    name: "test1",
    nextCaseId: new u64(2),
  });

  it("should serialize", () => {
    expect(NETWORK_SAMPLE.serialize()).toEqual(BINARY_SAMPLE);
  });

  it("should deserialize", () => {
    expect(JSON.stringify(Network.deserialize(BINARY_SAMPLE))).toEqual(
      JSON.stringify(NETWORK_SAMPLE)
    );
  });

  xit("shoud retrieve", async () => {
    const conn = new Connection("http://localhost:8899");
    const network = await Network.retrieve(conn, "hapi.one", "test1");
    expect(JSON.stringify(network)).toEqual(JSON.stringify(NETWORK_SAMPLE));
  });
});
