import { execSync } from "child_process";

export default async function teardown(): Promise<void> {
  const pid = process.env.SOLANA_TEST_VALIDATOR_PID;
  process.stdout.write(`\n==> Stopping test validator process ${pid}\n`);
  execSync(`kill ${pid}`);

  const ledgerDir = process.env.LEDGER_DIR;
  process.stdout.write(`\n==> Cleaning up ledger files at ${ledgerDir}\n\n`);
  execSync(`rm -rf ${ledgerDir}`);
}
