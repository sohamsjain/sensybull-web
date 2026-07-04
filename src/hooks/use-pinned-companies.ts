"use client";

import { useMemo, useSyncExternalStore } from "react";
import { createLocalPref } from "@/lib/local-pref";

// Key kept as "pinned-chats" so existing users' pins survive the rename
const store = createLocalPref("pinned-chats", "[]");

/** Company ids pinned to the top of the watchlist, persisted locally. */
export function usePinnedCompanies(): {
  pinned: Set<string>;
  togglePin: (companyId: string) => void;
} {
  const raw = useSyncExternalStore(store.subscribe, store.get, store.getServer);

  const pinned = useMemo(() => {
    try {
      const parsed = JSON.parse(raw);
      return new Set<string>(Array.isArray(parsed) ? parsed : []);
    } catch {
      return new Set<string>();
    }
  }, [raw]);

  const togglePin = (companyId: string) => {
    const next = new Set(pinned);
    if (next.has(companyId)) next.delete(companyId);
    else next.add(companyId);
    store.set(JSON.stringify([...next]));
  };

  return { pinned, togglePin };
}
