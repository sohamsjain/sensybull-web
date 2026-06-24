"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_BUTTON_API_MAX_WIDTH = 400;

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: Record<string, unknown>) => void;
          renderButton: (
            element: HTMLElement,
            config: Record<string, unknown>
          ) => void;
        };
      };
    };
  }
}

export function GoogleAuthButton() {
  const { googleAuth } = useAuth();
  const router = useRouter();
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLDivElement>(null);
  const [initialized, setInitialized] = useState(false);

  const handleCredentialResponse = useCallback(
    async (response: { credential: string }) => {
      try {
        await googleAuth(response.credential);
        router.push("/feed");
      } catch {
        // Error handled by auth context
      }
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
      window.google?.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: handleCredentialResponse,
      });
      setInitialized(true);
    };
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, [handleCredentialResponse]);

  useEffect(() => {
    if (!initialized || !buttonRef.current || !containerRef.current) return;

    const renderGoogleButton = () => {
      if (!buttonRef.current || !containerRef.current) return;

      const containerWidth = Math.floor(containerRef.current.offsetWidth);
      if (containerWidth <= 0) return;

      buttonRef.current.innerHTML = "";
      window.google?.accounts.id.renderButton(buttonRef.current, {
        theme: "filled_black",
        size: "large",
        width: Math.min(containerWidth, GOOGLE_BUTTON_API_MAX_WIDTH),
        text: "continue_with",
      });
    };

    renderGoogleButton();

    const resizeObserver = new ResizeObserver(renderGoogleButton);
    resizeObserver.observe(containerRef.current);

    return () => resizeObserver.disconnect();
  }, [initialized]);

  if (!GOOGLE_CLIENT_ID) return null;

  return (
    <div ref={containerRef} className="w-full relative h-11">
      <div className="flex items-center justify-center gap-2 w-full h-11 rounded-lg bg-[#131314] border border-[#8e918f]/30 text-white/80 text-sm font-medium pointer-events-none">
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
        Continue with Google
      </div>
      <div
        ref={buttonRef}
        className="absolute inset-0 overflow-hidden rounded-lg opacity-0 cursor-pointer [&>div]:!w-full [&>div]:!h-full [&_iframe]:!w-full [&_iframe]:!h-full"
      />
    </div>
  );
}
