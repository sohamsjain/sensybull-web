import type { Metadata } from "next";
import { TopNav } from "@/components/layout/top-nav";
import { CommandPalette } from "@/components/command-palette";
import { ShortcutsSheet } from "@/components/shortcuts-sheet";
import { SearchHome } from "@/components/home/search-home";

export const metadata: Metadata = {
  alternates: { canonical: "/" },
};

/**
 * The home page, for guests and signed-in readers alike: the app's bar
 * (Watchlist, Feed, search) over the mark, one company search and
 * one-click companies. No company list — that belongs to /watchlist.
 *
 * It sits outside the (dashboard) group on purpose and repeats that
 * layout's shell. The dashboard layout reads useSearchParams under a
 * Suspense boundary, which bails a prerendered page out to client
 * rendering: inside it, this page's HTML would be empty, and most crawlers
 * never run JavaScript. Nothing here needs the feed context or the socket.
 */
export default function Home() {
  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-canvas text-ink">
      <TopNav />
      <main className="min-h-0 flex-1 overflow-hidden">
        <SearchHome />
      </main>
      <CommandPalette />
      <ShortcutsSheet />
    </div>
  );
}
