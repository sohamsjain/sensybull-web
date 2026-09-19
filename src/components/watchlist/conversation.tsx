"use client";

import { useState, useRef, useLayoutEffect, useMemo } from "react";

import type { WatchlistEntry } from "@/types/api";
import type { FilingEvent } from "@/types/events";
import { dayLabel } from "@/lib/utils";
import { displayCompanyName } from "@/lib/company-name";
import { fundamentalsHref, NEW_TAB } from "@/lib/fundamentals/links";
import { usePinnedCompanies } from "@/hooks/use-pinned-companies";
import { useQuote } from "@/hooks/use-quote";
import { PriceChart } from "@/components/company/price-chart";
import { StockQuote } from "@/components/company/stock-quote";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { IconButton } from "@/components/ui/icon-button";
import {
  ChartIcon,
  ChevronLeftIcon,
  DocumentIcon,
  MoreIcon,
  MutedIcon,
  TimelineIcon,
} from "@/components/ui/icons";
import { Skeleton } from "@/components/ui/skeleton";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/ui/dropdown-menu";

import { CompanyAvatar } from "./company-avatar";
import { FilingMessage } from "./filing-message";

interface ConversationProps {
  entry: WatchlistEntry;
  events: FilingEvent[]; // newest first
  loading: boolean;
  hasMore: boolean;
  onLoadEarlier: () => void;
  onBack: () => void;
  onToggleMute: () => void;
  onRemove: () => void;
}

/** Day divider between entries: a rule with a date on it, nothing more. */
function DayDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3 px-4 py-2">
      <span className="h-px flex-1 bg-line-subtle" />
      <span className="eyebrow">{label}</span>
      <span className="h-px flex-1 bg-line-subtle" />
    </div>
  );
}

/**
 * A company's filing history — the reading surface of the product. The
 * header carries identity and live price; everything below is the record,
 * oldest to newest, with the newest in view.
 */
export function Conversation({
  entry,
  events,
  loading,
  hasMore,
  onLoadEarlier,
  onBack,
  onToggleMute,
  onRemove,
}: ConversationProps) {
  const { company, muted } = entry;
  const name = displayCompanyName(company.name);
  const { pinned, togglePin } = usePinnedCompanies();
  const isPinned = pinned.has(company.id);
  const [confirmRemove, setConfirmRemove] = useState(false);
  const [view, setView] = useState<"messages" | "chart">("messages");
  // Switching companies always lands back on messages (adjust during render)
  const [viewCompanyId, setViewCompanyId] = useState(company.id);
  if (viewCompanyId !== company.id) {
    setViewCompanyId(company.id);
    setView("messages");
  }
  // Live price beside the name — only tickered companies have one
  const { quote, state: quoteState } = useQuote(
    company.ticker ? company.id : null
  );
  const scrollRef = useRef<HTMLDivElement>(null);
  const loadingEarlierRef = useRef(false);
  const prevHeightRef = useRef(0);
  const newestIdRef = useRef<string | null>(null);
  const companyIdRef = useRef(company.id);

  // Chronological for display: oldest at top, newest at bottom
  const ordered = useMemo(() => [...events].reverse(), [events]);

  // Scroll handling: bottom on open/new message, preserve position on load-earlier
  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    // Switching companies invalidates any in-flight load-earlier scroll
    // adjustment; always land at the bottom of the new conversation.
    if (companyIdRef.current !== company.id) {
      companyIdRef.current = company.id;
      loadingEarlierRef.current = false;
      newestIdRef.current = null;
    }
    if (loadingEarlierRef.current) {
      el.scrollTop += el.scrollHeight - prevHeightRef.current;
      loadingEarlierRef.current = false;
      return;
    }
    const newestId = events[0]?.id ?? null;
    if (newestId !== newestIdRef.current) {
      newestIdRef.current = newestId;
      el.scrollTop = el.scrollHeight;
    }
  }, [events, company.id]);

  const handleLoadEarlier = () => {
    const el = scrollRef.current;
    if (el) {
      loadingEarlierRef.current = true;
      prevHeightRef.current = el.scrollHeight;
    }
    onLoadEarlier();
  };

  return (
    <div className="flex h-full min-w-0 flex-col">
      {/* Header */}
      <header className="flex h-14 shrink-0 items-center gap-2.5 border-b border-line-subtle bg-canvas px-3">
        <IconButton
          size="md"
          onClick={onBack}
          className="md:hidden"
          aria-label="Back to watchlist"
        >
          <ChevronLeftIcon />
        </IconButton>

        <CompanyAvatar
          ticker={company.ticker}
          name={name}
          size="sm"
          fallback="initials"
        />

        {/* Name and live price, nothing else: no ticker, no EDGAR link. The
            name opens the company's financials in a new tab. */}
        <div className="flex min-w-0 flex-1 items-baseline gap-2">
          {company.ticker ? (
            <a
              href={fundamentalsHref(company.ticker)}
              {...NEW_TAB}
              className="min-w-0 truncate text-label leading-tight font-medium text-ink transition-colors hover:text-brand-ink"
              title={`${name} financials (opens in a new tab)`}
            >
              {name}
            </a>
          ) : (
            <p className="min-w-0 truncate text-label leading-tight font-medium text-ink">
              {name}
            </p>
          )}
          {/* Price sits beside the name; the name truncates before it does */}
          {company.ticker && (
            <StockQuote quote={quote} loading={quoteState === "loading"} />
          )}
        </div>

        {muted && (
          <MutedIcon
            className="size-3.5 shrink-0 text-ink-faint"
            aria-label="Alerts muted"
          />
        )}

        {company.ticker && (
          <IconButton
            active={view === "chart"}
            onClick={() => setView((v) => (v === "chart" ? "messages" : "chart"))}
            aria-label={view === "chart" ? "Back to filings" : "Show price chart"}
            title={view === "chart" ? "Back to filings" : "Show price chart"}
          >
            {view === "chart" ? <TimelineIcon /> : <ChartIcon />}
          </IconButton>
        )}

        {confirmRemove ? (
          <span className="flex shrink-0 items-center gap-1.5">
            <span className="hidden text-meta text-ink-muted sm:inline">
              Remove from watchlist?
            </span>
            <Button
              size="xs"
              variant="destructive"
              onClick={() => {
                setConfirmRemove(false);
                onRemove();
              }}
            >
              Remove
            </Button>
            <Button
              size="xs"
              variant="ghost"
              onClick={() => setConfirmRemove(false)}
            >
              Cancel
            </Button>
          </span>
        ) : (
          <DropdownMenu>
            <DropdownMenuTrigger
              render={<IconButton aria-label="Company options" title="Company options" />}
            >
              <MoreIcon />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-48">
              <DropdownMenuItem onClick={() => togglePin(company.id)}>
                {isPinned ? "Unpin company" : "Pin company"}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={onToggleMute}>
                {muted ? "Unmute alerts" : "Mute alerts"}
              </DropdownMenuItem>
              <DropdownMenuItem
                variant="destructive"
                onClick={() => setConfirmRemove(true)}
              >
                Remove from watchlist
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        )}
      </header>

      {/* Full-pane price chart, toggled from the header */}
      {view === "chart" && (
        <div className="min-h-0 flex-1 px-4 py-3">
          {/* No ticker: the header already names the company, and the
              watchlist shows no ticker symbols anywhere. */}
          <PriceChart companyId={company.id} events={events} fill />
        </div>
      )}

      {/* Filing history */}
      <div
        ref={scrollRef}
        className={`flex-1 overflow-y-auto ${view === "chart" ? "hidden" : ""}`}
      >
        <div className="mx-auto w-full max-w-3xl">
          {hasMore && (
            <div className="flex justify-center py-2">
              <Button
                size="xs"
                variant="ghost"
                onClick={handleLoadEarlier}
                disabled={loading}
              >
                {loading ? "Loading…" : "Load earlier filings"}
              </Button>
            </div>
          )}

          {loading && events.length === 0 ? (
            <div className="space-y-3 px-4 py-4">
              {[...Array(3)].map((_, i) => (
                <Skeleton key={i} className="h-16" />
              ))}
            </div>
          ) : ordered.length === 0 ? (
            <EmptyState
              icon={DocumentIcon}
              className="pt-16"
              title="Nothing filed yet"
              description={`The moment ${name} files with the SEC or puts out a press release, the briefing lands here — usually within minutes. You don't need to refresh.`}
            />
          ) : (
            ordered.map((event, i) => {
              const ts = event.received_at || event.filing_date || "";
              const prevTs =
                i > 0
                  ? ordered[i - 1].received_at || ordered[i - 1].filing_date || ""
                  : null;
              const showDay = !prevTs || (ts && dayLabel(ts) !== dayLabel(prevTs));
              return (
                <div key={event.id}>
                  {showDay && ts && <DayDivider label={dayLabel(ts)} />}
                  <FilingMessage event={event} />
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
