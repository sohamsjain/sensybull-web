"use client";

import {
  useState,
  useEffect,
  useCallback,
  useLayoutEffect,
  createContext,
  useContext,
} from "react";
import { usePathname } from "next/navigation";
import { TopNav } from "@/components/layout/top-nav";
import { CommandPalette } from "@/components/command-palette";
import { ShortcutsSheet } from "@/components/shortcuts-sheet";
import { SocketProvider } from "@/context/socket-provider";
import { useAuth } from "@/hooks/use-auth";
import {
  filtersFromParams,
  filtersToParams,
  type FeedFilters,
  type FeedScope,
} from "@/lib/feed-filters";

export type { FeedScope, FeedFilters };

/** Where the reader's last scope choice is remembered between visits. */
const SCOPE_KEY = "feed-scope";

/** The signed-in reader's remembered scope; their own companies by default. */
function storedScope(): FeedScope {
  try {
    return localStorage.getItem(SCOPE_KEY) === "all" ? "all" : "mine";
  } catch {
    return "mine";
  }
}

interface DashboardContextValue {
  /**
   * Whose updates the feed shows. `null` until it settles — it depends on
   * whether the visitor is signed in, which resolves after mount.
   */
  scope: FeedScope | null;
  setScope: (scope: FeedScope) => void;
  /**
   * Every feed filter (importance, event types, sectors, market cap,
   * source, tone, price move, time window, search) — see
   * `src/lib/feed-filters.ts`. Mirrored into the URL so a filtered view is
   * a shareable link.
   */
  filters: FeedFilters;
  setFilters: (next: FeedFilters | ((prev: FeedFilters) => FeedFilters)) => void;
}

const DashboardContext = createContext<DashboardContextValue>({
  scope: "all",
  setScope: () => {},
  filters: filtersFromParams(new URLSearchParams()),
  setFilters: () => {},
});

export const useDashboard = () => useContext(DashboardContext);

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();

  // Scope stays undecided until auth resolves, so a signed-in reader lands on
  // their own companies without the public firehose flashing up first.
  const [scope, setScope] = useState<FeedScope | null>(null);
  const [filters, setFilters] = useState<FeedFilters>(() =>
    filtersFromParams(new URLSearchParams())
  );

  // Scope and filters initialize from the URL so filtered views are
  // shareable. Read from `location` once on mount rather than through
  // useSearchParams: that hook opts every statically rendered page under
  // this layout out of server rendering (the server sent /feed and /company
  // with an empty <body>). A layout effect runs before the browser paints
  // and before AuthProvider's effects (children's effects run first), so
  // the URL's values are in place before auth settles and anything fetches.
  /* eslint-disable react-hooks/set-state-in-effect -- syncing from the
     URL, an external system the server render can't see */
  useLayoutEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const s = params.get("s");
    if (s === "mine" || s === "all") setScope(s);
    setFilters(filtersFromParams(params));
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Settle the scope once we know who's reading: their last choice if they
  // made one, otherwise their own companies. Done during render rather than
  // in an effect so the feed never fetches the wrong stream first, and a
  // reader who signs out drops straight back to the public one.
  if (!authLoading) {
    const settled: FeedScope = !user ? "all" : (scope ?? storedScope());
    if (settled !== scope) setScope(settled);
  }

  const chooseScope = useCallback((next: FeedScope) => {
    setScope(next);
    try {
      localStorage.setItem(SCOPE_KEY, next);
    } catch {}
  }, []);

  // Mirror filter state back into the URL (shallow, no navigation)
  useEffect(() => {
    if (!pathname?.startsWith("/feed")) return;
    const params = new URLSearchParams();
    if (scope === "mine") params.set("s", "mine");
    filtersToParams(filters, params);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }, [scope, filters, pathname]);

  return (
    <DashboardContext.Provider
      value={{
        scope,
        setScope: chooseScope,
        filters,
        setFilters,
      }}
    >
      {/* One socket for the whole session, owned above the pages so it
          survives navigation. */}
      <SocketProvider>
        {/* overflow-hidden pins the app shell to the viewport so the document
            itself never grows a second scrollbar. The navbar takes its row
            and the page takes the rest; pages size themselves with h-full. */}
        <div className="flex h-dvh flex-col overflow-hidden bg-canvas text-ink">
          <TopNav />
          <main className="min-h-0 flex-1 overflow-hidden">{children}</main>
          <CommandPalette />
          <ShortcutsSheet />
        </div>
      </SocketProvider>
    </DashboardContext.Provider>
  );
}

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // No Suspense boundary with an empty fallback here: one around the whole
  // shell is what a page's useSearchParams bails out to, and the server then
  // renders nothing for it. A page that reads search params wraps itself.
  return <DashboardInner>{children}</DashboardInner>;
}
