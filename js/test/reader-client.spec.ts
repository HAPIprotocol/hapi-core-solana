import b58 from "b58";

import { ReaderClient } from "../src";
import { u64 } from "../src/utils";

describe("ReaderClient", () => {
  let client: ReaderClient;

  beforeEach(() => {
    client = new ReaderClient({
      endpoint: "http://localhost:8899",
    });
  });

  it("should initialize", () => {
    expect(client).toBeDefined();
  });

  describe("viewCommunity", () => {
    it("should throw - not found", async () => {
      await expect(() =>
        client.viewCommunity("community404")
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should respond - success", async () => {
      const response = await client.viewCommunity("hapi.one");
      expect(response).toMatchSnapshot();
    });
  });

  describe("viewNetwork", () => {
    it("should throw - not found", async () => {
      await expect(() =>
        client.viewNetwork("unnetwork", "hapi.one")
      ).rejects.toThrowErrorMatchingSnapshot();

      await expect(() =>
        client.viewNetwork("testcoin", "community404")
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should respond - success", async () => {
      const response = await client.viewNetwork("testcoin", "hapi.one");
      expect(response).toMatchSnapshot();
    });
  });

  describe("viewReporter", () => {
    it("should throw - not found", async () => {
      await expect(() =>
        client.viewReporter(
          "49B9UtxhbVBKaToxThwQqshbmf2ZfnuJZX3XGjTsNLvb",
          "hapi.one"
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should respond - success", async () => {
      // Alice
      {
        const response = await client.viewReporter(
          "DzMkTkH6ms7hEzyHisFnLLc2WDJfBb9TNNaPDQ7ADHhy",
          "hapi.one"
        );
        expect(response).toMatchSnapshot();
      }

      // Bob
      {
        const response = await client.viewReporter(
          "J5sUnZKuB1a9izNWDb4JEQzdB3J6mhe3sP6Ai6YCiKAZ",
          "hapi.one"
        );
        expect(response).toMatchSnapshot();
      }

      // Carol
      {
        const response = await client.viewReporter(
          "E8E298Dfe79V97ngYkcxXo1BftwduxjkGUWWRePM1Ac2",
          "hapi.one"
        );
        expect(response).toMatchSnapshot();
      }
    });
  });

  describe("viewCase", () => {
    it("should throw - not found", async () => {
      await expect(() =>
        client.viewCase(new u64(404), "hapi.one")
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should respond - success", async () => {
      const response = await client.viewCase(new u64(0), "hapi.one");
      expect(response).toMatchSnapshot();
    });
  });

  describe("viewAddress", () => {
    it("should throw - not found (string)", async () => {
      await expect(() =>
        client.viewAddress("4o4", "testcoin", "hapi.one")
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should throw - not found (buffer)", async () => {
      await expect(() =>
        client.viewAddress(
          Buffer.from("deadcode", "hex"),
          "testcoin",
          "hapi.one"
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should throw - malformed", async () => {
      await expect(() =>
        client.viewAddress("BAD BASE58", "testcoin", "hapi.one")
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should throw - invalid community name", async () => {
      await expect(() =>
        client.viewAddress(
          "2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew",
          "testcoin",
          "community404"
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should respond - success (string)", async () => {
      const response = await client.viewAddress(
        "2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew",
        "testcoin",
        "hapi.one"
      );
      expect(response).toMatchSnapshot();
    });

    it("should respond - success (buffer)", async () => {
      const buffer = b58.decode("2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew");
      const response = await client.viewAddress(buffer, "testcoin", "hapi.one");
      expect(response).toMatchSnapshot();
    });
  });
});
