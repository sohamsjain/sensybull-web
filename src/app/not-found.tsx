import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Page not found",
  robots: { index: false, follow: true },
};

/**
 * The site-wide 404 (served with a real 404 status). Pages with a more
 * specific answer — an unknown ticker — have their own not-found.tsx.
 * Points somewhere useful instead of leaving the reader at a dead end.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center bg-canvas px-4 text-center text-ink">
      <p className="eyebrow">404</p>
      <h1 className="mt-2 text-heading font-semibold">This page doesn&apos;t exist</h1>
      <p className="mt-2 max-w-sm text-label text-ink-muted">
        The link may be mistyped, or the update it pointed to was removed.
      </p>
      <nav className="mt-6 flex flex-wrap justify-center gap-x-5 gap-y-2 text-label">
        <Link href="/feed" className="text-brand-ink underline-offset-2 hover:underline">
          Live feed
        </Link>
        <Link href="/company" className="text-brand-ink underline-offset-2 hover:underline">
          Company financials
        </Link>
        <Link href="/" className="text-brand-ink underline-offset-2 hover:underline">
          Home
        </Link>
      </nav>
    </main>
  );
}
