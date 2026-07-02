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
import type { Watchlist } from "@/types/api";
import { NavRail } from "@/components/layout/nav-rail";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuth } from "@/hooks/use-auth";

interface DashboardContextValue {
  significanceFilter: Set<string>;
  eventTypeFilter: Set<string>;
  search: string;
  selectedWatchlist: Watchlist | null;
  toggleSignificance: (level: string) => void;
  toggleEventType: (type: string) => void;
  clearEventTypes: () => void;
  setSearch: (value: string) => void;
  openMobileNav: () => void;
}

const DashboardContext = createContext<DashboardContextValue>({
  significanceFilter: new Set(["High", "Medium", "Low"]),
  eventTypeFilter: new Set(),
  search: "",
  selectedWatchlist: null,
  toggleSignificance: () => {},
  toggleEventType: () => {},
  clearEventTypes: () => {},
  setSearch: () => {},
  openMobileNav: () => {},
});

export const useDashboard = () => useContext(DashboardContext);

const ALL_SIGNIFICANCE = ["High", "Medium", "Low"];

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  // The chats page brings its own list pane; the watchlist sidebar and feed
  // filters only apply to the feed.
  const isChats = pathname?.startsWith("/chats") ?? false;

  // Filters initialize from the URL so filtered views are shareable
  const [significanceFilter, setSignificanceFilter] = useState<Set<string>>(
    () => {
      const sig = searchParams.get("sig");
      if (sig === null) return new Set(ALL_SIGNIFICANCE);
      return new Set(
        sig.split(",").filter((s) => ALL_SIGNIFICANCE.includes(s))
      );
    }
  );
  const [eventTypeFilter, setEventTypeFilter] = useState<Set<string>>(() => {
    const types = searchParams.get("types");
    return types
      ? new Set(types.split(",").filter(Boolean))
      : new Set<string>();
  });
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(
    null
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  // Mirror filter state back into the URL (shallow, no navigation)
  useEffect(() => {
    if (!pathname?.startsWith("/feed")) return;
    const params = new URLSearchParams();
    if (significanceFilter.size !== ALL_SIGNIFICANCE.length) {
      params.set("sig", [...significanceFilter].join(","));
    }
    if (eventTypeFilter.size > 0) {
      params.set("types", [...eventTypeFilter].join(","));
    }
    if (search) params.set("q", search);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }, [significanceFilter, eventTypeFilter, search, pathname]);

  const toggleSignificance = useCallback((level: string) => {
    setSignificanceFilter((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  }, []);

  const toggleEventType = useCallback((type: string) => {
    setEventTypeFilter((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const clearEventTypes = useCallback(() => {
    setEventTypeFilter(new Set());
  }, []);

  const openMobileNav = useCallback(() => setMobileNavOpen(true), []);

  return (
    <DashboardContext.Provider
      value={{
        significanceFilter,
        eventTypeFilter,
        search,
        selectedWatchlist,
        toggleSignificance,
        toggleEventType,
        clearEventTypes,
        setSearch,
        openMobileNav,
      }}
    >
      {/* overflow-hidden pins the app shell to the viewport so the document
          itself never grows a second scrollbar */}
      <div className="h-dvh overflow-hidden flex bg-slate-50 dark:bg-[#0b0d12] text-slate-800 dark:text-slate-100">
        <NavRail />
        <div className="flex-1 flex min-w-0 overflow-hidden">
          {user && !isChats && (
            <div className="hidden md:block">
              <Sidebar
                selectedWatchlist={selectedWatchlist}
                onSelectWatchlist={setSelectedWatchlist}
              />
            </div>
          )}
          <main className="flex-1 overflow-hidden">{children}</main>
        </div>
        {user && !isChats && (
          <MobileNav
            open={mobileNavOpen}
            onOpenChange={setMobileNavOpen}
            selectedWatchlist={selectedWatchlist}
            onSelectWatchlist={setSelectedWatchlist}
          />
        )}
      </div>
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
