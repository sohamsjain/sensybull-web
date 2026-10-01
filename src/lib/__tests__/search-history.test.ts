import { describe, it, expect } from "vitest";
import { parseHistory, pushHistory, type SearchHistoryEntry } from "../search-history";

const e = (id: string): SearchHistoryEntry => ({ id, name: `Co ${id}`, ticker: id.toUpperCase() });

describe("pushHistory", () => {
  it("puts the newest first", () => {
    expect(pushHistory([e("a"), e("b")], e("c")).map((x) => x.id)).toEqual(["c", "a", "b"]);
  });

  it("moves a repeat to the front instead of duplicating it", () => {
    expect(pushHistory([e("a"), e("b"), e("c")], e("b")).map((x) => x.id)).toEqual(["b", "a", "c"]);
  });

  it("caps the list", () => {
    const list = ["a", "b", "c"].map(e);
    expect(pushHistory(list, e("d"), 3).map((x) => x.id)).toEqual(["d", "a", "b"]);
  });
});

describe("parseHistory", () => {
  it("reads malformed storage as empty", () => {
    expect(parseHistory("not json")).toEqual([]);
    expect(parseHistory('{"a":1}')).toEqual([]);
  });

  it("drops entries without a ticker", () => {
    const raw = JSON.stringify([e("a"), { id: "b", name: "B", ticker: "" }, null, 5]);
    expect(parseHistory(raw).map((x) => x.id)).toEqual(["a"]);
  });
});
