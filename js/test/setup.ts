import { execSync, spawn } from "child_process";
import { existsSync, mkdirSync } from "fs";

import { HAPI_PROGRAM_ID } from "../src/constants";

export default async function setup(): Promise<void> {
  const ledgerDir = `/tmp/solana-test-validator/${process.pid}`;

  mkdirSync(ledgerDir, { recursive: true });

  const programBpf = `${process.env.PWD}/../program/target/deploy/hapi_core_solana.so`;

  if (!existsSync(programBpf)) {
    process.stderr.write(`\n==> Compiled program not found at ${programBpf}\n`);
    return process.exit(1);
  }

  process.env.LEDGER_DIR = ledgerDir;

  const rpcPort = (process.env.RPC_PORT = "18899");

  const solanaTestValidator = spawn("solana-test-validator", [
    "--reset",
    `--ledger=${ledgerDir}`,
    `--rpc-port=${rpcPort}`,
    `--bpf-program`,
    HAPI_PROGRAM_ID.toString(),
    programBpf,
  ]);

  const errors = [];
  solanaTestValidator.stderr.on("data", (data) => {
    errors.push(data.toString());
  });

  const pid = (process.env.SOLANA_TEST_VALIDATOR_PID =
    solanaTestValidator.pid.toString());

  process.stdout.write(`\n==> Starting test validator process: ${pid}\n`);

  let isConnected = false;
  let i = 100;
  while (i--) {
    try {
      execSync(`nc -z localhost ${rpcPort}`);
      isConnected = true;
      break;
    } catch {
      await new Promise((resolve) => setTimeout(resolve, 100));
    }
  }

  if (isConnected) {
    process.stdout.write(
      `\n==> Test validator is listening at localhost:${rpcPort}\n`
    );
  } else {
    process.stderr.write(`\n==> Couldn't start test validator\n`);
    process.stderr.write(errors.join("\n"));
    return process.exit(2);
  }
}
