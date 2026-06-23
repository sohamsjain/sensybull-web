"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { getAppUrl, isAppSubdomain } from "@/lib/urls";
import LandingPage from "@/components/landing/landing-page";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (isAppSubdomain()) {
      router.replace(user ? "/chats" : "/feed");
      return;
    }

    if (user) {
      window.location.href = getAppUrl("/chats");
      return;
    }

    setShowLanding(true);
  }, [user, loading, router]);

  if (!showLanding) return null;

  return <LandingPage />;
}
