import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearPendingAction,
  getPendingAction,
  isSafeInternalPath,
  resolvePostAuthPath,
  setPendingAction,
} from "@/lib/pending-action";

// Minimal browser shims — the module only touches localStorage and
// window.location.search.
function stubBrowser(search = "") {
  const store = new Map<string, string>();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
  vi.stubGlobal("window", { location: { search } });
}

beforeEach(() => stubBrowser());
afterEach(() => vi.unstubAllGlobals());

const action = {
  type: "add_watchlist" as const,
  params: { symbol: "MU" },
  attribution: { ref: "substack" },
  resumePath: "/add/MU?ref=substack",
};

describe("pending action store", () => {
  it("round-trips an action", () => {
    setPendingAction(action);
    const stored = getPendingAction();
    expect(stored?.type).toBe("add_watchlist");
    expect(stored?.params.symbol).toBe("MU");
    expect(stored?.attribution?.ref).toBe("substack");
  });

  it("clears on demand", () => {
    setPendingAction(action);
    clearPendingAction();
    expect(getPendingAction()).toBeNull();
  });

  it("refuses unsafe resume paths", () => {
    setPendingAction({ ...action, resumePath: "https://evil.example/add/MU" });
    expect(getPendingAction()).toBeNull();
    setPendingAction({ ...action, resumePath: "//evil.example" });
    expect(getPendingAction()).toBeNull();
  });

  it("expires stale intents", () => {
    vi.useFakeTimers();
    setPendingAction(action);
    vi.setSystemTime(Date.now() + 2 * 60 * 60 * 1000);
    expect(getPendingAction()).toBeNull();
    vi.useRealTimers();
  });

  it("survives garbage in storage", () => {
    localStorage.setItem("sensybull:pending-action", "{not json");
    expect(getPendingAction()).toBeNull();
  });
});

describe("isSafeInternalPath", () => {
  it("accepts site-relative paths", () => {
    expect(isSafeInternalPath("/add/MU")).toBe(true);
    expect(isSafeInternalPath("/watchlist?c=1")).toBe(true);
  });

  it("rejects external and malformed targets", () => {
    expect(isSafeInternalPath("https://evil.example")).toBe(false);
    expect(isSafeInternalPath("//evil.example")).toBe(false);
    expect(isSafeInternalPath("/a\\b")).toBe(false);
    expect(isSafeInternalPath("javascript:alert(1)")).toBe(false);
    expect(isSafeInternalPath(null)).toBe(false);
  });
});

describe("resolvePostAuthPath", () => {
  it("prefers a safe ?next= param", () => {
    stubBrowser("?next=%2Fadd%2FMU");
    expect(resolvePostAuthPath("/watchlist")).toBe("/add/MU");
  });

  it("ignores an external ?next=", () => {
    stubBrowser("?next=https%3A%2F%2Fevil.example");
    expect(resolvePostAuthPath("/watchlist")).toBe("/watchlist");
  });

  it("falls back to the pending action's resume path", () => {
    stubBrowser("");
    setPendingAction(action);
    expect(resolvePostAuthPath("/watchlist")).toBe("/add/MU?ref=substack");
  });

  it("falls back to the default", () => {
    expect(resolvePostAuthPath("/feed")).toBe("/feed");
  });
});
