jest.mock("rpc-websockets"); // disable web3's websocket connections

import { Connection, Keypair } from "@solana/web3.js";
import stringify from "fast-json-stable-stringify";
import nock from "nock";

import { mockRpcError, mockRpcOk } from "../test/util/mocks";
import { HapiAccountType } from "./state";
import { AuthorityClient } from ".";

describe("AuthorityClient", () => {
  let client: AuthorityClient;
  let payer: Keypair;

  const endpoint = "http://localhost:8899";

  nock.disableNetConnect();

  let i = 0;
  const seed = Buffer.alloc(32);
  beforeEach(async () => {
    seed.writeUInt32BE(i++);
    client = new AuthorityClient({ endpoint });
    payer = Keypair.fromSeed(seed);
  });

  afterEach(() => {
    nock.cleanAll();
    jest.resetAllMocks();
  });

  it("should initialize", () => {
    expect(client).toBeDefined();
  });

  describe("createCommunity", () => {
    it("should throw - community already exists", async () => {
      jest.spyOn(Date, "now").mockReturnValue(1633624165684);

      mockRpcOk(endpoint, "getRecentBlockhash", [], {
        context: { slot: 159 },
        value: {
          blockhash: "FMjzqMLtuECN4cKNZcu221QCBVExhJZqrKACi7pmw4qL",
          feeCalculator: { lamportsPerSignature: 5000 },
        },
      });

      mockRpcError(endpoint, "sendTransaction", [], {
        code: -32002,
        message:
          "Transaction simulation failed: Error processing Instruction 0: instruction requires an uninitialized account",
        data: {
          accounts: null,
          err: { InstructionError: [0, "AccountAlreadyInitialized"] },
          logs: [
            "Program hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7 invoke [1]",
            'Program log: HAPI-INSTRUCTION: CreateCommunity { name: "hapi.one" }',
            "Program log: Error: AccountAlreadyInitialized",
            "Program hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7 consumed 5872 of 200000 compute units",
            "Program hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7 failed: instruction requires an uninitialized account",
          ],
        },
      });

      jest.spyOn(console, "error").mockImplementationOnce(() => null);
      await expect(() =>
        client.createCommunity(payer, "hapi.one")
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should throw - invalid name", async () => {
      await expect(() =>
        client.createCommunity(payer, "loooooooooooooooooooooooooooooooooong")
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should create a community - success", async () => {
      jest.spyOn(Date, "now").mockReturnValue(1633624165684);
      let t0 = 1633624165684;
      jest.spyOn(Date, "now").mockImplementation(() => (t0 += 1));

      jest
        .spyOn(
          (client as unknown as { connection: Connection }).connection,
          "confirmTransaction"
        )
        .mockResolvedValue({ context: { slot: 1 }, value: { err: null } });

      mockRpcOk(endpoint, "getRecentBlockhash", [], {
        context: { slot: 159 },
        value: {
          blockhash: "Gk8Vxi2AjCDBtAufgVKcnHv327sxEuTcZKUrNYusKhd4",
          feeCalculator: { lamportsPerSignature: 5000 },
        },
      });

      mockRpcOk(
        endpoint,
        "sendTransaction",
        [],
        "64cBhBwynYdXc6Ybr1suHM5Hz4xKtEzB3uyyg3gRtE8hfenzQJzd5whCZdPF5Xf5Quffvtib7U82XqYRQet4roU2"
      );

      mockRpcOk(
        endpoint,
        "getAccountInfo",
        ["Bwv5tFYijy58tNWKDv64Rs2i1Wun5C6LbxQEL2N35J59"],
        {
          context: { slot: 33 },
          value: {
            data: [
              "AatWllUf4XEcPDFmn/IOHgvBLLmZF8OrJBLnwTAT3ufnAAAAAAAAAAAJAAAAaGFwaS50ZXN0AAAAAAAAAAAAAAAAAAAAAAAAAA==",
              "base64",
            ],
            executable: false,
            lamports: 1398960,
            owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
            rentEpoch: 0,
          },
        }
      );

      const { account, data } = await client.createCommunity(
        payer,
        "hapi.test"
      );
      expect(account.toString()).toEqual(
        "Bwv5tFYijy58tNWKDv64Rs2i1Wun5C6LbxQEL2N35J59"
      );
      expect(stringify(data)).toEqual(
        stringify({
          accountType: HapiAccountType.Community,
          authority: payer.publicKey,
          nextCaseId: "00",
          name: "hapi.test",
        })
      );
    });
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
