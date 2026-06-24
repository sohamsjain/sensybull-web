"use client";

import { useState, useCallback, createContext, useContext } from "react";
import { usePathname } from "next/navigation";
import type { Watchlist } from "@/types/api";
import { TopBar } from "@/components/layout/top-bar";
import { NavRail } from "@/components/layout/nav-rail";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileNav } from "@/components/layout/mobile-nav";
import { useAuth } from "@/hooks/use-auth";

interface DashboardContextValue {
  significanceFilter: Set<string>;
  eventTypeFilter: Set<string>;
  search: string;
  selectedWatchlist: Watchlist | null;
}

const DashboardContext = createContext<DashboardContextValue>({
  significanceFilter: new Set(["High", "Medium", "Low"]),
  eventTypeFilter: new Set(),
  search: "",
  selectedWatchlist: null,
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

  const handleSignificanceToggle = useCallback((level: string) => {
    setSignificanceFilter((prev) => {
      const next = new Set(prev);
      if (next.has(level)) next.delete(level);
      else next.add(level);
      return next;
    });
  }, []);

  const handleEventTypeToggle = useCallback((type: string) => {
    setEventTypeFilter((prev) => {
      const next = new Set(prev);
      if (next.has(type)) next.delete(type);
      else next.add(type);
      return next;
    });
  }, []);

  const handleEventTypeClear = useCallback(() => {
    setEventTypeFilter(new Set());
  }, []);

  return (
    <DashboardContext.Provider
      value={{ significanceFilter, eventTypeFilter, search, selectedWatchlist }}
    >
      <div className="h-screen flex bg-white dark:bg-[#0a0a12] text-slate-800 dark:text-slate-100">
        <NavRail />
        <div className="flex-1 flex flex-col min-w-0">
          <TopBar
            significanceFilter={significanceFilter}
            onSignificanceToggle={handleSignificanceToggle}
            eventTypeFilter={eventTypeFilter}
            onEventTypeToggle={handleEventTypeToggle}
            onEventTypeClear={handleEventTypeClear}
            search={search}
            onSearchChange={setSearch}
            onMobileMenuToggle={isChats ? undefined : () => setMobileNavOpen(true)}
            showFilters={!isChats}
          />
          <div className="flex flex-1 overflow-hidden">
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
