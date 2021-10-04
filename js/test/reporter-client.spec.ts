import { ReporterClient } from "../src";

describe("ReporterClient", () => {
  it("should initialize", () => {
    const client = new ReporterClient({
      endpoint: "http://localhost:8899",
    });

    expect(client).toBeDefined();
  });

  describe("viewCommunity", () => {
    it.todo("should throw - not found");
    it.todo("should respond - success");
  });

  describe("viewNetwork", () => {
    it.todo("should throw - not found");
    it.todo("should respond - success");
  });

  describe("viewReporter", () => {
    it.todo("should throw - not found");
    it.todo("should respond - success");
  });

  describe("viewCase", () => {
    it.todo("should throw - not found");
    it.todo("should respond - success");
  });

  describe("viewAddress", () => {
    it.todo("should throw - not found");
    it.todo("should respond - success");
  });

  describe("reportCase", () => {
    it.todo("should throw - invalid community name");
    it.todo("should throw - invalid case name");
    it.todo("should throw - invalid categories");
    it.todo("should exec - success");
  });
});
