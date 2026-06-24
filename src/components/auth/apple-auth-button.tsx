"use client";

import { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

const APPLE_CLIENT_ID = process.env.NEXT_PUBLIC_APPLE_CLIENT_ID;

declare global {
  interface Window {
    AppleID?: {
      auth: {
        init: (config: Record<string, unknown>) => void;
        signIn: () => Promise<{
          authorization: { id_token: string; code: string };
          user?: { name?: { firstName?: string; lastName?: string }; email?: string };
        }>;
      };
    };
  }
}

export function AppleAuthButton() {
  const { appleAuth } = useAuth();
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!APPLE_CLIENT_ID) return;

    const script = document.createElement("script");
    script.src =
      "https://appleid.cdn-apple.com/appleauth/static/jsapi/appleid/1/en_US/appleid.auth.js";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      window.AppleID?.auth.init({
        clientId: APPLE_CLIENT_ID,
        scope: "name email",
        redirectURI: window.location.origin + "/login",
        usePopup: true,
      });
      setReady(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

  const handleClick = useCallback(async () => {
    if (!ready || loading) return;
    setError("");
    setLoading(true);
    try {
      const response = await window.AppleID!.auth.signIn();
      const idToken = response.authorization.id_token;
      const user = response.user
        ? {
            firstName: response.user.name?.firstName || "",
            lastName: response.user.name?.lastName || "",
          }
        : undefined;
      await appleAuth(idToken, user);
      router.push("/chats");
    } catch (err) {
      if (err && typeof err === "object" && "error" in err) {
        const appleErr = err as { error: string };
        if (appleErr.error === "popup_closed_by_user") {
          setLoading(false);
          return;
        }
      }
      setError(err instanceof Error ? err.message : "Apple sign-in failed");
    }
    setLoading(false);
  }, [ready, loading, appleAuth, router]);

  if (!APPLE_CLIENT_ID) return null;

  return (
    <div className="w-full">
      <button
        type="button"
        onClick={handleClick}
        disabled={!ready || loading}
        className="flex items-center justify-center gap-2 w-full h-11 rounded-lg bg-white text-black text-sm font-medium hover:bg-white/90 transition-colors disabled:opacity-50"
      >
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
          <path d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
        </svg>
        {loading ? "Signing in..." : "Continue with Apple"}
      </button>
      {error && <p className="text-red-400 text-sm mt-2 text-center">{error}</p>}
    </div>
  );
}
