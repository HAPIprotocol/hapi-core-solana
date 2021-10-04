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

  describe("getCommunity", () => {
    it("should throw - not found", async () => {
      await expect(() =>
        client.getCommunity("community404")
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should respond - success", async () => {
      const response = await client.getCommunity("hapi.one");
      expect(response).toMatchSnapshot();
    });
  });

  describe("getNetwork", () => {
    it("should throw - not found", async () => {
      await expect(() =>
        client.getNetwork("unnetwork", "hapi.one")
      ).rejects.toThrowErrorMatchingSnapshot();

      await expect(() =>
        client.getNetwork("testcoin", "community404")
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should respond - success", async () => {
      const response = await client.getNetwork("testcoin", "hapi.one");
      expect(response).toMatchSnapshot();
    });
  });

  describe("getReporter", () => {
    it("should throw - not found", async () => {
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
        const response = await client.getReporter(
          "DzMkTkH6ms7hEzyHisFnLLc2WDJfBb9TNNaPDQ7ADHhy",
          "hapi.one"
        );
        expect(response).toMatchSnapshot();
      }

      // Bob
      {
        const response = await client.getReporter(
          "J5sUnZKuB1a9izNWDb4JEQzdB3J6mhe3sP6Ai6YCiKAZ",
          "hapi.one"
        );
        expect(response).toMatchSnapshot();
      }

      // Carol
      {
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
      await expect(() =>
        client.getCase(new u64(404), "hapi.one")
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should respond - success", async () => {
      const response = await client.getCase(new u64(0), "hapi.one");
      expect(response).toMatchSnapshot();
    });
  });

  describe("getAddress", () => {
    it("should throw - not found (string)", async () => {
      await expect(() =>
        client.getAddress("4o4", "testcoin", "hapi.one")
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should throw - not found (buffer)", async () => {
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
      await expect(() =>
        client.getAddress(
          "2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew",
          "testcoin",
          "community404"
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should respond - success (string)", async () => {
      const response = await client.getAddress(
        "2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew",
        "testcoin",
        "hapi.one"
      );
      expect(response).toMatchSnapshot();
    });

    it("should respond - success (buffer)", async () => {
      const buffer = b58.decode("2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew");
      const response = await client.getAddress(buffer, "testcoin", "hapi.one");
      expect(response).toMatchSnapshot();
    });
  });
});
