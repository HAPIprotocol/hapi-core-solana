import { Transaction } from "@solana/web3.js";
import nock from "nock";

import { Address, Case, Community, Network, Reporter } from "../../src/state";

interface mockRpcInput {
  method: string;
  params: unknown[];
}

export function mockRpcOk(
  url: string,
  method: string,
  params: Array<unknown>,
  result: unknown
): { input: () => mockRpcInput | undefined } {
  let savedInput: mockRpcInput;

  nock(url, { encodedQueryParams: true })
    .post("/", (input) => {
      savedInput = input;
      return (
        input.method === method &&
        params
          .map((value, index) => value === input.params[index])
          .reduce((result, value) => {
            return result && value;
          }, true)
      );
    })
    .reply(200, {
      jsonrpc: "2.0",
      result,
      id: "f2653441-fed8-4e4f-ac1e-dcc560ab5abc",
    });

  return {
    input: () => savedInput,
  };
}

export function mockRpcError(
  url: string,
  method: string,
  params: Array<unknown>,
  error: unknown
): { input: () => mockRpcInput | undefined } {
  let savedInput: mockRpcInput;

  nock(url, { encodedQueryParams: true })
    .post("/", (input) => {
      savedInput = input;
      return (
        input.method === method &&
        params
          .map((value, index) => value === input.params[index])
          .reduce((result, value) => {
            return result && value;
          }, true)
      );
    })
    .reply(200, {
      jsonrpc: "2.0",
      error,
      id: "f2653441-fed8-4e4f-ac1e-dcc560ab5abc",
    });

  return {
    input: () => savedInput,
  };
}

export function mockConfirmTransaction(client: unknown): jest.SpyInstance {
  if (client["connection"]) {
    return jest
      .spyOn(client["connection"], "confirmTransaction")
      .mockResolvedValue({ context: { slot: 1 }, value: { err: null } });
  } else {
    throw new Error(`Object doesn't have "connection" attribute`);
  }
}

export function mockRpcAccount<
  T extends Address | Network | Case | Community | Reporter
>(
  url: string,
  address: string,
  entity: T | null
): { input: () => mockRpcInput | undefined } {
  return mockRpcOk(url, "getAccountInfo", [address], {
    context: { slot: 8180 },
    value:
      entity === null
        ? null
        : {
            data: [
              Buffer.from(entity.serialize()).toString("base64"),
              "base64",
            ],
            executable: false,
            lamports: 1398960,
            owner: "hapiScWyxeZy36fqXD5CcRUYFCUdid26jXaakAtcdZ7",
            rentEpoch: 0,
          },
  });
}

export function captureConsoleError(): { finish: () => string } {
  let buffer = "";
  const spy = jest.spyOn(console, "error").mockImplementation((...args) => {
    buffer += args.join(" ") + "\n";
    return;
  });

  return {
    finish() {
      spy.mockRestore();
      return buffer;
    },
  };
}

export function getIxFromRawTx(rawTx: string, instruction = 0): Buffer {
  const buffer = Buffer.from(rawTx, "base64");
  return Transaction.from(buffer).instructions[instruction].data;
}
