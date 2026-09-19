import { describe, expect, it } from "vitest";

import type { WatchlistEntry } from "@/types/api";
import { sortEntries } from "./use-watchlist-inbox";

function entry(id: string, at: string | null, unread = 0): WatchlistEntry {
  return {
    company: { id, name: id, ticker: id, cik: null },
    last_event: null,
    last_activity_at: at,
    unread_count: unread,
    muted: false,
    last_read_at: null,
  } as WatchlistEntry;
}

describe("sortEntries", () => {
  it("orders by last activity, newest first", () => {
    const sorted = sortEntries([
      entry("old", "2026-09-01T00:00:00Z"),
      entry("new", "2026-09-18T00:00:00Z"),
      entry("mid", "2026-09-10T00:00:00Z"),
    ]);
    expect(sorted.map((e) => e.company.id)).toEqual(["new", "mid", "old"]);
  });

  it("never lets unread state reorder the list", () => {
    // Opening (reading) a company must not sink it below quieter companies
    // with unread updates — the order is by time alone, like a chat list.
    const sorted = sortEntries([
      entry("read-recent", "2026-09-18T00:00:00Z", 0),
      entry("unread-old", "2026-09-01T00:00:00Z", 3),
    ]);
    expect(sorted.map((e) => e.company.id)).toEqual(["read-recent", "unread-old"]);
  });

  it("puts companies with no activity last", () => {
    const sorted = sortEntries([
      entry("none", null),
      entry("some", "2026-09-01T00:00:00Z"),
    ]);
    expect(sorted.map((e) => e.company.id)).toEqual(["some", "none"]);
  });

  it("does not mutate its input", () => {
    const input = [entry("a", "2026-09-01T00:00:00Z"), entry("b", "2026-09-02T00:00:00Z")];
    sortEntries(input);
    expect(input.map((e) => e.company.id)).toEqual(["a", "b"]);
  });
});
