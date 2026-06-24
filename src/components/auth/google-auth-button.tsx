"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;

declare global {
  interface Window {
    google?: {
      accounts: {
        oauth2: {
          initCodeClient: (
            config: Record<string, unknown>
          ) => { requestCode: () => void };
        };
      };
    };
  }
}

export function GoogleAuthButton() {
  const { googleAuth } = useAuth();
  const router = useRouter();
  const clientRef = useRef<{ requestCode: () => void } | null>(null);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCodeResponse = useCallback(
    async (response: { code: string }) => {
      setLoading(true);
      setError("");
      try {
        await googleAuth(response.code);
        router.push("/chats");
      } catch (err) {
        setError(
          err instanceof Error ? err.message : "Google sign-in failed"
        );
      }
      setLoading(false);
    },
    [googleAuth, router]
  );

  useEffect(() => {
    if (!GOOGLE_CLIENT_ID) return;

    const script = document.createElement("script");
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      clientRef.current =
        window.google?.accounts.oauth2.initCodeClient({
          client_id: GOOGLE_CLIENT_ID,
          scope: "openid email profile",
          ux_mode: "popup",
          callback: handleCodeResponse,
        }) ?? null;
      setReady(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [handleCodeResponse]);

  const handleClick = useCallback(() => {
    if (!ready || loading || !clientRef.current) return;
    clientRef.current.requestCode();
  }, [ready, loading]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={!ready || loading}
        className="flex items-center justify-center gap-2 w-full h-11 rounded-lg bg-white text-[#1f1f1f] text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24">
          <path
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z"
            fill="#4285F4"
          />
          <path
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            fill="#34A853"
          />
          <path
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            fill="#FBBC05"
          />
          <path
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            fill="#EA4335"
          />
        </svg>
        {loading ? "Signing in..." : "Continue with Google"}
      </button>
      {error && (
        <p className="text-red-400 text-sm mt-2 text-center">{error}</p>
      )}
    </div>
  );
}
