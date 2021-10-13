import bs58 from "bs58";
import nock from "nock";

import { ReaderClient } from "./reader-client";
import { u64 } from "./utils";
import { mockRpcOk } from "../test/util/mocks";

describe("ReaderClient", () => {
  let client: ReaderClient;

  const endpoint = "http://localhost:8899";

  beforeAll(() => {
    nock.disableNetConnect();
  });

  beforeEach(() => {
    nock.cleanAll();
    client = new ReaderClient({ endpoint });
  });

  it("should initialize", () => {
    expect(client).toBeDefined();
  });

  describe("getCommunity", () => {
    it("should throw - not found", async () => {
      mockRpcOk(
        endpoint,
        "getAccountInfo",
        ["mJLCqGmUWWDzYcDVHRAjaDJocoPDLzeimfD7KzwnxFh"],
        { context: { slot: 173 }, value: null }
      );

      await expect(() =>
        client.getCommunity("community404")
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should respond - success", async () => {
      mockRpcOk(
        endpoint,
        "getAccountInfo",
        ["DgBtqgnzYRsUZP3PhX5rCLfNycTQQ8cp7eMseosUQ4Ja"],
        {
          context: { slot: 280 },
          value: {
            data: [
              "Ae83pQQEsYipbhD1URInU/iuiQbErgmDyScnrPJbOPlRAgAAAAAAAAAIAAAAaGFwaS5vbmUAAAAAAAAAAAAAAAAAAAAAAAAAAA===",
              "base64",
            ],
            executable: false,
            lamports: 1398960,
            owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
            rentEpoch: 0,
          },
        }
      );

      const response = await client.getCommunity("hapi.one");
      expect(response).toMatchSnapshot();
    });
  });

  describe("getNetwork", () => {
    it("should throw - not found", async () => {
      mockRpcOk(
        endpoint,
        "getAccountInfo",
        ["3TGzDJHkCHX5R62wtVh1Jr5TNe775jvSCt8tThbizBKQ"],
        { context: { slot: 4682 }, value: null }
      );

      mockRpcOk(
        endpoint,
        "getAccountInfo",
        ["DgBtqgnzYRsUZP3PhX5rCLfNycTQQ8cp7eMseosUQ4Ja"],
        {
          context: { slot: 280 },
          value: {
            data: [
              "Ae83pQQEsYipbhD1URInU/iuiQbErgmDyScnrPJbOPlRAgAAAAAAAAAIAAAAaGFwaS5vbmUAAAAAAAAAAAAAAAAAAAAAAAAAAA===",
              "base64",
            ],
            executable: false,
            lamports: 1398960,
            owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
            rentEpoch: 0,
          },
        }
      );

      mockRpcOk(
        endpoint,
        "getAccountInfo",
        ["7GiNHuwBKg6URcBJXXXRPRtBVgn5q42AiowBEc8uzqBH"],
        { context: { slot: 4682 }, value: null }
      );

      await expect(() =>
        client.getNetwork("unnetwork", "hapi.one")
      ).rejects.toThrowErrorMatchingSnapshot();

      await expect(() =>
        client.getNetwork("testcoin", "community404")
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should respond - success", async () => {
      mockRpcOk(
        endpoint,
        "getAccountInfo",
        ["2viJmmn2pEfd6cogyqdDGWS9YkrVdnx87L994Qo3GwLx"],
        {
          context: { slot: 4682 },
          value: {
            data: ["AggAAAB0ZXN0Y29pbgAAAAAAAAAAAAAAAAAAAAAAAAAA", "base64"],
            executable: false,
            lamports: 1120560,
            owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
            rentEpoch: 0,
          },
        }
      );

      const response = await client.getNetwork("testcoin", "hapi.one");
      expect(response).toMatchSnapshot();
    });
  });

  describe("getReporter", () => {
    it("should throw - not found", async () => {
      mockRpcOk(
        endpoint,
        "getAccountInfo",
        ["DUALaTZpDYtct73t8D9AirPYnPc4TzSCmqwcNjxmSf9j"],
        { context: { slot: 5254 }, value: null }
      );

      await expect(() =>
        client.getReporter(
          "49B9UtxhbVBKaToxThwQqshbmf2ZfnuJZX3XGjTsNLvb",
          "hapi.one"
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should respond - success", async () => {
      // Alice
      {
        mockRpcOk(
          endpoint,
          "getAccountInfo",
          ["GfwYi1NaoMFJUHzEXtTkXAQewxxqs7PbseAYnsfiNnS7"],
          {
            context: { slot: 5254 },
            value: {
              data: [
                "AwMFAAAAQWxpY2UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
                "base64",
              ],
              executable: false,
              lamports: 1127520,
              owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
              rentEpoch: 0,
            },
          }
        );

        const response = await client.getReporter(
          "DzMkTkH6ms7hEzyHisFnLLc2WDJfBb9TNNaPDQ7ADHhy",
          "hapi.one"
        );
        expect(response).toMatchSnapshot();
      }

      // Bob
      {
        mockRpcOk(
          endpoint,
          "getAccountInfo",
          ["7GFtavi6PpFjqmvhKMtW8D6W4JgFv69VhUurrnBQRbUL"],
          {
            context: { slot: 5254 },
            value: {
              data: [
                "AwIDAAAAQm9iAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
                "base64",
              ],
              executable: false,
              lamports: 1127520,
              owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
              rentEpoch: 0,
            },
          }
        );

        const response = await client.getReporter(
          "J5sUnZKuB1a9izNWDb4JEQzdB3J6mhe3sP6Ai6YCiKAZ",
          "hapi.one"
        );
        expect(response).toMatchSnapshot();
      }

      // Carol
      {
        mockRpcOk(
          endpoint,
          "getAccountInfo",
          ["DSa28TFYUaomAUNTnRRcsxxmZmvrf1Pfim7obB21m5Jx"],
          {
            context: { slot: 5254 },
            value: {
              data: [
                "AwEFAAAAQ2Fyb2wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==",
                "base64",
              ],
              executable: false,
              lamports: 1127520,
              owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
              rentEpoch: 0,
            },
          }
        );

        const response = await client.getReporter(
          "E8E298Dfe79V97ngYkcxXo1BftwduxjkGUWWRePM1Ac2",
          "hapi.one"
        );
        expect(response).toMatchSnapshot();
      }
    });
  });

  describe("getCase", () => {
    it("should throw - not found", async () => {
      mockRpcOk(
        endpoint,
        "getAccountInfo",
        ["EGP3s7nD3dFaT9jGtwT7UoZndi58W3VexaJ41N1y5yMm"],
        {
          context: { slot: 8869 },
          value: {
            data: ["BQUBAAAAAAAAAA8=", "base64"],
            executable: false,
            lamports: 967440,
            owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
            rentEpoch: 0,
          },
        }
      );

      mockRpcOk(
        endpoint,
        "getAccountInfo",
        ["EGP3s7nD3dFaT9jGtwT7UoZndi58W3VexaJ41N1y5yMm"],
        {
          context: { slot: 8869 },
          value: {
            data: ["BQUBAAAAAAAAAA8=", "base64"],
            executable: false,
            lamports: 967440,
            owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
            rentEpoch: 0,
          },
        }
      );

      mockRpcOk(
        endpoint,
        "getAccountInfo",
        ["5yGEyZT2WwuLD6BJuvP7TXRcR2ojZTpFVv2TkQm6eX2P"],
        { context: { slot: 5254 }, value: null }
      );
      await expect(() =>
        client.getCase(new u64(404), "hapi.one")
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should respond - success", async () => {
      mockRpcOk(
        endpoint,
        "getAccountInfo",
        ["63G8TLWGQpd26UZj7L9Qr9e3R1MPbybLcW3A7LXtG1Sk"],
        {
          context: { slot: 10001 },
          value: {
            data: [
              "BMD9z4HkaJp54Mtk2ICY9TQpEGUqNA3cBwPb2xA4bcZ4AAAAAAAFAAAAY2FzZTAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=",
              "base64",
            ],
            executable: false,
            lamports: 1385040,
            owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
            rentEpoch: 0,
          },
        }
      );

      const response = await client.getCase(new u64(0), "hapi.one");
      expect(response).toMatchSnapshot();
    });
  });

  describe("getAddress", () => {
    it("should throw - not found (string)", async () => {
      mockRpcOk(
        endpoint,
        "getAccountInfo",
        ["8HpP3NYL4x8qifD3g2e1z7M1m4wPNeXtMoT8Z7yt1Yzs"],
        { context: { slot: 6486 }, value: null }
      );

      await expect(() =>
        client.getAddress("4o4", "testcoin", "hapi.one")
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should throw - not found (buffer)", async () => {
      mockRpcOk(
        endpoint,
        "getAccountInfo",
        ["7viPn64FE3Uz9bFqKYDnBsL4ndwb8rXhFPjZ9NvgCVSx"],
        { context: { slot: 6911 }, value: null }
      );

      await expect(() =>
        client.getAddress(
          Buffer.from("deadcode", "hex"),
          "testcoin",
          "hapi.one"
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should throw - malformed", async () => {
      await expect(() =>
        client.getAddress("BAD BASE58", "testcoin", "hapi.one")
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should throw - invalid community name", async () => {
      mockRpcOk(
        endpoint,
        "getAccountInfo",
        ["BMCaLwP7mmErK69cay99uSnyV1YRtFGGTRU8Vj4F7KNd"],
        { context: { slot: 6984 }, value: null }
      );

      await expect(() =>
        client.getAddress(
          "2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew",
          "testcoin",
          "community404"
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should respond - success (string)", async () => {
      mockRpcOk(
        endpoint,
        "getAccountInfo",
        ["C5Srms9M3eHy5XbzEgRgEEHFZ3rKxdAEaH2DZSSXLGDD"],
        {
          context: { slot: 7526 },
          value: {
            data: ["BQUBAAAAAAAAAA8=", "base64"],
            executable: false,
            lamports: 967440,
            owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
            rentEpoch: 0,
          },
        }
      );

      const response = await client.getAddress(
        "2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew",
        "testcoin",
        "hapi.one"
      );
      expect(response).toMatchSnapshot();
    });

    it("should respond - success (buffer)", async () => {
      mockRpcOk(
        endpoint,
        "getAccountInfo",
        ["C5Srms9M3eHy5XbzEgRgEEHFZ3rKxdAEaH2DZSSXLGDD"],
        {
          context: { slot: 7526 },
          value: {
            data: ["BQUBAAAAAAAAAA8=", "base64"],
            executable: false,
            lamports: 967440,
            owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
            rentEpoch: 0,
          },
        }
      );

      const buffer = bs58.decode(
        "2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew"
      );
      const response = await client.getAddress(buffer, "testcoin", "hapi.one");
      expect(response).toMatchSnapshot();
    });
  });
});
