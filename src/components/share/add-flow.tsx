"use client";

/**
 * The /add/:symbol deep-link flow — the single execution point for the
 * "add_watchlist" pending action.
 *
 * Logged in:  add via idempotent POST /watchlists/track → toast → company page.
 * Logged out: store the intent (+ attribution), bounce through auth, and this
 * page resumes and executes it exactly once. Refresh-safe because the
 * backend call is idempotent — a re-run lands on "already tracking".
 */

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { ShareInfo, TrackResponse } from "@/types/api";
import { api } from "@/lib/api-client";
import { parseAttribution, type ShareAttribution } from "@/lib/share";
import {
  clearPendingAction,
  getPendingAction,
  setPendingAction,
} from "@/lib/pending-action";
import { trackShareEvent } from "@/lib/share-analytics";
import { toast } from "@/components/ui/app-toaster";
import { useAuth } from "@/hooks/use-auth";
import { CompanyAvatar } from "@/components/watchlist/company-avatar";

type FlowState =
  | "loading"
  | "success"
  | "already"
  | "invalid"
  | "error";

interface AddFlowProps {
  symbol: string | null;
  /** From the server render; null if the ticker is unknown OR the API was
   *  unreachable — the flow re-checks client-side before declaring invalid. */
  company: { name: string; ticker: string } | null;
}

const REDIRECT_DELAY_MS = 1400;

export function AddFlow({ symbol, company: companyProp }: AddFlowProps) {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [state, setState] = useState<FlowState>(symbol ? "loading" : "invalid");
  const [company, setCompany] = useState(companyProp);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const startedRef = useRef(false);
  const openedRef = useRef(false);

  const attributionRef = useRef<ShareAttribution>({});

  // One page-view event per landing, with whatever attribution rode the link.
  useEffect(() => {
    if (openedRef.current || !symbol) return;
    openedRef.current = true;
    attributionRef.current = parseAttribution(
      new URLSearchParams(window.location.search)
    );
    trackShareEvent("link_opened", { symbol, attribution: attributionRef.current });
  }, [symbol]);

  // NB: no synchronous setState at the top — the page mounts in "loading"
  // and retries reset state in the click handler, keeping effects quiet.
  const execute = useCallback(async () => {
    if (!symbol) return;

    // Resuming a stored intent? Merge its attribution (the auth redirect may
    // have dropped the query string) and count the completed signup/login.
    const pending = getPendingAction();
    const resumed =
      pending?.type === "add_watchlist" && pending.params.symbol === symbol;
    const attribution = {
      ...(resumed ? pending.attribution : undefined),
      ...attributionRef.current,
    };
    // Consume the intent now — whatever happens next, it must not fire again
    // from another page. Refresh-safety comes from the idempotent endpoint.
    clearPendingAction();
    if (resumed) {
      trackShareEvent("auth_completed", { symbol, attribution });
    }

    try {
      const data = await api<TrackResponse>("/watchlists/track", {
        method: "POST",
        body: JSON.stringify({ symbol, attribution }),
      });
      setCompany({ name: data.company.name, ticker: data.company.ticker });
      const added = data.status === "added";
      setState(added ? "success" : "already");
      toast(
        added
          ? {
              title: `Added ${data.company.name} to your watchlist.`,
              description: "You'll now receive material updates.",
              tone: "success",
            }
          : { title: `You're already tracking ${data.company.name}.` }
      );
      setTimeout(() => {
        router.replace(`/watchlist?c=${data.company.id}`);
      }, REDIRECT_DELAY_MS);
    } catch (err) {
      const message = err instanceof Error ? err.message : "";
      if (message === "unknown_ticker" || message === "invalid_symbol") {
        setState("invalid");
        return;
      }
      trackShareEvent("failed", { symbol, attribution });
      setErrorMessage("Something went wrong while adding the company.");
      setState("error");
    }
  }, [symbol, router]);

  useEffect(() => {
    if (!symbol || authLoading || startedRef.current) return;
    startedRef.current = true;

    if (!user) {
      // Preserve the intent, then send them through signup. The register and
      // login pages honor ?next= and return here to finish the add.
      const resumePath = window.location.pathname + window.location.search;
      setPendingAction({
        type: "add_watchlist",
        params: { symbol },
        attribution: attributionRef.current,
        resumePath,
      });
      trackShareEvent("auth_started", {
        symbol,
        attribution: attributionRef.current,
      });
      router.replace(`/register?next=${encodeURIComponent(resumePath)}`);
      return;
    }

    void execute();
  }, [symbol, authLoading, user, router, execute]);

  // If the server couldn't resolve the company (API hiccup or bad ticker) we
  // verify client-side before showing "not found".
  useEffect(() => {
    if (!symbol || company) return;
    let cancelled = false;
    fetch(
      `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1"}/share/${encodeURIComponent(symbol)}`
    )
      .then(async (res) => {
        if (cancelled) return;
        if (res.ok) {
          const info = (await res.json()) as ShareInfo;
          if (!cancelled)
            setCompany({ name: info.company.name, ticker: info.symbol });
        } else if (res.status === 404 || res.status === 400) {
          if (!cancelled) setState("invalid");
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [symbol, company]);

  const displayName = company?.name ?? symbol ?? "this company";

  return (
    <div className="flex min-h-dvh items-center justify-center bg-canvas-sunken p-4 text-ink">
      <div className="w-full max-w-sm rounded-lg border border-line-subtle bg-surface px-6 py-8 text-center shadow-popover">
        <div className="mb-4 flex justify-center">
          {state === "invalid" ? (
            <div className="flex size-10 items-center justify-center rounded-md bg-surface-hover text-title text-ink-faint">
              ?
            </div>
          ) : (
            <CompanyAvatar ticker={company?.ticker ?? symbol} name={displayName} />
          )}
        </div>

        {state === "loading" && (
          <>
            <h1 className="text-title font-medium text-ink">Adding {displayName}…</h1>
            <p className="mt-1.5 text-label text-ink-muted">
              Setting up material-update alerts for{" "}
              <span className="font-mono">{symbol}</span>.
            </p>
            <div className="mt-5 flex justify-center" role="status" aria-label="Adding company">
              <span className="size-5 animate-spin rounded-full border-2 border-brand/30 border-t-brand" />
            </div>
          </>
        )}

        {(state === "success" || state === "already") && (
          <>
            <div className="mb-2 text-title text-success">✓</div>
            <h1 className="text-title font-medium text-ink">
              {state === "success"
                ? `${displayName} added to your watchlist.`
                : `You're already tracking ${displayName}.`}
            </h1>
            <p className="mt-1.5 text-label text-ink-muted">
              You&apos;ll receive material filings, earnings and company updates.
            </p>
            <p className="mt-4 text-meta text-ink-faint">
              Taking you to the company page…
            </p>
          </>
        )}

        {state === "invalid" && (
          <>
            <h1 className="text-title font-medium text-ink">
              We couldn&apos;t find this company.
            </h1>
            <p className="mt-1.5 text-label text-ink-muted">
              {symbol ? (
                <>
                  No listed company matches{" "}
                  <span className="font-mono">{symbol}</span> — it may be
                  delisted or the link may be mistyped.
                </>
              ) : (
                "That link doesn't look like a valid ticker."
              )}
            </p>
            <Link
              href="/feed"
              className="mt-5 inline-block text-label font-medium text-brand-ink underline-offset-2 hover:underline"
            >
              Browse the live filing feed →
            </Link>
          </>
        )}

        {state === "error" && (
          <>
            <h1 className="text-title font-medium text-ink">Couldn&apos;t add {displayName}</h1>
            <p className="mt-1.5 text-label text-ink-muted">
              {errorMessage ?? "Something went wrong."} Check your connection
              and try again.
            </p>
            <button
              onClick={() => {
                setState("loading");
                setErrorMessage(null);
                void execute();
              }}
              className="mt-5 inline-flex h-8 items-center justify-center rounded-md bg-brand px-3 text-label font-medium text-brand-on transition-colors hover:bg-brand-hover"
            >
              Try again
            </button>
          </>
        )}

        <p className="mt-7 text-micro text-ink-faint">
          Powered by{" "}
          <Link href="/" className="hover:underline underline-offset-2">
            Sensybull
          </Link>{" "}
          — SEC filings, decoded.
        </p>
      </div>
    </div>
  );
}
