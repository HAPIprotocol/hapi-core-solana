import { Connection, PublicKey } from "@solana/web3.js";

import { Community, HapiAccountType } from "../src/state";

describe("Community", () => {
  const BINARY_SAMPLE = Buffer.from(
    "01ef37a50404b188a96e10f551122753f8ae8906c4ae0983c92727acf25b38f95108000000686170692e6f6e65",
    "hex"
  );

  const COMMUNITY_SAMPLE = new Community({
    accountType: HapiAccountType.Community,
    authority: new PublicKey("H6oepkMQSZxSGdQUGwtmSy6Z6f4ZuhvjJFsdiz7mpoKn"),
    name: "hapi.one",
  });

  it("should serialize", () => {
    expect(COMMUNITY_SAMPLE.serialize()).toEqual(BINARY_SAMPLE);
  });

  it("should deserialize", () => {
    expect(Community.deserialize(BINARY_SAMPLE)).toEqual(COMMUNITY_SAMPLE);
  });

  xit("shoud retrieve", async () => {
    const conn = new Connection("http://localhost:8899");
    const community = await Community.retrieve(conn, "hapi.one");
    expect(community).toEqual(COMMUNITY_SAMPLE);
  });
});
