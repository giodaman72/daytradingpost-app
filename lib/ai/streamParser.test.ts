import { describe, expect, it } from "vitest";
import { parseAssistantEventBuffer } from "./streamParser";

describe("assistant stream parser", () => {
  it("parses complete events and preserves partial data", () => {
    const result = parseAssistantEventBuffer(
      'data: {"type":"delta","text":"Hi"}\n\ndata: {"type":"del',
    );
    expect(result.events).toEqual([{ type: "delta", text: "Hi" }]);
    expect(result.remainder).toContain("data:");
  });
});
