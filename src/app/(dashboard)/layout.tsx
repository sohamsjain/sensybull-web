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

export type { CompanyRef };

interface DashboardContextValue {
  significanceFilter: Set<string>;
  eventTypeFilter: Set<string>;
  marketCapFilter: Set<string>;
  search: string;
  toggleSignificance: (level: string) => void;
  toggleEventType: (type: string) => void;
  clearEventTypes: () => void;
  toggleMarketCap: (bucket: string) => void;
  clearMarketCaps: () => void;
  setSearch: (value: string) => void;
  openCompany: (company: CompanyRef) => void;
}

const DashboardContext = createContext<DashboardContextValue>({
  significanceFilter: new Set(["High", "Medium", "Low"]),
  eventTypeFilter: new Set(),
  marketCapFilter: new Set(),
  search: "",
  toggleSignificance: () => {},
  toggleEventType: () => {},
  clearEventTypes: () => {},
  toggleMarketCap: () => {},
  clearMarketCaps: () => {},
  setSearch: () => {},
  openCompany: () => {},
});

export const useDashboard = () => useContext(DashboardContext);

const ALL_SIGNIFICANCE = ["High", "Medium", "Low"];

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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
  const [marketCapFilter, setMarketCapFilter] = useState<Set<string>>(() => {
    const mcap = searchParams.get("mcap");
    return mcap ? new Set(mcap.split(",").filter(Boolean)) : new Set<string>();
  });
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [companySheet, setCompanySheet] = useState<CompanyRef | null>(null);

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
    if (marketCapFilter.size > 0) {
      params.set("mcap", [...marketCapFilter].join(","));
    }
    if (search) params.set("q", search);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }, [significanceFilter, eventTypeFilter, marketCapFilter, search, pathname]);

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

  const toggleMarketCap = useCallback((bucket: string) => {
    setMarketCapFilter((prev) => {
      const next = new Set(prev);
      if (next.has(bucket)) next.delete(bucket);
      else next.add(bucket);
      return next;
    });
  }, []);

  const clearMarketCaps = useCallback(() => {
    setMarketCapFilter(new Set());
  }, []);

  const openCompany = useCallback(
    (company: CompanyRef) => setCompanySheet(company),
    []
  );

  return (
    <DashboardContext.Provider
      value={{
        significanceFilter,
        eventTypeFilter,
        marketCapFilter,
        search,
        toggleSignificance,
        toggleEventType,
        clearEventTypes,
        toggleMarketCap,
        clearMarketCaps,
        setSearch,
        openCompany,
      }}
    >
      {/* One socket for the whole session, owned above the pages so it
          survives navigation and can surface thesis alerts anywhere. */}
      <SocketProvider>
        {/* overflow-hidden pins the app shell to the viewport so the document
            itself never grows a second scrollbar */}
        <div className="h-dvh overflow-hidden flex bg-slate-50 dark:bg-[#0b0d12] text-slate-800 dark:text-slate-100">
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
