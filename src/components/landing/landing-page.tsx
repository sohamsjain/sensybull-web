"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

function Navbar() {
  return (
    <nav className="fixed inset-x-0 top-0 z-50 border-b border-line-subtle bg-canvas/90 backdrop-blur">
      <div className="mx-auto flex h-13 max-w-4xl items-center justify-between px-6">
        <Link href="/" className="flex items-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.png" alt="" className="size-5 opacity-80 dark:invert" />
          <span className="text-label font-medium text-ink">Sensybull</span>
        </Link>
        <div className="flex items-center gap-1.5">
          <Link
            href="/feed"
            className="hidden px-2 text-label text-ink-muted transition-colors hover:text-ink sm:inline-flex"
          >
            Live feed
          </Link>
          <Link
            href="/login"
            className="px-2 text-label text-ink-muted transition-colors hover:text-ink"
          >
            Sign in
          </Link>
          <ThemeToggle size="md" />
          <Link href="/register">
            <Button size="sm">Get started</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="pt-32 pb-20">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h1 className="text-display-lg font-semibold text-ink">
          SEC filings, decoded.
        </h1>
        <p className="mx-auto mt-5 max-w-lg text-title leading-relaxed text-ink-muted">
          Every material 8-K and company press release turned into a
          plain-English briefing, seconds after it&apos;s published. Free to
          use.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Link href="/register">
            <Button size="lg">Start tracking</Button>
          </Link>
          <Link href="/feed">
            <Button size="lg" variant="outline">
              View the live feed
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

const VALUE_PROPS = [
  {
    title: "Know before the crowd.",
    body: "The moment a company files with the SEC, you get the briefing. Not hours later — seconds.",
  },
  {
    title: "Every filing, in plain English.",
    body: "Dense legalese distilled to what matters: the headline, and the summary when you want more.",
  },
  {
    title: "Your companies, always watched.",
    body: "Build a watchlist, get alerts, and read every filing in the company's own thread — so you never lose the context.",
  },
];

function ValueProps() {
  return (
    <section className="border-t border-line-subtle py-16">
      <div className="mx-auto max-w-2xl px-6">
        <dl className="divide-y divide-line-subtle">
          {VALUE_PROPS.map(({ title, body }) => (
            <div key={title} className="py-6 first:pt-0 last:pb-0">
              <dt className="text-title font-medium text-ink">{title}</dt>
              <dd className="mt-1.5 text-body leading-relaxed text-ink-muted">
                {body}
              </dd>
            </div>
          ))}
        </dl>
        <div className="mt-10 text-center">
          <Link href="/register">
            <Button size="lg">Start tracking — it&apos;s free</Button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-line-subtle">
      <div className="mx-auto max-w-4xl px-6 py-8">
        <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
          <Link href="/" className="flex items-center gap-2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt=""
              className="size-4 opacity-60 dark:invert"
            />
            <span className="text-meta text-ink-faint">Sensybull</span>
          </Link>
          <div className="flex items-center gap-5 text-meta text-ink-faint">
            <Link href="/terms" className="transition-colors hover:text-ink">
              Terms
            </Link>
            <Link href="/privacy" className="transition-colors hover:text-ink">
              Privacy
            </Link>
            <Link
              href="/disclaimer"
              className="transition-colors hover:text-ink"
            >
              Disclaimer
            </Link>
          </div>
        </div>
        <p className="mt-6 border-t border-line-subtle pt-5 text-center text-micro text-ink-dim">
          &copy; {new Date().getFullYear()} Sensybull, LLC. All rights
          reserved.
        </p>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-canvas text-ink">
      <Navbar />
      <main>
        <HeroSection />
        <ValueProps />
      </main>
      <Footer />
    </div>
  );
}
