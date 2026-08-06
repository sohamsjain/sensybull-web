import { describe, it, expect } from "vitest";
import { formatDealValue } from "@/lib/utils";

describe("formatDealValue", () => {
  it("adds separators to bare digit runs", () => {
    expect(formatDealValue("1250000")).toBe("1,250,000");
    expect(formatDealValue("$43400000")).toBe("$43,400,000");
  });

  it("leaves short numbers and years alone", () => {
    expect(formatDealValue("2028")).toBe("2028");
    expect(formatDealValue("45%")).toBe("45%");
    expect(formatDealValue("$11.5B")).toBe("$11.5B");
  });

  it("leaves already-formatted values untouched", () => {
    expect(formatDealValue("$4,300,000")).toBe("$4,300,000");
  });

  it("does not dress up a stringified container", () => {
    // Ingest used to str() a nested LLM value into the field; separators
    // made the leaked repr read like a real figure. Show it verbatim.
    expect(formatDealValue("{'$sum': '11500000000'}")).toBe(
      "{'$sum': '11500000000'}"
    );
    expect(formatDealValue("['500000000', '7000000000']")).toBe(
      "['500000000', '7000000000']"
    );
  });
});
