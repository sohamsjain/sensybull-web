"use client";

import { useAuth } from "@/hooks/use-auth";
import { AlertPreferencesPanel } from "@/components/alerts/alert-preferences";
import { NotificationList } from "@/components/alerts/notification-list";
import { Section } from "@/components/ui/section";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function AlertsPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [user, loading, router]);

  if (loading || !user) return null;

  return (
    <div className="h-full overflow-y-auto">
      <div className="mx-auto w-full max-w-2xl space-y-8 px-5 py-6">
        <AlertPreferencesPanel />

        <Section title="Delivery history">
          <NotificationList />
        </Section>
      </div>
    </div>
  );
}
