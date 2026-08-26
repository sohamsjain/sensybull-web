const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const ACCESS_KEY = "access_token";
/**
 * Marks that this browser has (or had) a refresh cookie. The refresh token is
 * httpOnly, so JavaScript cannot see whether a session exists — without this
 * flag every guest page load would fire a doomed `/auth/refresh`. Set on every
 * successful sign-in, cleared only when the server actually rejects the
 * session.
 */
const SESSION_KEY = "sensybull:session";

/** Refresh this many ms before the access token's own `exp`. */
const REFRESH_SKEW_MS = 60_000;

// Only the short-lived access token is kept client-side (used as a bearer
// header). The refresh token lives in an httpOnly cookie the browser sends
// automatically to /auth/* — it is never readable by JavaScript. The cookie
// outlives the access token by a long way, so a missing or expired access
// token means "refresh", never "signed out".
export function getTokens(): { access: string | null } {
  if (typeof window === "undefined") return { access: null };
  return { access: localStorage.getItem(ACCESS_KEY) };
}

export function setTokens(access: string | null): void {
  if (typeof window === "undefined") return;
  if (access) {
    localStorage.setItem(ACCESS_KEY, access);
    localStorage.setItem(SESSION_KEY, "1");
  } else {
    localStorage.removeItem(ACCESS_KEY);
  }
  notifyTokenChange(access);
}

export function clearTokens(): void {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ACCESS_KEY);
  localStorage.removeItem(SESSION_KEY);
  // Clean up any refresh token persisted before the httpOnly-cookie migration.
  localStorage.removeItem("refresh_token");
  notifyTokenChange(null);
}

/**
 * Whether this browser believes it holds a refresh cookie. True across
 * restarts and after the access token has expired — that is the whole point.
 */
export function hasSession(): boolean {
  if (typeof window === "undefined") return false;
  return (
    localStorage.getItem(SESSION_KEY) === "1" ||
    localStorage.getItem(ACCESS_KEY) !== null
  );
}

/* ------------------------------------------------------------------ *
 * Token change subscribers (the socket re-auths on a refreshed token)
 * ------------------------------------------------------------------ */

type TokenListener = (access: string | null) => void;
const tokenListeners = new Set<TokenListener>();

export function onTokenChange(fn: TokenListener): () => void {
  tokenListeners.add(fn);
  return () => {
    tokenListeners.delete(fn);
  };
}

function notifyTokenChange(access: string | null): void {
  for (const fn of tokenListeners) {
    try {
      fn(access);
    } catch {
      // A bad subscriber must never break an API call.
    }
  }
}

/* ------------------------------------------------------------------ *
 * Refresh
 * ------------------------------------------------------------------ */

/** Read a non-httpOnly cookie (the CSRF double-submit token for refresh/logout). */
function readCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const escaped = name.replace(/([.*+?^${}()|[\]\\])/g, "\\$1");
  const match = document.cookie.match(new RegExp("(?:^|; )" + escaped + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function csrfHeaders(): Record<string, string> {
  const csrf = readCookie("csrf_refresh_token");
  return csrf ? { "X-CSRF-TOKEN": csrf } : {};
}

/** `exp` of a JWT in ms, or null when it can't be read. */
function expiryOf(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = JSON.parse(json)?.exp;
    return typeof exp === "number" ? exp * 1000 : null;
  } catch {
    return null;
  }
}

/** True when the token is missing, unreadable-but-absent, or about to expire. */
function isExpired(token: string | null): boolean {
  if (!token) return true;
  const exp = expiryOf(token);
  if (exp === null) return false; // Unreadable: let the 401 path decide.
  return Date.now() >= exp - REFRESH_SKEW_MS;
}

// One refresh at a time. Without this, a page load whose access token has just
// expired fires a dozen parallel `/auth/refresh` calls; with refresh-token
// rotation all but one send an already-rotated token, get a 401, and tear down
// a session that was in fact perfectly valid.
let inFlightRefresh: Promise<string | null> | null = null;

async function doRefresh(): Promise<string | null> {
  let res: Response;
  try {
    res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...csrfHeaders(),
      },
    });
  } catch {
    // Offline or DNS failure — the session is not known to be bad, so keep it.
    return null;
  }

  if (!res.ok) {
    // Only a definitive rejection ends the session. A 429 or a 5xx is the
    // server having a bad minute; wiping the session over it is what makes
    // people sign in again the next morning.
    if (res.status === 401 || res.status === 403 || res.status === 422) {
      clearTokens();
    }
    return null;
  }

  const data = await res.json().catch(() => null);
  const token: string | null = data?.access_token ?? null;
  if (!token) return null;
  setTokens(token);
  return token;
}

/** Exchange the refresh cookie for a new access token (single-flight). */
export function refreshAccessToken(): Promise<string | null> {
  if (!inFlightRefresh) {
    inFlightRefresh = doRefresh().finally(() => {
      inFlightRefresh = null;
    });
  }
  return inFlightRefresh;
}

/**
 * The access token to send with the next request: the stored one while it is
 * still good, otherwise a freshly minted one. Returns null for a genuine guest.
 */
async function currentAccessToken(): Promise<string | null> {
  const { access } = getTokens();
  if (!isExpired(access)) return access;
  if (!hasSession()) return null;
  return (await refreshAccessToken()) ?? access;
}

/**
 * Restore a signed-in session on boot. The access token is short-lived and the
 * refresh cookie is not, so an absent or stale access token after a night away
 * is the normal case, not a logout.
 */
export async function restoreSession(): Promise<string | null> {
  if (!hasSession()) return null;
  return currentAccessToken();
}

/** Revoke the refresh token server-side and clear the local access token. */
export async function logout(): Promise<void> {
  try {
    await fetch(`${API_URL}/auth/logout`, {
      method: "POST",
      credentials: "include",
      headers: {
        "Content-Type": "application/json",
        ...csrfHeaders(),
      },
    });
  } catch {
    // Best-effort — clear local state regardless.
  }
  clearTokens();
}

/* ------------------------------------------------------------------ *
 * Requests
 * ------------------------------------------------------------------ */

async function request(path: string, options: RequestInit): Promise<Response> {
  const access = await currentAccessToken();
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string>),
  };
  if (access) headers["Authorization"] = `Bearer ${access}`;

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
    credentials: "include",
  });

  // A 401 despite a token we believed good (clock skew, a token revoked
  // server-side, an `exp` we couldn't parse): try the cookie once more.
  if (res.status === 401 && hasSession()) {
    const newToken = await refreshAccessToken();
    if (newToken) {
      headers["Authorization"] = `Bearer ${newToken}`;
      return fetch(`${API_URL}${path}`, {
        ...options,
        headers,
        credentials: "include",
      });
    }
  }

  return res;
}

export async function api<T>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  const res = await request(path, options);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(data.error || `Request failed (${res.status})`);
  }
  return data as T;
}

/** Raw fetch with auto-refresh — returns the Response object */
export async function apiRaw(
  path: string,
  options: RequestInit = {}
): Promise<Response> {
  return request(path, options);
}
