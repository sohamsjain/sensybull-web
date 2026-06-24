"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useRouter } from "next/navigation";

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
const GOOGLE_BUTTON_MAX_WIDTH = 400;

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

      const width = Math.min(
        Math.floor(containerRef.current.offsetWidth),
        GOOGLE_BUTTON_MAX_WIDTH
      );
      if (width <= 0) return;

      buttonRef.current.style.width = `${width}px`;
      buttonRef.current.innerHTML = "";
      window.google?.accounts.id.renderButton(buttonRef.current, {
        theme: "filled_black",
        size: "large",
        width,
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
    <div ref={containerRef} className="w-full flex justify-center">
      <div
        ref={buttonRef}
        className="overflow-hidden [&>div]:!w-full [&_iframe]:!w-full"
      />
    </div>
  );
}
