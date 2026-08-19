"use client";

import { useAlertNotifications } from "@/hooks/use-alerts";
import { timeAgo } from "@/lib/utils";
import { toCurrentCategory } from "@/lib/event-categories";

const STATUS_STYLES: Record<string, string> = {
  sent: "bg-green-500/15 text-green-400",
  pending: "bg-amber-500/15 text-amber-400",
  failed: "bg-red-500/15 text-red-400",
};

export function NotificationList() {
  const { notifications, total, page, loading, goToPage } =
    useAlertNotifications();

  const totalPages = Math.ceil(total / 20);

  if (loading && notifications.length === 0) {
    return (
      <div className="bg-slate-100 dark:bg-[#14161c] border border-slate-200 dark:border-white/[0.06] rounded-lg p-6">
        <div className="animate-pulse space-y-3">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="h-16 bg-slate-200 dark:bg-white/[0.06] rounded" />
          ))}
        </div>
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <div className="bg-slate-100 dark:bg-[#14161c] border border-slate-200 dark:border-white/[0.06] rounded-lg p-8 text-center">
        <p className="text-slate-500 dark:text-slate-400 text-sm">No notifications yet.</p>
        <p className="text-slate-400 dark:text-slate-500 text-xs mt-1">
          Notifications will appear here when filing events trigger your alerts.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-slate-100 dark:bg-[#14161c] border border-slate-200 dark:border-white/[0.06] rounded-lg overflow-hidden">
      <div className="divide-y divide-slate-200 dark:divide-white/[0.06]">
        {notifications.map((n) => {
          const important = n.filing_event.max_tier === 1;

          return (
            <div
              key={n.id}
              className="px-4 py-3 hover:bg-slate-750 transition-colors"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-slate-900 dark:text-white text-sm font-medium">
                      {n.filing_event.ticker}
                    </span>
                    {important && (
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold text-red-600/80 dark:text-red-400/80">
                        IMPORTANT
                      </span>
                    )}
                    <span
                      className={`px-1.5 py-0.5 rounded text-[10px] font-medium ${
                        STATUS_STYLES[n.status] || STATUS_STYLES.pending
                      }`}
                    >
                      {n.status}
                    </span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 text-xs truncate">
                    {n.filing_event.company_name}
                    {n.filing_event.event_types?.length > 0 &&
                      ` — ${[
                        ...new Set(
                          n.filing_event.event_types.map(toCurrentCategory)
                        ),
                      ].join(", ")}`}
                  </p>
                  {n.error_message && (
                    <p className="text-red-400/70 text-xs mt-1">
                      {n.error_message}
                    </p>
                  )}
                </div>
                <div className="text-right shrink-0">
                  <span className="text-slate-400 dark:text-slate-500 text-xs capitalize">
                    {n.channel}
                  </span>
                  <p className="text-slate-400 dark:text-slate-600 text-xs mt-0.5">
                    {timeAgo(n.sent_at || n.created_at)}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 py-3 border-t border-slate-200 dark:border-white/[0.06] flex items-center justify-between">
          <span className="text-slate-400 dark:text-slate-500 text-xs">
            {total} notification{total !== 1 ? "s" : ""}
          </span>
          <div className="flex gap-1">
            <button
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || loading}
              className="px-2.5 py-1 rounded text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Prev
            </button>
            <span className="px-2 py-1 text-xs text-slate-400 dark:text-slate-500">
              {page} / {totalPages}
            </span>
            <button
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || loading}
              className="px-2.5 py-1 rounded text-xs text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-white/[0.06] disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
