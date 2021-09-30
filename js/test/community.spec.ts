import { Connection, PublicKey } from "@solana/web3.js";

import { Community, HapiAccountType } from "../src/state";

describe("Community", () => {
  const BINARY_SAMPLE = Buffer.from(
    "Ae83pQQEsYipbhD1URInU/iuiQbErgmDyScnrPJbOPlRCAAAAGhhcGkub25lAgAAAAAAAAA=",
    "base64"
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

  xit("should retrieve", async () => {
    const conn = new Connection("http://localhost:8899");
    const community = await Community.retrieve(conn, "hapi.one");
    expect(community).toEqual(COMMUNITY_SAMPLE);
  });
});
