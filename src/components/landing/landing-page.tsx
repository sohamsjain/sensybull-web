import Link from "next/link";

import { buttonVariants } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";
import { CompanySearch } from "@/components/fundamentals/company-search";

/**
 * The front page: the mark, one company search, and a way into the live
 * feed. Nothing else — a search engine's front page, not a marketing page.
 * A result opens the company's financials (public, works signed out).
 */
export default function LandingPage() {
  return (
    <div className="flex min-h-screen flex-col bg-canvas text-ink">
      <header className="flex h-13 items-center justify-end gap-1.5 px-4 sm:px-6">
        <Link
          href="/login"
          className="px-2 text-label text-ink-muted transition-colors hover:text-ink"
        >
          Sign in
        </Link>
        <ThemeToggle size="md" />
      </header>

      <main className="flex flex-1 flex-col items-center justify-center px-4 pb-24 sm:px-6">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/logo-mark.png"
          alt=""
          width={880}
          height={471}
          className="h-20 w-auto sm:h-24 dark:invert"
        />
        <h1 className="mt-2 text-display-lg font-semibold text-ink">Sensybull</h1>

        <div className="mt-8 w-full max-w-xl">
          <CompanySearch size="lg" placeholder="Search for a stock" autoFocus />
        </div>

        <Link href="/feed" className={buttonVariants({ variant: "outline", size: "lg", className: "mt-6" })}>
          See the live feed
        </Link>
      </main>

      <footer className="flex flex-wrap items-center justify-center gap-x-5 gap-y-2 px-4 py-6 text-micro text-ink-faint">
        <span>Not investment advice.</span>
        <Link href="/terms" className="transition-colors hover:text-ink">
          Terms
        </Link>
        <Link href="/privacy" className="transition-colors hover:text-ink">
          Privacy
        </Link>
        <Link href="/disclaimer" className="transition-colors hover:text-ink">
          Disclaimer
        </Link>
      </footer>
    </div>
  );
}
