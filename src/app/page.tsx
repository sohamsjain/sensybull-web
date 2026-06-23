"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import LandingPage from "@/components/landing/landing-page";

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [showLanding, setShowLanding] = useState(false);

  useEffect(() => {
    if (loading) return;

    if (user) {
      router.replace("/chats");
      return;
    }

    setShowLanding(true);
  }, [user, loading, router]);

  if (!showLanding) return null;

  return <LandingPage />;
}
