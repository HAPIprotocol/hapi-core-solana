import {
  AUTHORITY,
  REPORTER_ALICE,
  REPORTER_BOB,
  REPORTER_CAROL,
  NOBODY,
} from "./keypairs";
import { AuthorityClient, ReporterType } from "../src";

const ENDPOINT_URL = "http://localhost:18899";

describe("Scenario 1", () => {
  let authCli: AuthorityClient;

  beforeAll(async () => {
    authCli = new AuthorityClient({
      endpoint: ENDPOINT_URL,
      payer: AUTHORITY,
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

    it("Create comunity: sc1.hapi.one", async () => {
      authCli.switchCommunity("sc1.hapi.one");

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

      expect(
        (await authCli.connection.getAccountInfo(account)).data.toString(
          "base64"
        )
      ).toMatchInlineSnapshot(
        `"Ae83pQQEsYipbhD1URInU/iuiQbErgmDyScnrPJbOPlRAAAAAAAAAAAMAAAAc2MxLmhhcGkub25lAAAAAAAAAAAAAAAAAAAAAA=="`
      );
    });

    it("Create network: solana", async () => {
      const { account, data } = await authCli.createNetwork("solana");

      expect(account.toBase58()).toMatchInlineSnapshot(
        `"BLv9WuS84p3GVE6iUpBjyxXVoWfqfAsZ7pyvKtPVafuF"`
      );

      expect(data).toMatchInlineSnapshot(`
      Network {
        "accountType": 2,
        "name": "solana",
      }
    `);

      expect(
        (await authCli.connection.getAccountInfo(account)).data.toString(
          "base64"
        )
      ).toMatchInlineSnapshot(`"AgYAAABzb2xhbmEAAAAAAAAAAAAAAAAAAAAAAAAAAAAA"`);
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

      expect(
        (await authCli.connection.getAccountInfo(account)).data.toString(
          "base64"
        )
      ).toMatchInlineSnapshot(
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

      expect(
        (await authCli.connection.getAccountInfo(account)).data.toString(
          "base64"
        )
      ).toMatchInlineSnapshot(
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

      expect(
        (await authCli.connection.getAccountInfo(account)).data.toString(
          "base64"
        )
      ).toMatchInlineSnapshot(
        `"AwAFAAAAQ2Fyb2wAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=="`
      );
    });
  });
});
