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

/** The one feed filter: everything, or only market-moving updates. */
export type FeedFilter = "all" | "important";

interface DashboardContextValue {
  filter: FeedFilter;
  setFilter: (filter: FeedFilter) => void;
  search: string;
  setSearch: (value: string) => void;
  openCompany: (company: CompanyRef) => void;
}

const DashboardContext = createContext<DashboardContextValue>({
  filter: "all",
  setFilter: () => {},
  search: "",
  setSearch: () => {},
  openCompany: () => {},
});

export const useDashboard = () => useContext(DashboardContext);

function DashboardInner({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Filters initialize from the URL so filtered views are shareable
  const [filter, setFilter] = useState<FeedFilter>(() =>
    searchParams.get("f") === "important" ? "important" : "all"
  );
  const [search, setSearch] = useState(() => searchParams.get("q") ?? "");
  const [companySheet, setCompanySheet] = useState<CompanyRef | null>(null);

  // Mirror filter state back into the URL (shallow, no navigation)
  useEffect(() => {
    if (!pathname?.startsWith("/feed")) return;
    const params = new URLSearchParams();
    if (filter === "important") params.set("f", "important");
    if (search) params.set("q", search);
    const qs = params.toString();
    window.history.replaceState(null, "", qs ? `${pathname}?${qs}` : pathname);
  }, [filter, search, pathname]);

  const openCompany = useCallback(
    (company: CompanyRef) => setCompanySheet(company),
    []
  );

  return (
    <DashboardContext.Provider
      value={{ filter, setFilter, search, setSearch, openCompany }}
    >
      {/* One socket for the whole session, owned above the pages so it
          survives navigation. */}
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
