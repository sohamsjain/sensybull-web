import { describe, it, expect } from "vitest";
import {
  EMPTY_SELECTION,
  toggleSelection,
  selectAll,
  deselectAll,
  pruneSelection,
  allSelected,
  type SelectionState,
} from "../selection";

const IDS = ["a", "b", "c", "d", "e"];

/** Build a state directly, for tests that don't care how it was reached. */
function state(selected: string[], anchor: string | null = null): SelectionState {
  return { selected: new Set(selected), anchor };
}

const ids = (s: SelectionState) => [...s.selected].sort();

describe("toggleSelection", () => {
  it("adds an unselected id and sets the anchor", () => {
    const next = toggleSelection(EMPTY_SELECTION, "b", IDS);
    expect(ids(next)).toEqual(["b"]);
    expect(next.anchor).toBe("b");
  });

  it("removes an already-selected id", () => {
    const next = toggleSelection(state(["a", "b"], "a"), "b", IDS);
    expect(ids(next)).toEqual(["a"]);
  });

  it("does not mutate the previous state", () => {
    const prev = state(["a"], "a");
    toggleSelection(prev, "b", IDS);
    expect(ids(prev)).toEqual(["a"]);
  });

  it("shift-click selects the inclusive range forwards", () => {
    const next = toggleSelection(state(["b"], "b"), "d", IDS, true);
    expect(ids(next)).toEqual(["b", "c", "d"]);
    expect(next.anchor).toBe("d");
  });

  it("shift-click selects the inclusive range backwards", () => {
    const next = toggleSelection(state(["d"], "d"), "b", IDS, true);
    expect(ids(next)).toEqual(["b", "c", "d"]);
    expect(next.anchor).toBe("b");
  });

  it("shift-click keeps selections outside the range", () => {
    const next = toggleSelection(state(["a", "c"], "c"), "e", IDS, true);
    expect(ids(next)).toEqual(["a", "c", "d", "e"]);
  });

  it("shift-click extends from the id last clicked, not the original anchor", () => {
    let s = toggleSelection(EMPTY_SELECTION, "a", IDS);
    s = toggleSelection(s, "b", IDS, true); // a..b
    s = toggleSelection(s, "d", IDS, true); // b..d
    expect(ids(s)).toEqual(["a", "b", "c", "d"]);
  });

  it("shift-click never deselects — it only extends", () => {
    const next = toggleSelection(state(["a", "b", "c"], "c"), "a", IDS, true);
    expect(ids(next)).toEqual(["a", "b", "c"]);
  });

  it("falls back to a plain toggle with no anchor", () => {
    const next = toggleSelection(EMPTY_SELECTION, "d", IDS, true);
    expect(ids(next)).toEqual(["d"]);
  });

  it("falls back to a plain toggle when the anchor is filtered out of view", () => {
    // "a" is selected but no longer visible, so a range from it would select
    // rows the user cannot see.
    const visible = ["c", "d", "e"];
    const next = toggleSelection(state(["a"], "a"), "e", visible, true);
    expect(ids(next)).toEqual(["a", "e"]);
    expect(next.anchor).toBe("e");
  });

  it("ranges follow visible order, not the underlying list order", () => {
    const visible = ["e", "a", "c"];
    const next = toggleSelection(state(["e"], "e"), "c", visible, true);
    expect(ids(next)).toEqual(["a", "c", "e"]);
  });
});

describe("selectAll / deselectAll", () => {
  it("selects every visible id", () => {
    expect(ids(selectAll(EMPTY_SELECTION, IDS))).toEqual(IDS);
  });

  it("keeps selections that are not currently visible", () => {
    const next = selectAll(state(["z"]), ["a", "b"]);
    expect(ids(next)).toEqual(["a", "b", "z"]);
  });

  it("deselects only the visible ids", () => {
    const next = deselectAll(state(["a", "b", "z"]), ["a", "b"]);
    expect(ids(next)).toEqual(["z"]);
    expect(next.anchor).toBeNull();
  });
});

describe("pruneSelection", () => {
  it("drops ids that no longer exist", () => {
    expect(ids(pruneSelection(state(["a", "gone"]), IDS))).toEqual(["a"]);
  });

  it("returns the same object when nothing changed", () => {
    const prev = state(["a", "b"], "a");
    expect(pruneSelection(prev, IDS)).toBe(prev);
  });

  it("clears an anchor that was pruned away", () => {
    const next = pruneSelection(state(["a", "gone"], "gone"), IDS);
    expect(next.anchor).toBeNull();
  });

  it("keeps an anchor that survived", () => {
    expect(pruneSelection(state(["a", "gone"], "a"), IDS).anchor).toBe("a");
  });
});

describe("allSelected", () => {
  it("is true when every visible id is selected", () => {
    expect(allSelected(state(IDS), IDS)).toBe(true);
  });

  it("is false when one is missing", () => {
    expect(allSelected(state(["a", "b"]), IDS)).toBe(false);
  });

  it("is false for an empty list", () => {
    expect(allSelected(EMPTY_SELECTION, [])).toBe(false);
  });

  it("ignores selections outside the visible list", () => {
    expect(allSelected(state(["a", "z"]), ["a"])).toBe(true);
  });
});
