"use client";

import {
  useState,
  useEffect,
  useCallback,
  createContext,
  useContext,
  Suspense,
} from "react";
import { usePathname, useSearchParams } from "next/navigation";
import { NavRail } from "@/components/layout/nav-rail";
import { BottomTabs } from "@/components/layout/bottom-tabs";
import { CompanySheet, type CompanyRef } from "@/components/company/company-sheet";
import { CommandPalette } from "@/components/command-palette";
import { SocketProvider } from "@/context/socket-provider";
import { useAuth } from "@/hooks/use-auth";
import type { FeedScope } from "@/hooks/use-events";

export type { CompanyRef };

/** The one feed filter: everything, or only market-moving updates. */
export type FeedFilter = "all" | "important";

export type { FeedScope };

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
  filter: FeedFilter;
  setFilter: (filter: FeedFilter) => void;
  /** Event-type category filter (null = all types). */
  eventType: string | null;
  setEventType: (value: string | null) => void;
  search: string;
  setSearch: (value: string) => void;
  openCompany: (company: CompanyRef) => void;
}

const DashboardContext = createContext<DashboardContextValue>({
  scope: "all",
  setScope: () => {},
  filter: "all",
  setFilter: () => {},
  eventType: null,
  setEventType: () => {},
  search: "",
  setSearch: () => {},
  openCompany: () => {},
});

export const useDashboard = () => useContext(DashboardContext);

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Scope initializes from the URL when a shared link names one; otherwise it
  // stays undecided until auth resolves, so a signed-in reader lands on their
  // own companies without the public firehose flashing up first.
  const [scope, setScope] = useState<FeedScope | null>(() => {
    const s = searchParams.get("s");
    return s === "mine" || s === "all" ? s : null;
  });

  // Filters initialize from the URL so filtered views are shareable
  const [filter, setFilter] = useState<FeedFilter>(() =>
    searchParams.get("f") === "important" ? "important" : "all"
  );
  const [eventType, setEventType] = useState<string | null>(
    () => searchParams.get("t") || null
  );
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [companySheet, setCompanySheet] = useState<CompanyRef | null>(null);

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
    if (filter === "important") params.set("f", "important");
    if (eventType) params.set("t", eventType);
    if (search) params.set("q", search);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }, [scope, filter, eventType, search, pathname]);

  const openCompany = useCallback(
    (company: CompanyRef) => setCompanySheet(company),
    []
  );

  return (
    <DashboardContext.Provider
      value={{
        scope,
        setScope: chooseScope,
        filter,
        setFilter,
        eventType,
        setEventType,
        search,
        setSearch,
        openCompany,
      }}
    >
      {/* One socket for the whole session, owned above the pages so it
          survives navigation. */}
      <SocketProvider>
        {/* overflow-hidden pins the app shell to the viewport so the document
            itself never grows a second scrollbar */}
        <div className="flex h-dvh overflow-hidden bg-canvas text-ink">
          <NavRail />
          <div className="flex-1 flex min-w-0 overflow-hidden">
            {/* pb clears the mobile bottom tab bar */}
            <main
              className={`flex-1 overflow-hidden ${user ? "pb-14 md:pb-0" : ""}`}
            >
              {children}
            </main>
          </div>
          <BottomTabs />
          <CompanySheet
            company={companySheet}
            onClose={() => setCompanySheet(null)}
          />
          <CommandPalette />
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
  // useSearchParams requires a Suspense boundary on statically rendered pages
  return (
    <Suspense fallback={null}>
      <DashboardInner>{children}</DashboardInner>
    </Suspense>
  );
}
