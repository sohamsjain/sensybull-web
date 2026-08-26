"use client";

import { useAlertNotifications } from "@/hooks/use-alerts";
import { timeAgo } from "@/lib/utils";
import { displayCompanyName } from "@/lib/company-name";
import { Badge, ImportantMarker } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { Table, TD, TH, THead, TR } from "@/components/ui/data-table";
import { Skeleton } from "@/components/ui/skeleton";

const STATUS_TONE = {
  sent: "success",
  pending: "warning",
  failed: "danger",
} as const;

/**
 * What was sent, where, and whether it arrived. Genuinely tabular data, so
 * it is a table: aligned columns, a sticky header, and one row per delivery.
 */
export function NotificationList() {
  const { notifications, total, page, loading, goToPage } =
    useAlertNotifications();

  const totalPages = Math.ceil(total / 20);

  if (loading && notifications.length === 0) {
    return (
      <div className="space-y-2">
        {[...Array(5)].map((_, i) => (
          <Skeleton key={i} className="h-9" />
        ))}
      </div>
    );
  }

  if (notifications.length === 0) {
    return (
      <EmptyState
        align="start"
        className="px-0 py-6"
        title="No notifications yet"
        description="Deliveries appear here once a filing from a company you follow matches your alert settings."
      />
    );
  }

  return (
    <div>
      <Table>
        <THead>
          <tr>
            <TH>Company</TH>
            <TH>Channel</TH>
            <TH>Status</TH>
            <TH numeric>Sent</TH>
          </tr>
        </THead>
        <tbody>
          {notifications.map((n) => {
            const important = n.filing_event.max_tier === 1;
            const tone =
              STATUS_TONE[n.status as keyof typeof STATUS_TONE] ?? "warning";
            return (
              <TR key={n.id}>
                <TD className="text-ink">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-label font-semibold">
                      {n.filing_event.ticker}
                    </span>
                    {important && <ImportantMarker />}
                  </div>
                  <p className="mt-0.5 truncate text-meta text-ink-faint">
                    {displayCompanyName(n.filing_event.company_name)}
                    {n.filing_event.event_types?.length > 0 &&
                      ` — ${n.filing_event.event_types.join(", ")}`}
                  </p>
                  {n.error_message && (
                    <p className="mt-0.5 text-meta text-danger">
                      {n.error_message}
                    </p>
                  )}
                </TD>
                <TD className="capitalize">{n.channel}</TD>
                <TD>
                  <Badge tone={tone} className="capitalize">
                    {n.status}
                  </Badge>
                </TD>
                <TD numeric className="whitespace-nowrap text-ink-faint">
                  {timeAgo(n.sent_at || n.created_at)}
                </TD>
              </TR>
            );
          })}
        </tbody>
      </Table>

      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-3">
          <span className="text-meta text-ink-faint tabular-nums">
            {total} notification{total !== 1 ? "s" : ""}
          </span>
          <div className="flex items-center gap-1">
            <Button
              size="xs"
              variant="ghost"
              onClick={() => goToPage(page - 1)}
              disabled={page <= 1 || loading}
            >
              Previous
            </Button>
            <span className="px-1 text-meta text-ink-faint tabular-nums">
              {page} / {totalPages}
            </span>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => goToPage(page + 1)}
              disabled={page >= totalPages || loading}
            >
              Next
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
