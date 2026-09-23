"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";

/**
 * Sends a signed-in reader from the landing page to their watchlist.
 *
 * The landing page itself is server-rendered so crawlers and agents that
 * don't run JavaScript see it. For a browser that holds a session, the
 * inline script in `src/app/page.tsx` marks <html data-session> before the
 * page paints, and globals.css hides the landing while auth resolves — so a
 * returning reader never sees the marketing page flash. If the session turns
 * out to be dead, the mark comes off and the landing appears.
 */
export function SignedInRedirect() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (loading) return;
    if (user) {
      router.replace("/watchlist");
      return;
    }
    document.documentElement.removeAttribute("data-session");
  }, [user, loading, router]);

  return null;
}
