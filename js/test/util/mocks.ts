import nock from "nock";

export function mockRpcOk(
  url: string,
  method: string,
  params: Array<unknown>,
  result: unknown
): void {
  nock(url, { encodedQueryParams: true })
    .post(
      "/",
      (input) =>
        input.method === method &&
        params
          .map((value, index) => value === input.params[index])
          .reduce((result, value) => {
            return result && value;
          }, true)
    )
    .reply(200, {
      jsonrpc: "2.0",
      result,
      id: "f2653441-fed8-4e4f-ac1e-dcc560ab5abc",
    });
}

export function mockRpcError(
  url: string,
  method: string,
  params: Array<unknown>,
  error: unknown
): void {
  nock(url, { encodedQueryParams: true })
    .post(
      "/",
      (input) =>
        input.method === method &&
        params
          .map((value, index) => value === input.params[index])
          .reduce((result, value) => {
            return result && value;
          }, true)
    )
    .reply(200, {
      jsonrpc: "2.0",
      error,
      id: "f2653441-fed8-4e4f-ac1e-dcc560ab5abc",
    });
}
