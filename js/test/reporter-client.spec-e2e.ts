import { Keypair } from "@solana/web3.js";
import { ReporterClient } from "../src";

describe("ReporterClient", () => {
  it("should initialize", () => {
    const payer = new Keypair();

    const client = new ReporterClient({
      endpoint: "http://localhost:8899",
      payer,
    });

    expect(client).toBeDefined();
  });

  describe("createCase", () => {
    it.todo("should throw - community not found");
    it.todo("should throw - invalid id");
    it.todo("should throw - invalid name");
    it.todo("should throw - invalid categories");
    it.todo("should create a case - success");
  });

  describe("updateCase", () => {
    it.todo("should throw - community not found");
    it.todo("should throw - case not found");
    it.todo("should throw - invalid name");
    it.todo("should throw - invalid categories");
    it.todo("should update a case - success");
  });

  describe("createAddress", () => {
    it.todo("should throw - community not found");
    it.todo("should throw - network not found");
    it.todo("should throw - invalid address");
    it.todo("should throw - invalid category");
    it.todo("should throw - invalid risk score");
    it.todo("should create an address - success");
  });

  describe("updateAddress", () => {
    it.todo("should throw - community not found");
    it.todo("should throw - network not found");
    it.todo("should throw - address not found");
    it.todo("should throw - invalid category");
    it.todo("should throw - invalid risk score");
    it.todo("should update an address - success");
  });
});
