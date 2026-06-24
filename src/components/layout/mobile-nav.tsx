"use client";

import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Sidebar } from "./sidebar";
import type { Watchlist } from "@/types/api";

interface MobileNavProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedWatchlist: Watchlist | null;
  onSelectWatchlist: (wl: Watchlist | null) => void;
}

export function MobileNav({
  open,
  onOpenChange,
  selectedWatchlist,
  onSelectWatchlist,
}: MobileNavProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="left" className="w-64 bg-white dark:bg-[#0a0a12] border-slate-200 dark:border-white/[0.06] p-0">
        <SheetHeader className="px-4 pt-4">
          <SheetTitle className="text-slate-900 dark:text-white">Watchlists</SheetTitle>
        </SheetHeader>
        <Sidebar
          selectedWatchlist={selectedWatchlist}
          onSelectWatchlist={(wl) => {
            onSelectWatchlist(wl);
            onOpenChange(false);
          }}
        />
      </SheetContent>
    </Sheet>
  );
}
