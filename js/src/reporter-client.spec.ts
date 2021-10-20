import { PublicKey } from "@solana/web3.js";
import stringify from "fast-json-stable-stringify";
import nock from "nock";

import {
  captureConsoleError,
  getIxFromRawTx,
  mockConfirmTransaction,
  mockRpcAccount,
  mockRpcError,
  mockRpcOk,
} from "../test/util/mocks";
import {
  Address,
  Case,
  CaseStatus,
  Category,
  Community,
  Network,
} from "./state";
import { ReporterClient } from "./reporter-client";
import {
  AUTHORITY,
  REPORTER_ALICE,
  REPORTER_CAROL,
  UNINITIALIZED,
} from "../test/keypairs";
import { u64 } from "./utils";
import {
  CreateAddressIx,
  CreateCaseIx,
  UpdateCaseIx,
} from "./instructions/instructions";

describe("ReporterClient", () => {
  let client: ReporterClient;

  const endpoint = "http://localhost:8899";

  beforeEach(async () => {
    nock.disableNetConnect();
    client = new ReporterClient({
      endpoint,
      payer: UNINITIALIZED,
      communityName: "hapi.one",
      commitment: "processed",
    });
  });

  afterEach(() => {
    nock.cleanAll();
    jest.clearAllMocks();
  });

  it("should initialize", () => {
    expect(client).toBeDefined();
  });

  describe("createCase", () => {
    it("should throw - community not found", async () => {
      client.switchCommunity("community404");

      mockRpcAccount(
        endpoint,
        "mJLCqGmUWWDzYcDVHRAjaDJocoPDLzeimfD7KzwnxFh",
        null
      );

      await expect(() =>
        client.createCase("erroneous case", CaseStatus.Open, [])
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should throw - invalid name", async () => {
      client.payer = REPORTER_ALICE;

      mockRpcAccount(
        endpoint,
        "DgBtqgnzYRsUZP3PhX5rCLfNycTQQ8cp7eMseosUQ4Ja",
        new Community({
          authority: AUTHORITY.publicKey,
          name: "hapi.one",
          nextCaseId: new u64(10),
        })
      );

      await expect(() =>
        client.createCase("loooooong looooooong maaaaaaan", CaseStatus.Open, [])
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should throw - invalid categories", async () => {
      client.payer = REPORTER_ALICE;

      mockRpcAccount(
        endpoint,
        "DgBtqgnzYRsUZP3PhX5rCLfNycTQQ8cp7eMseosUQ4Ja",
        new Community({
          authority: AUTHORITY.publicKey,
          name: "hapi.one",
          nextCaseId: new u64(10),
        })
      );

      await expect(() =>
        client.createCase("invalid categories", CaseStatus.Open, [4294967295])
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should throw - reporter doesn't have rights", async () => {
      client.payer = REPORTER_CAROL;

      const consoleSpy = captureConsoleError();

      mockRpcAccount(
        endpoint,
        "DgBtqgnzYRsUZP3PhX5rCLfNycTQQ8cp7eMseosUQ4Ja",
        new Community({
          authority: AUTHORITY.publicKey,
          name: "hapi.one",
          nextCaseId: new u64(10),
        })
      );

      mockRpcOk(endpoint, "getRecentBlockhash", [], {
        context: { slot: 159 },
        value: {
          blockhash: "FMjzqMLtuECN4cKNZcu221QCBVExhJZqrKACi7pmw4qL",
          feeCalculator: { lamportsPerSignature: 5000 },
        },
      });

      const txInput = mockRpcError(endpoint, "sendTransaction", [], {
        code: -32002,
        message:
          "Transaction simulation failed: Error processing Instruction 0: custom program error: 0x9",
        data: {
          accounts: null,
          err: { InstructionError: [0, { Custom: 9 }] },
          logs: [
            "Program hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7 invoke [1]",
            'Program log: HAPI-INSTRUCTION: CreateCase { case_id: 47, categories: 32, status: Open, name: "invalid reporter" }',
            "Program log: Reporter doesn't have a permission to report a case",
            "Program log: HAPI-ERROR: InvalidReporterPermissions",
            "Program hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7 consumed 13764 of 200000 compute units",
            "Program hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7 failed: custom program error: 0x9",
          ],
        },
      });

      await expect(() =>
        client.createCase("invalid reporter", CaseStatus.Open, [Category.DeFi])
      ).rejects.toThrowErrorMatchingSnapshot();

      expect(consoleSpy.finish()).toContain(
        "Reporter doesn't have a permission to report a case"
      );

      expect(
        CreateCaseIx.decode(getIxFromRawTx(txInput.input().params[0] as string))
      ).toMatchInlineSnapshot(`
        CreateCaseIx {
          "caseId": "0a",
          "categories": 32,
          "name": "invalid reporter",
          "status": 0,
          "tag": 6,
        }
      `);
    });

    it("should create a case - success", async () => {
      client.payer = REPORTER_ALICE;

      mockRpcAccount(
        endpoint,
        "DgBtqgnzYRsUZP3PhX5rCLfNycTQQ8cp7eMseosUQ4Ja",
        new Community({
          authority: AUTHORITY.publicKey,
          name: "hapi.one",
          nextCaseId: new u64(48),
        })
      );

      mockRpcOk(endpoint, "getRecentBlockhash", [], {
        context: { slot: 159 },
        value: {
          blockhash: "FMjzqMLtuECN4cKNZcu221QCBVExhJZqrKACi7pmw4qL",
          feeCalculator: { lamportsPerSignature: 5000 },
        },
      });

      const txInput = mockRpcOk(
        endpoint,
        "sendTransaction",
        [],
        "43peZU1kygGZ5WZA4spohczd4iKHG3RuoX1XbNGcuMsghnsRKbE2PD9jfTDDUTXLaucDX7WY4a3ENtkDG7wPDKGU"
      );

      mockRpcAccount(
        endpoint,
        "E3NTxagJJwyQrwFC4e2ndpYR3hWoJC59DrQ3aCabjPxo",
        new Case({
          name: "Slice the dice",
          reporterKey: client.payerPublicKey,
          status: CaseStatus.Open,
          categories: [Category.Gambling],
        })
      );

      mockConfirmTransaction(client);

      mockRpcAccount(
        endpoint,
        "DMYBunz3NcxbuR9yFt8AUCfszJV8VFzm47WWHmisMnhv",
        new Case({
          name: "Slice the dice",
          reporterKey: client.payerPublicKey,
          status: CaseStatus.Open,
          categories: [Category.Gambling],
        })
      );

      const {
        data,
        meta: { caseId },
      } = await client.createCase("Slice the dice", CaseStatus.Open, [
        Category.Gambling,
      ]);

      expect(stringify(data)).toMatchSnapshot();
      expect(caseId.toString()).toEqual("48");

      expect(
        CreateCaseIx.decode(getIxFromRawTx(txInput.input().params[0] as string))
      ).toMatchInlineSnapshot(`
        CreateCaseIx {
          "caseId": "30",
          "categories": 256,
          "name": "Slice the dice",
          "status": 0,
          "tag": 6,
        }
      `);
    });
  });

  describe("updateCase", () => {
    it("should throw - community not found", async () => {
      client.switchCommunity("community404");

      mockRpcAccount(
        endpoint,
        "mJLCqGmUWWDzYcDVHRAjaDJocoPDLzeimfD7KzwnxFh",
        null
      );

      await expect(() =>
        client.updateCase(new u64(1), CaseStatus.Closed, [
          Category.MediumRiskExchange,
        ])
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should throw - case not found", async () => {
      client.payer = REPORTER_ALICE;

      mockRpcAccount(
        endpoint,
        "DgBtqgnzYRsUZP3PhX5rCLfNycTQQ8cp7eMseosUQ4Ja",
        new Community({
          authority: AUTHORITY.publicKey,
          name: "hapi.one",
          nextCaseId: new u64(48),
        })
      );

      mockRpcAccount(
        endpoint,
        "5yGEyZT2WwuLD6BJuvP7TXRcR2ojZTpFVv2TkQm6eX2P",
        null
      );

      await expect(() =>
        client.updateCase(new u64(404), CaseStatus.Closed, [
          Category.MediumRiskExchange,
        ])
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should throw - invalid categories", async () => {
      client.payer = REPORTER_ALICE;

      mockRpcAccount(
        endpoint,
        "DgBtqgnzYRsUZP3PhX5rCLfNycTQQ8cp7eMseosUQ4Ja",
        new Community({
          authority: AUTHORITY.publicKey,
          name: "hapi.one",
          nextCaseId: new u64(10),
        })
      );

      mockRpcAccount(
        endpoint,
        "6vGsVQ1YMu5zkNUMJ5j5H1TVimfennBcYuYP9hXw1kB2",
        new Case({
          name: "super case",
          reporterKey: client.payerPublicKey,
          status: CaseStatus.Open,
          categories: [],
        })
      );

      await expect(() =>
        client.updateCase(new u64(1), CaseStatus.Closed, [4294967295])
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should throw - invalid status", async () => {
      client.payer = REPORTER_ALICE;

      mockRpcAccount(
        endpoint,
        "DgBtqgnzYRsUZP3PhX5rCLfNycTQQ8cp7eMseosUQ4Ja",
        new Community({
          authority: AUTHORITY.publicKey,
          name: "hapi.one",
          nextCaseId: new u64(11),
        })
      );

      mockRpcAccount(
        endpoint,
        "DAgLvQ9zU2K5mseeBjCXubv8bCx41F6zwWbkE2ZeuKY2",
        new Case({
          name: "super case",
          reporterKey: client.payerPublicKey,
          status: CaseStatus.Open,
          categories: [],
        })
      );

      await expect(() =>
        client.updateCase(new u64(9), 420, [])
      ).rejects.toThrowErrorMatchingSnapshot();

      mockRpcAccount(
        endpoint,
        "DgBtqgnzYRsUZP3PhX5rCLfNycTQQ8cp7eMseosUQ4Ja",
        new Community({
          authority: AUTHORITY.publicKey,
          name: "hapi.one",
          nextCaseId: new u64(11),
        })
      );

      mockRpcAccount(
        endpoint,
        "DAgLvQ9zU2K5mseeBjCXubv8bCx41F6zwWbkE2ZeuKY2",
        new Case({
          name: "super case",
          reporterKey: client.payerPublicKey,
          status: CaseStatus.Open,
          categories: [],
        })
      );

      await expect(() =>
        client.updateCase(new u64(9), 3, [])
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should update a case - success", async () => {
      client.payer = REPORTER_ALICE;

      mockRpcAccount(
        endpoint,
        "DgBtqgnzYRsUZP3PhX5rCLfNycTQQ8cp7eMseosUQ4Ja",
        new Community({
          authority: AUTHORITY.publicKey,
          name: "hapi.one",
          nextCaseId: new u64(11),
        })
      );

      mockRpcAccount(
        endpoint,
        "HqvJ9EVws3tEUuptmXUZpPh3JcJJvoSPBk5LTgaoAtV9",
        new Case({
          name: "gamble",
          status: CaseStatus.Open,
          categories: [],
          reporterKey: client.payerPublicKey,
        })
      );

      mockRpcOk(endpoint, "getRecentBlockhash", [], {
        context: { slot: 159 },
        value: {
          blockhash: "FMjzqMLtuECN4cKNZcu221QCBVExhJZqrKACi7pmw4qL",
          feeCalculator: { lamportsPerSignature: 5000 },
        },
      });

      const txInput = mockRpcOk(
        endpoint,
        "sendTransaction",
        [],
        "43peZU1kygGZ5WZA4spohczd4iKHG3RuoX1XbNGcuMsghnsRKbE2PD9jfTDDUTXLaucDX7WY4a3ENtkDG7wPDKGU"
      );

      mockConfirmTransaction(client);

      mockRpcAccount(
        endpoint,
        "HqvJ9EVws3tEUuptmXUZpPh3JcJJvoSPBk5LTgaoAtV9",
        new Case({
          name: "gamble",
          status: CaseStatus.Closed,
          categories: [Category.Gambling],
          reporterKey: client.payerPublicKey,
        })
      );

      const { data } = await client.updateCase(new u64(2), CaseStatus.Closed, [
        Category.Gambling,
      ]);

      expect(stringify(data)).toMatchSnapshot();

      expect(
        UpdateCaseIx.decode(getIxFromRawTx(txInput.input().params[0] as string))
      ).toMatchInlineSnapshot(`
        UpdateCaseIx {
          "categories": 256,
          "status": 1,
          "tag": 7,
        }
      `);
    });
  });

  describe("createAddress", () => {
    it("should throw - community not found", async () => {
      client.switchCommunity("community404");

      mockRpcAccount(
        endpoint,
        "mJLCqGmUWWDzYcDVHRAjaDJocoPDLzeimfD7KzwnxFh",
        null
      );

      await expect(() =>
        client.createAddress(
          "solana",
          new PublicKey("2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew"),
          new u64(0),
          Category.Safe,
          0
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should throw - network not found", async () => {
      mockRpcAccount(
        endpoint,
        "DgBtqgnzYRsUZP3PhX5rCLfNycTQQ8cp7eMseosUQ4Ja",
        new Community({
          authority: AUTHORITY.publicKey,
          name: "hapi.one",
          nextCaseId: new u64(0),
        })
      );

      mockRpcAccount(
        endpoint,
        "CkAua1GMeBR3HhKqSyiFtnGZjJm7HsWNq5ynH3wTykC5",
        null
      );

      await expect(() =>
        client.createAddress(
          "solana",
          new PublicKey("2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew"),
          new u64(0),
          Category.Safe,
          0
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should throw - case not found", async () => {
      mockRpcAccount(
        endpoint,
        "DgBtqgnzYRsUZP3PhX5rCLfNycTQQ8cp7eMseosUQ4Ja",
        new Community({
          authority: AUTHORITY.publicKey,
          name: "hapi.one",
          nextCaseId: new u64(1),
        })
      );

      mockRpcAccount(
        endpoint,
        "CkAua1GMeBR3HhKqSyiFtnGZjJm7HsWNq5ynH3wTykC5",
        new Network({ name: "solana" })
      );

      mockRpcAccount(
        endpoint,
        "5yGEyZT2WwuLD6BJuvP7TXRcR2ojZTpFVv2TkQm6eX2P",
        null
      );

      await expect(() =>
        client.createAddress(
          "solana",
          new PublicKey("2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew"),
          new u64(404),
          Category.Safe,
          0
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should throw - invalid category", async () => {
      mockRpcAccount(
        endpoint,
        "DgBtqgnzYRsUZP3PhX5rCLfNycTQQ8cp7eMseosUQ4Ja",
        new Community({
          authority: AUTHORITY.publicKey,
          name: "hapi.one",
          nextCaseId: new u64(1),
        })
      );

      mockRpcAccount(
        endpoint,
        "CkAua1GMeBR3HhKqSyiFtnGZjJm7HsWNq5ynH3wTykC5",
        new Network({ name: "solana" })
      );

      mockRpcAccount(
        endpoint,
        "63G8TLWGQpd26UZj7L9Qr9e3R1MPbybLcW3A7LXtG1Sk",
        new Case({
          name: "invalid category",
          reporterKey: client.payerPublicKey,
          status: CaseStatus.Open,
          categories: [],
        })
      );

      await expect(() =>
        client.createAddress(
          "solana",
          new PublicKey("2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew"),
          new u64(0),
          99999999,
          0
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should throw - invalid risk score", async () => {
      mockRpcAccount(
        endpoint,
        "DgBtqgnzYRsUZP3PhX5rCLfNycTQQ8cp7eMseosUQ4Ja",
        new Community({
          authority: AUTHORITY.publicKey,
          name: "hapi.one",
          nextCaseId: new u64(1),
        })
      );

      mockRpcAccount(
        endpoint,
        "CkAua1GMeBR3HhKqSyiFtnGZjJm7HsWNq5ynH3wTykC5",
        new Network({ name: "solana" })
      );

      mockRpcAccount(
        endpoint,
        "63G8TLWGQpd26UZj7L9Qr9e3R1MPbybLcW3A7LXtG1Sk",
        new Case({
          name: "invalid category",
          reporterKey: client.payerPublicKey,
          status: CaseStatus.Open,
          categories: [],
        })
      );

      await expect(() =>
        client.createAddress(
          "solana",
          new PublicKey("2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew"),
          new u64(0),
          Category.Safe,
          69
        )
      ).rejects.toThrowErrorMatchingSnapshot();
    });

    it("should create an address - success", async () => {
      mockRpcAccount(
        endpoint,
        "DgBtqgnzYRsUZP3PhX5rCLfNycTQQ8cp7eMseosUQ4Ja",
        new Community({
          authority: AUTHORITY.publicKey,
          name: "hapi.one",
          nextCaseId: new u64(1),
        })
      );

      mockRpcAccount(
        endpoint,
        "CkAua1GMeBR3HhKqSyiFtnGZjJm7HsWNq5ynH3wTykC5",
        new Network({ name: "solana" })
      );

      mockRpcAccount(
        endpoint,
        "63G8TLWGQpd26UZj7L9Qr9e3R1MPbybLcW3A7LXtG1Sk",
        new Case({
          name: "cool stuff",
          reporterKey: client.payerPublicKey,
          status: CaseStatus.Open,
          categories: [],
        })
      );

      mockConfirmTransaction(client);

      mockRpcOk(endpoint, "getRecentBlockhash", [], {
        context: { slot: 159 },
        value: {
          blockhash: "Gk8Vxi2AjCDBtAufgVKcnHv327sxEuTcZKUrNYusKhd4",
          feeCalculator: { lamportsPerSignature: 5000 },
        },
      });

      const txInput = mockRpcOk(
        endpoint,
        "sendTransaction",
        [],
        "64cBhBwynYdXc6Ybr1suHM5Hz4xKtEzB3uyyg3gRtE8hfenzQJzd5whCZdPF5Xf5Quffvtib7U82XqYRQet4roU2"
      );

      mockRpcAccount(
        endpoint,
        "4SDf7t46o18vMznTRQJWTWLECHUfcAF3u8BnLaHotbET",
        new Address({
          caseId: new u64(0),
          risk: 0,
          category: Category.Safe,
        })
      );

      const { data } = await client.createAddress(
        "solana",
        new PublicKey("2Yy2iSPJv4iEMyNkUX7ydFoufSmyPLMc8P9owJopFRew"),
        new u64(0),
        Category.Safe,
        0
      );

      expect(data).toMatchSnapshot();

      expect(
        CreateAddressIx.decode(
          getIxFromRawTx(txInput.input().params[0] as string)
        )
      ).toMatchInlineSnapshot(`
        CreateAddressIx {
          "address": Uint8Array [
            23,
            12,
            11,
            122,
            35,
            15,
            177,
            67,
            2,
            229,
            208,
            72,
            228,
            26,
            206,
            78,
            10,
            57,
            76,
            194,
            54,
            138,
            184,
            210,
            241,
            138,
            192,
            10,
            252,
            247,
            58,
            24,
          ],
          "caseId": "00",
          "category": 0,
          "risk": 0,
          "tag": 8,
        }
      `);
    });
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
