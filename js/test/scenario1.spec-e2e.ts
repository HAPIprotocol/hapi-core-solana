import { captureConsoleError } from "./util/mocks";
import {
  AUTHORITY,
  REPORTER_ALICE,
  REPORTER_BOB,
  REPORTER_CAROL,
  NOBODY,
} from "./keypairs";
import {
  AuthorityClient,
  CaseStatus,
  Category,
  ReporterClient,
  ReporterType,
  u64,
} from "../src";
import { PublicKey } from "@solana/web3.js";
import { hexToPublicKey } from "../src/utils";

const ENDPOINT_URL = "http://localhost:18899";

jest.setTimeout(10e3);

describe("Scenario 1", () => {
  let authCli: AuthorityClient;
  let repCli: ReporterClient;

  const communityName1 = "sc1.hapi.one";
  const networkName1 = "solana";
  const networkName2 = "ethereum";

  async function getAccountData(account: PublicKey): Promise<string> {
    return (await authCli.connection.getAccountInfo(account)).data.toString(
      "base64"
    );
  }

  beforeAll(async () => {
    authCli = new AuthorityClient({
      endpoint: ENDPOINT_URL,
      payer: AUTHORITY,
      commitment: "confirmed",
    });

    repCli = new ReporterClient({
      endpoint: ENDPOINT_URL,
      payer: REPORTER_ALICE,
      commitment: "confirmed",
    });
  });

  afterAll(async () => {
    // Wait for connection to close
    await new Promise((resolve) => setTimeout(resolve, 1000));
  });

  describe("Community setup", () => {
    it("Airdrop to test accounts", async () => {
      const keypairs = [
        AUTHORITY,
        REPORTER_ALICE,
        REPORTER_BOB,
        REPORTER_CAROL,
        NOBODY,
      ];

      // Send airdrop requests
      const signatures = await Promise.all(
        keypairs.map((keypair) =>
          authCli.connection.requestAirdrop(keypair.publicKey, 10e9)
        )
      );

      // Wait for airdrops to confirm
      await Promise.all(
        signatures.map((signature) =>
          authCli.connection.confirmTransaction(signature)
        )
      );

      const balances = await Promise.all(
        keypairs.map((keypair) =>
          authCli.connection.getBalance(keypair.publicKey)
        )
      );

      expect(balances).toEqual([10e9, 10e9, 10e9, 10e9, 10e9]);
    });

    it(`Create comunity: ${communityName1}`, async () => {
      authCli.switchCommunity(communityName1);

      const { account, data } = await authCli.createCommunity();

      expect(account.toBase58()).toMatchInlineSnapshot(
        `"4RA7YwQrXAxDQ4HyKDT5Za4EP5jHdNDN1hsaWVJP5VCu"`
      );

      expect(data).toMatchInlineSnapshot(`
        Community {
          "accountType": 1,
          "authority": PublicKey {
            "_bn": "ef37a50404b188a96e10f551122753f8ae8906c4ae0983c92727acf25b38f951",
          },
          "name": "sc1.hapi.one",
          "nextCaseId": "00",
        }
      `);

      await expect(getAccountData(account)).resolves.toMatchInlineSnapshot(
        `"Ae83pQQEsYipbhD1URInU/iuiQbErgmDyScnrPJbOPlRAAAAAAAAAAAMAAAAc2MxLmhhcGkub25lAAAAAAAAAAAAAAAAAAAAAA=="`
      );
    });

    it(`It shouldn't be possible to create a community with a name too long`, async () => {
      await expect(() =>
        authCli.createCommunity("12345678901234567890123456789")
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Community name length should not be over 28 bytes"`
      );
    });

    it(`Create network: ${networkName1}`, async () => {
      const { account, data } = await authCli.createNetwork(networkName1);

      expect(account.toBase58()).toMatchInlineSnapshot(
        `"BLv9WuS84p3GVE6iUpBjyxXVoWfqfAsZ7pyvKtPVafuF"`
      );

      expect(data).toMatchInlineSnapshot(`
        Network {
          "accountType": 2,
          "name": "solana",
        }
      `);

      await expect(getAccountData(account)).resolves.toMatchInlineSnapshot(
        `"AgYAAABzb2xhbmEAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"`
      );
    });

    it(`Create network: ${networkName2}`, async () => {
      const { account, data } = await authCli.createNetwork(networkName2);

      expect(account.toBase58()).toMatchInlineSnapshot(
        `"HK2M99Vtztv7yJ2kJgf9vfxkivpH6EQLscf95ZSShmc2"`
      );

      expect(data).toMatchInlineSnapshot(`
        Network {
          "accountType": 2,
          "name": "ethereum",
        }
      `);

      await expect(getAccountData(account)).resolves.toMatchInlineSnapshot(
        `"AggAAABldGhlcmV1bQAAAAAAAAAAAAAAAAAAAAAAAAAA"`
      );
    });

    it("Create reporter: Alice", async () => {
      const { account, data } = await authCli.createReporter(
        REPORTER_ALICE.publicKey,
        ReporterType.Full,
        "Alice"
      );

      expect(account.toBase58()).toMatchInlineSnapshot(
        `"9NyLuWr6Lem3BckRnBLkWs8VT3W4exNqBdVyCH8AdQun"`
      );

      expect(data).toMatchInlineSnapshot(`
              Reporter {
                "accountType": 3,
                "name": "Alice",
                "reporterType": 2,
              }
          `);

      await expect(getAccountData(account)).resolves.toMatchInlineSnapshot(
        `"AwIFAAAAQWxpY2UAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="`
      );
    });

    it("Create reporter: Bob", async () => {
      const { account, data } = await authCli.createReporter(
        REPORTER_BOB.publicKey,
        ReporterType.Tracer,
        "Bob"
      );

      expect(account.toBase58()).toMatchInlineSnapshot(
        `"5sdSeU6SrhsGDnTprLnZbiJEA8c6W1VXReuuhi2SmMF7"`
      );

      expect(data).toMatchInlineSnapshot(`
              Reporter {
                "accountType": 3,
                "name": "Bob",
                "reporterType": 1,
              }
          `);

      await expect(getAccountData(account)).resolves.toMatchInlineSnapshot(
        `"AwEDAAAAQm9iAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="`
      );
    });

    it("Create reporter: Carol", async () => {
      const { account, data } = await authCli.createReporter(
        REPORTER_CAROL.publicKey,
        ReporterType.Inactive,
        "Carol"
      );

      expect(account.toBase58()).toMatchInlineSnapshot(
        `"G2ZdSNx6Tuz6gh3s6QsmZV7UuotYJNkJy9t8xFcfYsZs"`
      );

      expect(data).toMatchInlineSnapshot(`
              Reporter {
                "accountType": 3,
                "name": "Carol",
                "reporterType": 0,
              }
          `);

      await expect(getAccountData(account)).resolves.toMatchInlineSnapshot(
        `"AwAFAAAAQ2Fyb2wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="`
      );
    });
  });

  describe("Case management", () => {
    let caseId: u64;

    it("Switch client community", () => {
      repCli.switchCommunity(communityName1);
    });

    it("Create case", async () => {
      const { account, data, meta } = await repCli.createCase(
        "First case",
        CaseStatus.Open,
        []
      );

      caseId = meta.caseId;

      expect(caseId.toNumber()).toMatchInlineSnapshot(`0`);

      expect(account.toBase58()).toMatchInlineSnapshot(
        `"4RA7YwQrXAxDQ4HyKDT5Za4EP5jHdNDN1hsaWVJP5VCu"`
      );

      expect(data).toMatchInlineSnapshot(`
        Case {
          "accountType": 4,
          "categories": Array [],
          "name": "First case",
          "reporterKey": PublicKey {
            "_bn": "c0fdcf81e4689a79e0cb64d88098f5342910652a340ddc0703dbdb10386dc678",
          },
          "status": 0,
        }
      `);

      await expect(getAccountData(account)).resolves.toMatchInlineSnapshot(
        `"Ae83pQQEsYipbhD1URInU/iuiQbErgmDyScnrPJbOPlRAQAAAAAAAAAMAAAAc2MxLmhhcGkub25lAAAAAAAAAAAAAAAAAAAAAA=="`
      );
    });

    it("Update case categories", async () => {
      const { account, data } = await repCli.updateCase(
        caseId,
        CaseStatus.Open,
        [Category.DeFi, Category.LowRiskExchange]
      );

      expect(account.toBase58()).toMatchInlineSnapshot(
        `"4RA7YwQrXAxDQ4HyKDT5Za4EP5jHdNDN1hsaWVJP5VCu"`
      );

      expect(data).toMatchInlineSnapshot(`
        Case {
          "accountType": 4,
          "categories": Array [
            32,
            8,
          ],
          "name": "First case",
          "reporterKey": PublicKey {
            "_bn": "c0fdcf81e4689a79e0cb64d88098f5342910652a340ddc0703dbdb10386dc678",
          },
          "status": 0,
        }
      `);
    });

    it("Close case", async () => {
      const { account, data } = await repCli.updateCase(
        caseId,
        CaseStatus.Closed,
        [Category.DeFi, Category.LowRiskExchange]
      );

      expect(account.toBase58()).toMatchInlineSnapshot(
        `"4RA7YwQrXAxDQ4HyKDT5Za4EP5jHdNDN1hsaWVJP5VCu"`
      );

      expect(data).toMatchInlineSnapshot(`
        Case {
          "accountType": 4,
          "categories": Array [
            32,
            8,
          ],
          "name": "First case",
          "reporterKey": PublicKey {
            "_bn": "c0fdcf81e4689a79e0cb64d88098f5342910652a340ddc0703dbdb10386dc678",
          },
          "status": 1,
        }
      `);
    });

    it("Attempt to create a case by a tracer should fail", async () => {
      repCli.payer = REPORTER_BOB;

      const consoleSpy = captureConsoleError();

      await expect(() =>
        repCli.createCase("Failure", CaseStatus.Open, [])
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x9"`
      );

      expect(consoleSpy.finish()).toContain(
        "Reporter doesn't have a permission to report a case"
      );
    });

    it("Attempt to create a case by an inactive reporter should fail", async () => {
      repCli.payer = REPORTER_CAROL;

      const consoleSpy = captureConsoleError();

      await expect(() =>
        repCli.createCase("Failure", CaseStatus.Open, [])
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"failed to send transaction: Transaction simulation failed: Error processing Instruction 0: custom program error: 0x9"`
      );

      expect(consoleSpy.finish()).toContain(
        "Reporter doesn't have a permission to report a case"
      );
    });

    it("Attempt to create a case by a nobody should fail", async () => {
      repCli.payer = NOBODY;

      const consoleSpy = captureConsoleError();

      await expect(() =>
        repCli.createCase("Failure", CaseStatus.Open, [])
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"failed to send transaction: Transaction simulation failed: Error processing Instruction 0: instruction requires an initialized account"`
      );

      expect(consoleSpy.finish()).toContain("Error: UninitializedAccount");
    });
  });

  describe("Address management", () => {
    let caseId: u64;

    it("Create case", async () => {
      repCli.payer = REPORTER_ALICE;
      const { account, meta } = await repCli.createCase(
        "Second case",
        CaseStatus.Open,
        []
      );

      caseId = meta.caseId;

      expect(caseId.toNumber()).toMatchInlineSnapshot(`1`);

      expect(account.toBase58()).toMatchInlineSnapshot(
        `"4RA7YwQrXAxDQ4HyKDT5Za4EP5jHdNDN1hsaWVJP5VCu"`
      );
    });

    it("Add NOBODY's address", async () => {
      const addressNobody = NOBODY.publicKey;

      const { account, data } = await repCli.createAddress(
        networkName1,
        addressNobody,
        caseId,
        Category.WalletService,
        1
      );

      expect(account.toBase58()).toMatchInlineSnapshot(
        `"HLxjkKgfMN3Pc6r3fSH8Gj5uwAdFMTteSWyNKRur2CoT"`
      );

      expect(data).toMatchInlineSnapshot(`
        Address {
          "accountType": 5,
          "caseId": "01",
          "category": 1,
          "risk": 1,
        }
      `);
    });

    it(`It shouldn't be possible to create the same address again`, async () => {
      const addressNobody = NOBODY.publicKey;

      const consoleSpy = captureConsoleError();

      await expect(() =>
        repCli.createAddress(
          networkName1,
          addressNobody,
          caseId,
          Category.WalletService,
          1
        )
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"failed to send transaction: Transaction simulation failed: Error processing Instruction 0: instruction requires an uninitialized account"`
      );

      expect(consoleSpy.finish()).toContain("Error: AccountAlreadyInitialized");
    });

    it(`It shouldn't be possible to create an address with a wrong case ID`, async () => {
      const address = new PublicKey(
        "5rppqq75NTDz989ioqF4ghdGNbERP8tbfxSPctzWxwad"
      );

      await expect(() =>
        repCli.createAddress(
          networkName1,
          address,
          new u64("100000000"),
          Category.WalletService,
          1
        )
      ).rejects.toThrowErrorMatchingInlineSnapshot(
        `"Invalid case account provided"`
      );
    });

    it("Add Ethereum Blackhole address", async () => {
      const addressBlackhole = hexToPublicKey(
        "0000000000000000000000000000000000000001"
      );

      const { account, data } = await repCli.createAddress(
        networkName2,
        addressBlackhole,
        caseId,
        Category.Safe,
        1
      );

      expect(account.toBase58()).toMatchInlineSnapshot(
        `"79XZACTb39YrLjNAkeYLx4YHwm2s6oi9E7U34Q3UVDnr"`
      );

      expect(data).toMatchInlineSnapshot(`
        Address {
          "accountType": 5,
          "caseId": "01",
          "category": 0,
          "risk": 1,
        }
      `);
    });

    it.todo("Update address category");
    it.todo("Update address risk score");
    it.todo("Update address case ID");
    it.todo(
      "It shouldn't be possible to create an address by inactive reporter"
    );
  });
});
