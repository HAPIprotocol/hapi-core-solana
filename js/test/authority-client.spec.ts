import { Connection, Keypair } from "@solana/web3.js";

import { AuthorityClient } from "../src";

describe("AuthorityClient", () => {
  let client: AuthorityClient;
  let payer: Keypair;

  beforeEach(async () => {
    client = new AuthorityClient({
      endpoint: "http://localhost:8899",
    });
    payer = new Keypair();
    await (
      client as unknown as { connection: Connection }
    ).connection.requestAirdrop(payer.publicKey, 100e9);
  });

  it("should initialize", () => {
    expect(client).toBeDefined();
  });

  describe("createCommunity", () => {
    it("should throw - community already exists", async () => {
      await expect(() =>
        client.createCommunity(payer, "hapi.one")
      ).rejects.toThrowErrorMatchingSnapshot();
    });
    it("should throw - invalid name", async () => {
      await expect(() =>
        client.createCommunity(payer, "loooooooooooooooooooooooooooooooooong")
      ).rejects.toThrowErrorMatchingSnapshot();
    });
    it.todo("should create a community - success");
  });

  describe("createNetwork", () => {
    it.todo("should throw - community not found");
    it.todo("should throw - network already exists");
    it.todo("should throw - invalid name");
    it.todo("should create a network - success");
  });

  describe("createReporter", () => {
    it.todo("should throw - community not found");
    it.todo("should throw - reporter already exists");
    it.todo("should throw - invalid type");
    it.todo("should throw - invalid name");
    it.todo("should throw - invalid public key");
    it.todo("should create a reporter - success");
  });

  describe("updateReporter", () => {
    it.todo("should throw - community not found");
    it.todo("should throw - reporter not found");
    it.todo("should throw - invalid type");
    it.todo("should throw - invalid name");
    it.todo("should update a reporter - success");
  });
});
