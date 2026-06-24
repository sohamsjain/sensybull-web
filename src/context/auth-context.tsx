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
  setTokens,
  clearTokens,
  getTokens,
} from "@/lib/api-client";
import type { User, AuthResponse, RefreshResponse } from "@/types/api";

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  googleAuth: (credential: string) => Promise<void>;
  magicLinkRequest: (email: string) => Promise<void>;
  magicLinkVerify: (token: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    const { access } = getTokens();
    if (!access) {
      setLoading(false);
      return;
    }
    try {
      const data = await api<{ user: User }>("/auth/me");
      setUser(data.user);
    } catch {
      clearTokens();
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchUser();
  }, [fetchUser]);

  const login = async (email: string, password: string) => {
    const data = await api<AuthResponse>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    setTokens(data.access_token, data.refresh_token);
    setUser(data.user);
  };

  const register = async (name: string, email: string, password: string) => {
    const data = await api<AuthResponse>("/auth/register", {
      method: "POST",
      body: JSON.stringify({ name, email, password }),
    });
    setTokens(data.access_token, data.refresh_token);
    setUser(data.user);
  };

  const googleAuth = async (credential: string) => {
    const data = await api<AuthResponse>("/auth/google", {
      method: "POST",
      body: JSON.stringify({ token: credential }),
    });
    setTokens(data.access_token, data.refresh_token);
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
    setTokens(data.access_token, data.refresh_token);
    setUser(data.user);
  };

  const logout = () => {
    clearTokens();
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, googleAuth, magicLinkRequest, magicLinkVerify, logout }}
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
