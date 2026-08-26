import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

// The module reads env + browser globals at import time, so each test gets a
// fresh copy via dynamic import after the shims are in place.
type ApiClient = typeof import("@/lib/api-client");

const store = new Map<string, string>();

function stubBrowser(cookie = "csrf_refresh_token=csrf-1") {
  store.clear();
  vi.stubGlobal("localStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
    removeItem: (k: string) => void store.delete(k),
  });
  vi.stubGlobal("window", {});
  vi.stubGlobal("document", { cookie });
}

/** A JWT-shaped token whose `exp` is `secondsFromNow` away. */
function jwt(secondsFromNow: number): string {
  const payload = btoa(
    JSON.stringify({ exp: Math.floor(Date.now() / 1000) + secondsFromNow })
  );
  return `header.${payload}.sig`;
}

async function load(): Promise<ApiClient> {
  vi.resetModules();
  return import("@/lib/api-client");
}

function json(body: unknown, status = 200): Response {
  return {
    ok: status >= 200 && status < 300,
    status,
    json: async () => body,
  } as Response;
}

beforeEach(() => stubBrowser());
afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("session persistence", () => {
  it("refreshes on boot when only the refresh cookie survives", async () => {
    // The access token is gone (expired storage, a cleared tab), but the
    // browser was signed in — the httpOnly cookie should carry the session.
    store.set("sensybull:session", "1");

    const fetchMock = vi.fn(async (url: string, _init?: RequestInit) =>
      String(url).endsWith("/auth/refresh")
        ? json({ access_token: jwt(3600) })
        : json({})
    );
    vi.stubGlobal("fetch", fetchMock);

    const { restoreSession, getTokens } = await load();
    const token = await restoreSession();

    expect(token).not.toBeNull();
    expect(getTokens().access).toBe(token);
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it("does not refresh for a browser that was never signed in", async () => {
    const fetchMock = vi.fn(async () => json({}));
    vi.stubGlobal("fetch", fetchMock);

    const { restoreSession } = await load();

    expect(await restoreSession()).toBeNull();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("collapses concurrent refreshes into one request", async () => {
    // Parallel page-load requests all hitting an expired token must not race:
    // with token rotation the losers would be rejected and end the session.
    store.set("sensybull:session", "1");
    store.set("access_token", jwt(-10));

    const fetchMock = vi.fn(async (url: string, _init?: RequestInit) =>
      String(url).endsWith("/auth/refresh")
        ? json({ access_token: jwt(3600) })
        : json({ ok: true })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { api } = await load();
    await Promise.all([api("/a"), api("/b"), api("/c")]);

    const refreshes = fetchMock.mock.calls.filter(([url]) =>
      String(url).endsWith("/auth/refresh")
    );
    expect(refreshes).toHaveLength(1);
  });

  it("keeps the session when a refresh fails transiently", async () => {
    store.set("sensybull:session", "1");
    store.set("access_token", jwt(-10));

    vi.stubGlobal(
      "fetch",
      vi.fn(async (url: string, _init?: RequestInit) =>
        String(url).endsWith("/auth/refresh")
          ? json({ error: "rate limited" }, 429)
          : json({})
      )
    );

    const { refreshAccessToken, hasSession } = await load();

    expect(await refreshAccessToken()).toBeNull();
    expect(hasSession()).toBe(true);
  });

  it("keeps the session when the network is down", async () => {
    store.set("sensybull:session", "1");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => {
        throw new TypeError("Failed to fetch");
      })
    );

    const { refreshAccessToken, hasSession } = await load();

    expect(await refreshAccessToken()).toBeNull();
    expect(hasSession()).toBe(true);
  });

  it("ends the session only when the server rejects the refresh token", async () => {
    store.set("sensybull:session", "1");
    vi.stubGlobal(
      "fetch",
      vi.fn(async () => json({ error: "expired" }, 401))
    );

    const { refreshAccessToken, hasSession } = await load();

    expect(await refreshAccessToken()).toBeNull();
    expect(hasSession()).toBe(false);
  });

  it("sends the CSRF header read from the cookie", async () => {
    store.set("sensybull:session", "1");
    const fetchMock = vi.fn(async (_url: string, _init?: RequestInit) =>
      json({ access_token: jwt(3600) })
    );
    vi.stubGlobal("fetch", fetchMock);

    const { refreshAccessToken } = await load();
    await refreshAccessToken();

    const init = fetchMock.mock.calls[0][1] as RequestInit;
    expect((init.headers as Record<string, string>)["X-CSRF-TOKEN"]).toBe("csrf-1");
    expect(init.credentials).toBe("include");
  });

  it("renews a token that is about to expire before using it", async () => {
    // Inside the skew window: renew first rather than spend a 401 finding out.
    store.set("sensybull:session", "1");
    store.set("access_token", jwt(30));

    const fresh = jwt(3600);
    const fetchMock = vi.fn(async (url: string, _init?: RequestInit) =>
      String(url).endsWith("/auth/refresh")
        ? json({ access_token: fresh })
        : json({})
    );
    vi.stubGlobal("fetch", fetchMock);

    const { api } = await load();
    await api("/events/");

    const call = fetchMock.mock.calls.find(([url]) =>
      String(url).endsWith("/events/")
    );
    const headers = (call?.[1] as RequestInit).headers as Record<string, string>;
    expect(headers["Authorization"]).toBe(`Bearer ${fresh}`);
  });

  it("retries a 401 once with a freshly minted token", async () => {
    store.set("sensybull:session", "1");
    store.set("access_token", jwt(3600)); // Looks fine; server disagrees.

    const fresh = jwt(7200);
    let firstAttempt = true;
    const fetchMock = vi.fn(async (url: string, _init?: RequestInit) => {
      if (String(url).endsWith("/auth/refresh")) {
        return json({ access_token: fresh });
      }
      if (firstAttempt) {
        firstAttempt = false;
        return json({ error: "token revoked" }, 401);
      }
      return json({ user: { id: 1 } });
    });
    vi.stubGlobal("fetch", fetchMock);

    const { api } = await load();

    await expect(api<{ user: { id: number } }>("/auth/me")).resolves.toEqual({
      user: { id: 1 },
    });
  });

  it("notifies subscribers so the socket can re-authenticate", async () => {
    const { onTokenChange, setTokens } = await load();
    const seen: (string | null)[] = [];
    const off = onTokenChange((t) => seen.push(t));

    setTokens("abc");
    off();
    setTokens("def");

    expect(seen).toEqual(["abc"]);
  });
});
