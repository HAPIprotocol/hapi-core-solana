//jest.mock("rpc-websockets"); // disable web3's websocket connections

import stringify from "fast-json-stable-stringify";
import nock from "nock";

import {
  captureConsoleError,
  mockConfirmTransaction,
  mockRpcAccount,
  mockRpcError,
  mockRpcOk,
} from "../test/util/mocks";
import { Case, CaseStatus, Category, Community } from "./state";
import { ReporterClient } from "./reporter-client";
import {
  AUTHORITY,
  REPORTER_ALICE,
  REPORTER_CAROL,
  UNINITIALIZED,
} from "../test/keypairs";
import { u64 } from "./utils";

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

      mockRpcError(endpoint, "sendTransaction", [], {
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

      mockRpcOk(
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

      mockRpcOk(
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
    });
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
