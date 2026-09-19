"use client";

import { useCallback, useMemo, useState } from "react";
import Link from "next/link";
import { useAuth } from "@/hooks/use-auth";
import { useWatchlists } from "@/hooks/use-watchlists";
import { toast } from "@/components/ui/app-toaster";
import { Button } from "@/components/ui/button";
import { CheckIcon } from "@/components/ui/icons";
import { ShareDialog } from "@/components/share/share-dialog";

/**
 * Header actions: Track (or "In watchlist"), Updates, Share. Signed-out
 * readers get the public /add flow, which carries the intent through sign-in.
 */
export function CompanyActions({
  companyId,
  ticker,
  name,
}: {
  companyId: string;
  ticker: string;
  name: string;
}) {
  const { user } = useAuth();
  const { watchlists, create, addCompany } = useWatchlists();
  const [adding, setAdding] = useState(false);
  const [sharing, setSharing] = useState(false);

  const isWatchlisted = useMemo(
    () => watchlists.some((wl) => wl.companies?.some((c) => c.id === companyId)),
    [watchlists, companyId]
  );

  const handleWatch = useCallback(async () => {
    setAdding(true);
    try {
      let target = watchlists[0];
      if (!target) target = await create("My Watchlist");
      if (target?.id) await addCompany(target.id, companyId);
    } catch {
      toast({ tone: "danger", title: `Couldn't track ${ticker}` });
    }
    setAdding(false);
  }, [watchlists, create, addCompany, companyId, ticker]);

  return (
    <div className="flex flex-wrap items-center gap-1.5">
      {user ? (
        isWatchlisted ? (
          <span className="inline-flex h-9 items-center gap-1 rounded-md px-2 text-meta text-ink-faint">
            <CheckIcon className="size-3.5" />
            In watchlist
          </span>
        ) : (
          <Button size="sm" disabled={adding} onClick={handleWatch}>
            {adding ? "Adding…" : "Track"}
          </Button>
        )
      ) : (
        <Link href={`/add/${ticker}`}>
          <Button size="sm">Track</Button>
        </Link>
      )}
      <Link href={`/watchlist?c=${companyId}`}>
        <Button size="sm" variant="outline">
          Updates
        </Button>
      </Link>
      <Button size="sm" variant="ghost" onClick={() => setSharing(true)}>
        Share
      </Button>
      {sharing && (
        <ShareDialog company={{ name, ticker }} onClose={() => setSharing(false)} />
      )}
    </div>
  );
}
