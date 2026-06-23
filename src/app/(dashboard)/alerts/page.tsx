"use client";

import { useAuth } from "@/hooks/use-auth";
import { AlertPreferencesPanel } from "@/components/alerts/alert-preferences";
import { NotificationList } from "@/components/alerts/notification-list";
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
    <div className="h-full overflow-y-auto p-6 space-y-6 max-w-2xl mx-auto">
      <div>
        <h1 className="text-slate-900 dark:text-white text-lg font-semibold">Alerts</h1>
        <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
          Manage your alert preferences and view notification history.
        </p>
      </div>

      <AlertPreferencesPanel />

      <div>
        <h2 className="text-slate-600 dark:text-slate-300 text-sm font-medium mb-3">
          Notification History
        </h2>
        <NotificationList />
      </div>
    </div>
  );
}
