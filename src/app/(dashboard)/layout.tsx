"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
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

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const pathname = usePathname();
  // The chats page brings its own list pane; the watchlist sidebar and feed
  // filters only apply to the feed.
  const isChats = pathname?.startsWith("/chats") ?? false;
  const [significanceFilter, setSignificanceFilter] = useState(
    new Set(["High", "Medium", "Low"])
  );
  const [eventTypeFilter, setEventTypeFilter] = useState(new Set<string>());
  const [search, setSearch] = useState("");
  const [selectedWatchlist, setSelectedWatchlist] = useState<Watchlist | null>(
    null
  );
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

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
      <div className="h-dvh overflow-hidden flex bg-white dark:bg-[#0a0a12] text-slate-800 dark:text-slate-100">
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
