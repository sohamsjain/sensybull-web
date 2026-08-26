"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import {
  api,
  apiRaw,
  setTokens,
  clearTokens,
  hasSession,
  restoreSession,
  logout as apiLogout,
} from "@/lib/api-client";
import type { User, AuthResponse } from "@/types/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleAuth: (code: string) => Promise<void>;
  appleAuth: (idToken: string, user?: { firstName: string; lastName: string }) => Promise<void>;
  magicLinkRequest: (email: string) => Promise<void>;
  magicLinkVerify: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

/** How often a visible tab checks whether its access token needs renewing. */
const KEEPALIVE_MS = 10 * 60 * 1000;

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    // No session marker means a genuine guest — don't spend a refresh on them.
    if (!hasSession()) {
      setLoading(false);
      return;
    }
    // The access token is short-lived; the refresh cookie is not. An absent or
    // stale access token on boot is the normal case after time away, so mint a
    // new one from the cookie before deciding anything about the user.
    await restoreSession();
    try {
      const res = await apiRaw("/auth/me");
      if (res.ok) {
        const data = (await res.json()) as { user: User };
        setUser(data.user);
      } else if (res.status === 401 || res.status === 403) {
        // The server has actually rejected us — this is a real sign-out.
        clearTokens();
      }
      // Anything else (429, 5xx) is transient: stay signed out for this load
      // but keep the session so the next one picks it back up.
    } catch {
      // Offline. Same reasoning — never destroy a session over a failed fetch.
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  // Keep the session warm. `restoreSession()` is a no-op while the access
  // token is still good, so this only reaches the network when the token is
  // about to expire — which is what keeps a tab left open overnight, and the
  // socket it holds, authenticated in the morning.
  useEffect(() => {
    if (!user) return;

    const tick = () => {
      if (document.visibilityState === "visible") void restoreSession();
    };
    const timer = setInterval(tick, KEEPALIVE_MS);
    document.addEventListener("visibilitychange", tick);

    return () => {
      clearInterval(timer);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [user]);

  const login = async (email: string, password: string) => {
    const data = await api<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setTokens(data.access_token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setTokens(data.access_token);
    setUser(data.user);
  };

  const googleAuth = async (code: string) => {
    const data = await api<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ code }),
    });
    setTokens(data.access_token);
    setUser(data.user);
  };

  const appleAuth = async (idToken: string, user?: { firstName: string; lastName: string }) => {
    const data = await api<AuthResponse>("/auth/apple", {
      method: "POST",
      body: JSON.stringify({ id_token: idToken, user }),
    });
    setTokens(data.access_token);
    setUser(data.user);
  };

  const magicLinkRequest = async (email: string) => {
    await api("/auth/magic-link", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  };

  const magicLinkVerify = async (token: string) => {
    const data = await api<AuthResponse>("/auth/magic-link/verify", {
      method: "POST",
      body: JSON.stringify({ token }),
    });
    setTokens(data.access_token);
    setUser(data.user);
  };

  const logout = () => {
    // Revoke the refresh token server-side (best-effort) and clear local state.
    void apiLogout();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, googleAuth, appleAuth, magicLinkRequest, magicLinkVerify, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
