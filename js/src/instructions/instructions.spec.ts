import { CaseStatus, Categories, Category, ReporterType } from "../state";
import { u32, u64, u8 } from "../utils";
import {
  CreateAddressIx,
  CreateCaseIx,
  CreateCommunityIx,
  CreateNetworkIx,
  CreateReporterIx,
  UpdateAddressIx,
  UpdateCaseIx,
  UpdateCommunityIx,
  UpdateReporterIx,
} from "./instructions";

describe("instructions", () => {
  it("CreateCommunityIx - should encode/decode", () => {
    const ix = new CreateCommunityIx({
      name: "hapi.one",
    });

    const encoded = ix.encode();

    expect(encoded.toString("base64")).toMatchInlineSnapshot(
      `"AAgAAABoYXBpLm9uZQ=="`
    );

    expect(CreateCommunityIx.decode(encoded)).toMatchInlineSnapshot(`
      CreateCommunityIx {
        "name": "hapi.one",
        "tag": 0,
      }
    `);
  });

  it("UpdateCommunityIx - should encode/decode", () => {
    const ix = new UpdateCommunityIx({ name: "unhapi.one" });

    const encoded = ix.encode();

    expect(encoded.toString("base64")).toMatchInlineSnapshot(
      `"AQoAAAB1bmhhcGkub25l"`
    );

    expect(UpdateCommunityIx.decode(encoded)).toMatchInlineSnapshot(`
      UpdateCommunityIx {
        "name": "unhapi.one",
        "tag": 1,
      }
    `);
  });

  it("CreateNetworkIx - should encode/decode", () => {
    const ix = new CreateNetworkIx({ name: "solana" });

    const encoded = ix.encode();

    expect(encoded.toString("base64")).toMatchInlineSnapshot(
      `"AgYAAABzb2xhbmE="`
    );

    expect(CreateNetworkIx.decode(encoded)).toMatchInlineSnapshot(`
      CreateNetworkIx {
        "name": "solana",
        "tag": 2,
      }
    `);
  });

  it("CreateReporterIx - should encode/decode", () => {
    const ix = new CreateReporterIx({
      name: "reporter",
      reporterType: ReporterType.Authority,
    });

    const encoded = ix.encode();

    expect(encoded.toString("base64")).toMatchInlineSnapshot(
      `"BAMIAAAAcmVwb3J0ZXI="`
    );

    expect(CreateReporterIx.decode(encoded)).toMatchInlineSnapshot(`
      CreateReporterIx {
        "name": "reporter",
        "reporterType": 3,
        "tag": 4,
      }
    `);
  });

  it("UpdateReporterIx - should encode/decode", () => {
    const ix = new UpdateReporterIx({
      name: "updated reporter",
      reporterType: ReporterType.Full,
    });

    const encoded = ix.encode();

    expect(encoded.toString("base64")).toMatchInlineSnapshot(
      `"BQIQAAAAdXBkYXRlZCByZXBvcnRlcg=="`
    );

    expect(UpdateReporterIx.decode(encoded)).toMatchInlineSnapshot(`
      UpdateReporterIx {
        "name": "updated reporter",
        "reporterType": 2,
        "tag": 5,
      }
    `);
  });

  it("CreateCaseIx - should encode/decode", () => {
    const ix = new CreateCaseIx({
      caseId: new u64(1),
      categories: new u32(300),
      status: CaseStatus.Open,
      name: "open and shut, Johnson!",
    });

    const encoded = ix.encode();

    expect(encoded.toString("base64")).toMatchInlineSnapshot(
      `"BgEAAAAAAAAALAEAAAAXAAAAb3BlbiBhbmQgc2h1dCwgSm9obnNvbiE="`
    );

    expect(CreateCaseIx.decode(encoded)).toMatchInlineSnapshot(`
      CreateCaseIx {
        "caseId": "01",
        "categories": 300,
        "name": "open and shut, Johnson!",
        "status": 0,
        "tag": 6,
      }
    `);
  });

  it("UpdateCaseIx - should encode/decode", () => {
    const ix = new UpdateCaseIx({
      status: CaseStatus.Closed,
      categories: new u32(0),
    });

    const encoded = ix.encode();

    expect(encoded.toString("base64")).toMatchInlineSnapshot(`"BwAAAAAB"`);

    expect(UpdateCaseIx.decode(encoded)).toMatchInlineSnapshot(`
      UpdateCaseIx {
        "categories": 0,
        "status": 1,
        "tag": 7,
      }
    `);
  });

  it("CreateAddressIx - should encode/decode", () => {
    const ix = new CreateAddressIx({
      address: Buffer.alloc(32),
      risk: 5,
      caseId: new u64(1),
      category: new u8(Categories.indexOf(Category.Mixer)),
    });

    const encoded = ix.encode();

    expect(encoded.toString("base64")).toMatchInlineSnapshot(
      `"CAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABQEAAAAAAAAACw=="`
    );

    expect(CreateAddressIx.decode(encoded)).toMatchInlineSnapshot(`
      CreateAddressIx {
        "address": Uint8Array [
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
          0,
        ],
        "caseId": "01",
        "category": 11,
        "risk": 5,
        "tag": 8,
      }
    `);
  });

  it("UpdateAddressIx - should encode/decode", () => {
    const ix = new UpdateAddressIx({
      risk: 5,
      caseId: new u64(1),
      category: new u8(Categories.indexOf(Category.Mixer)),
    });

    const encoded = ix.encode();

    expect(encoded.toString("base64")).toMatchInlineSnapshot(
      `"CQUBAAAAAAAAAAs="`
    );

    expect(UpdateAddressIx.decode(encoded)).toMatchInlineSnapshot(`
UpdateAddressIx {
  "caseId": "01",
  "category": 11,
  "risk": 5,
  "tag": 9,
}
`);
  });
});
