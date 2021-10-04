import { Connection, PublicKey } from "@solana/web3.js";
import stringify from "fast-json-stable-stringify";
import nock from "nock";

import { Community, HapiAccountType } from "../../src/state";
import { u64 } from "../../src/utils";

describe("Community", () => {
  nock.disableNetConnect();

  const BINARY_SAMPLE = Buffer.from(
    "Ae83pQQEsYipbhD1URInU/iuiQbErgmDyScnrPJbOPlRAgAAAAAAAAAIAAAAaGFwaS5vbmUAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
    "base64"
  );

  const COMMUNITY_SAMPLE = new Community({
    accountType: HapiAccountType.Community,
    authority: new PublicKey("H6oepkMQSZxSGdQUGwtmSy6Z6f4ZuhvjJFsdiz7mpoKn"),
    nextCaseId: new u64(2),
    name: "hapi.one",
  });

  it("should serialize", () => {
    expect(COMMUNITY_SAMPLE.serialize()).toEqual(BINARY_SAMPLE);
  });

  it("should deserialize", () => {
    expect(stringify(Community.deserialize(BINARY_SAMPLE))).toEqual(
      stringify(COMMUNITY_SAMPLE)
    );
  });

  it("should retrieve", async () => {
    nock("http://localhost:8899")
      .post(
        "/",
        ({ method, params: [address] }) =>
          method === "getAccountInfo" &&
          address === "DgBtqgnzYRsUZP3PhX5rCLfNycTQQ8cp7eMseosUQ4Ja"
      )
      .reply(200, {
        jsonrpc: "2.0",
        result: {
          context: { slot: 4425 },
          value: {
            data: [
              "Ae83pQQEsYipbhD1URInU/iuiQbErgmDyScnrPJbOPlRAgAAAAAAAAAIAAAAaGFwaS5vbmUAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
              "base64",
            ],
            executable: false,
            lamports: 1398960,
            owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
            rentEpoch: 0,
          },
        },
        id: "9b93664a-92f5-436b-8e4e-05da66450ea6",
      });
    const conn = new Connection("http://localhost:8899");
    const community = await Community.retrieve(conn, "hapi.one");
    expect(stringify(community)).toEqual(stringify(COMMUNITY_SAMPLE));
  });
});
