"use client";

import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/section";
import { ChevronRightIcon } from "@/components/ui/icons";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";

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
            <Button size="sm">Add your portfolio</Button>
          </Link>
        </div>
      </div>
    </nav>
  );
}

/**
 * The hero demonstrates the transformation rather than showing a dashboard:
 * a thesis, an event, the reading, the verdict. That sequence is the product.
 */
const TRANSFORMATION = [
  "Your thesis",
  "A company event",
  "What it means for you",
  "Thesis drift",
];

function Hero() {
  return (
    <section className="pt-32 pb-16">
      <div className="mx-auto max-w-2xl px-6 text-center">
        <h1 className="text-display font-semibold text-ink sm:text-display-lg">
          Your stocks changed.
          <br />
          <span className="text-ink-muted">Did your thesis?</span>
        </h1>
        <p className="mx-auto mt-6 max-w-lg text-title leading-relaxed text-ink-muted">
          Sensybull watches the companies you own and tells you when something
          happens that could change{" "}
          <span className="text-ink">why you own them.</span>
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-2 sm:flex-row">
          <Link href="/register">
            <Button size="lg">Add your portfolio</Button>
          </Link>
          <Link href="/feed">
            <Button size="lg" variant="outline">
              See the live feed
            </Button>
          </Link>
        </div>
        <p className="mt-4 text-meta text-ink-faint">Free while in beta.</p>

        <ul className="mx-auto mt-12 grid max-w-md grid-cols-2 gap-x-2 gap-y-3 sm:flex sm:max-w-none sm:items-center sm:justify-center sm:gap-0">
          {TRANSFORMATION.map((step, i) => (
            <li key={step} className="flex items-center justify-center gap-1">
              <span className="text-meta text-ink-muted">{step}</span>
              {i < TRANSFORMATION.length - 1 && (
                <ChevronRightIcon
                  className="hidden size-3.5 shrink-0 text-ink-dim sm:block sm:mx-2"
                  aria-hidden
                />
              )}
            </li>
          ))}
        </ul>

        <p className="mt-10 text-meta text-ink-faint italic">
          Stay invested with conviction. Reconsider when the facts change.
        </p>
      </div>
    </section>
  );
}

const NOISE_SOURCES = [
  "SEC filings",
  "Earnings releases",
  "Press releases",
  "Conference calls",
  "Analyst reports",
  "News alerts",
];

function Problem() {
  return (
    <section className="border-t border-line-subtle py-16">
      <div className="mx-auto max-w-2xl px-6">
        <p className="eyebrow">The problem</p>
        <h2 className="mt-3 text-display font-semibold text-ink">
          You don&apos;t need more financial news.
        </h2>
        <p className="mt-3 text-body-lg leading-relaxed text-ink-muted">
          You already have enough.
        </p>

        <ul className="mt-6 divide-y divide-line-subtle border-y border-line-subtle">
          {NOISE_SOURCES.map((source) => (
            <li key={source} className="py-2.5 text-body text-ink-muted">
              {source}
            </li>
          ))}
        </ul>

        <div className="mt-8 space-y-4 text-body-lg leading-relaxed text-ink-muted">
          <p>
            The problem isn&apos;t finding information. It&apos;s knowing{" "}
            <span className="font-medium text-ink">
              which information actually matters to your investment thesis.
            </span>
          </p>
          <p>
            You don&apos;t own a stock because it went up yesterday. You own it
            because you believe something about the business.
          </p>
          <p className="font-medium text-ink">
            And that belief can change long before the stock price tells you.
          </p>
        </div>
      </div>
    </section>
  );
}

const THESIS_ASSUMPTIONS = [
  "Revenue should grow 20%+",
  "Margins should expand",
  "Management should remain disciplined with capital",
  "The competitive advantage should persist",
];

const WATCHED_EVENTS = [
  "Management changes guidance",
  "Margins deteriorate",
  "A major customer leaves",
  "Debt increases",
  "An acquisition changes the economics",
];

function HowItWorks() {
  return (
    <section className="border-t border-line-subtle py-16">
      <div className="mx-auto max-w-2xl px-6">
        <p className="eyebrow">How it works</p>
        <h2 className="mt-3 text-display font-semibold text-ink">
          Sensybull watches the thesis, not the ticker.
        </h2>

        <ol className="mt-10 divide-y divide-line-subtle">
          <li className="pb-8">
            <p className="text-micro font-semibold tracking-wide text-ink-faint">
              01
            </p>
            <h3 className="mt-1.5 text-title font-medium text-ink">
              Write down why you own it.
            </h3>
            <p className="mt-2 text-body leading-relaxed text-ink-muted">
              Not a price target — the beliefs underneath it.
            </p>
            <ul className="mt-4 space-y-2 border-l-2 border-line-subtle pl-4">
              {THESIS_ASSUMPTIONS.map((assumption) => (
                <li key={assumption} className="text-body text-ink-muted">
                  {assumption}
                </li>
              ))}
            </ul>
          </li>

          <li className="py-8">
            <p className="text-micro font-semibold tracking-wide text-ink-faint">
              02
            </p>
            <h3 className="mt-1.5 text-title font-medium text-ink">
              We watch what the company reports.
            </h3>
            <p className="mt-2 text-body leading-relaxed text-ink-muted">
              Every filing and press release, seconds after it&apos;s published,
              read against your assumptions.
            </p>
            <ul className="mt-4 space-y-2 border-l-2 border-line-subtle pl-4">
              {WATCHED_EVENTS.map((event) => (
                <li key={event} className="text-body text-ink-muted">
                  {event}
                </li>
              ))}
            </ul>
            <p className="mt-4 text-meta leading-relaxed text-ink-faint">
              Every briefing quotes the document&apos;s own words, linked
              straight to the highlighted passage on sec.gov. If we can&apos;t
              verify it against the source, we don&apos;t print it.
            </p>
          </li>

          <li className="pt-8">
            <p className="text-micro font-semibold tracking-wide text-ink-faint">
              03
            </p>
            <h3 className="mt-1.5 text-title font-medium text-ink">
              You hear about it in your terms.
            </h3>
            <p className="mt-2 text-body leading-relaxed text-ink-muted">
              A company filing an 8-K is information. A company losing its
              largest customer, when you own it for customer retention, is a
              thesis event. Most platforms tell you what happened. Sensybull
              tells you why you should care.
            </p>

            <p className="mt-6 text-body text-ink-muted">
              You won&apos;t get:
            </p>
            <p className="mt-2 text-body text-ink-faint">
              &ldquo;Company XYZ filed an 8-K.&rdquo;
            </p>

            <p className="mt-6 text-body text-ink-muted">You&apos;ll get:</p>
            <Card className="mt-2 p-4">
              <p className="text-micro font-semibold tracking-wide text-danger uppercase">
                Thesis drift
              </p>
              <p className="mt-2 text-body-lg leading-relaxed text-ink">
                Management lowered FY2027 revenue guidance by 16%.
              </p>
              <p className="mt-1.5 text-body leading-relaxed text-ink-muted">
                This challenges your thesis assumption of sustained double-digit
                growth.
              </p>
            </Card>

            <p className="mt-6 text-body leading-relaxed text-ink-muted">
              The goal isn&apos;t to make you read more. It&apos;s to make sure
              you don&apos;t miss what matters.
            </p>
          </li>
        </ol>
      </div>
    </section>
  );
}

const PORTFOLIO_STATUS = [
  { count: "21", label: "Thesis intact", tone: "text-success" },
  { count: "2", label: "Worth watching", tone: "text-warning" },
  { count: "1", label: "Thesis drift", tone: "text-danger" },
];

const TIMELINE = [
  {
    period: "January",
    note: "“Revenue should compound at 20%+.”",
    verdict: "Thesis written",
    tone: "text-ink-muted",
  },
  {
    period: "April",
    note: "Revenue growth: 23%",
    verdict: "Thesis intact",
    tone: "text-success",
  },
  {
    period: "July",
    note: "Revenue growth: 14%",
    verdict: "Worth watching",
    tone: "text-warning",
  },
  {
    period: "October",
    note: "Full-year guidance reduced",
    verdict: "Thesis challenged",
    tone: "text-danger",
  },
];

function Portfolio() {
  return (
    <section className="border-t border-line-subtle py-16">
      <div className="mx-auto max-w-2xl px-6">
        <p className="eyebrow">Your portfolio</p>
        <h2 className="mt-3 text-display font-semibold text-ink">
          Know what&apos;s changed.
          <br />
          <span className="text-ink-muted">Ignore what hasn&apos;t.</span>
        </h2>

        <p className="mt-8 text-meta text-ink-faint">24 companies monitored</p>
        <dl className="mt-3 grid grid-cols-3 gap-4 border-y border-line-subtle py-5">
          {PORTFOLIO_STATUS.map(({ count, label, tone }) => (
            <div key={label}>
              <dt className="sr-only">{label}</dt>
              <dd>
                <span
                  className={cn(
                    "block font-mono text-display font-semibold tabular-nums",
                    tone
                  )}
                >
                  {count}
                </span>
                <span className="mt-1 block text-micro tracking-wide text-ink-faint uppercase">
                  {label}
                </span>
              </dd>
            </div>
          ))}
        </dl>
        <p className="mt-2 text-micro text-ink-dim">Illustrative.</p>

        <p className="mt-10 text-body-lg leading-relaxed text-ink-muted">
          You don&apos;t need to read every filing. You need to know when
          something deserves your attention — and you need to remember what you
          believed in the first place.
        </p>

        <h3 className="mt-10 text-title font-medium text-ink">
          Your thesis shouldn&apos;t live in your head.
        </h3>
        <p className="mt-2 text-body leading-relaxed text-ink-muted">
          Write it down once. Sensybull keeps the record and tracks it against
          what the business actually reports.
        </p>

        <ul className="mt-6 divide-y divide-line-subtle border-y border-line-subtle">
          {TIMELINE.map(({ period, note, verdict, tone }) => (
            <li
              key={period}
              className="flex flex-col gap-1 py-3 sm:flex-row sm:items-baseline sm:gap-4"
            >
              <span className="w-20 shrink-0 text-meta text-ink-faint">
                {period}
              </span>
              <span className="min-w-0 flex-1 text-body text-ink">{note}</span>
              <span className={cn("shrink-0 text-meta", tone)}>
                {verdict}
              </span>
            </li>
          ))}
        </ul>
        <p className="mt-2 text-micro text-ink-dim">Illustrative.</p>
      </div>
    </section>
  );
}

const AUDIENCES = [
  {
    title: "Long-term investors",
    body: "Monitor the assumptions behind your compounders.",
  },
  {
    title: "Value investors",
    body: "Know when the facts move away from your valuation thesis.",
  },
  {
    title: "Concentrated investors",
    body: "Stay close to the businesses that matter most to your portfolio.",
  },
  {
    title: "Fundamental investors",
    body: "Turn filings and company disclosures into thesis-level signals.",
  },
];

function Audience() {
  return (
    <section className="border-t border-line-subtle py-16">
      <div className="mx-auto max-w-2xl px-6">
        <p className="eyebrow">Who it&apos;s for</p>
        <h2 className="mt-3 text-display font-semibold text-ink">
          Built for the portfolio you already have.
        </h2>
        <p className="mt-4 text-body-lg leading-relaxed text-ink-muted">
          Sensybull isn&apos;t another place to discover stocks. It&apos;s for
          investors who already have money at risk and want to understand when
          the underlying businesses change.
        </p>

        <dl className="mt-8 divide-y divide-line-subtle">
          {AUDIENCES.map(({ title, body }) => (
            <div key={title} className="py-4 first:pt-0 last:pb-0">
              <dt className="text-body-lg font-medium text-ink">{title}</dt>
              <dd className="mt-1 text-body leading-relaxed text-ink-muted">
                {body}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}

function HabitAndCta() {
  return (
    <section className="border-t border-line-subtle py-16">
      <div className="mx-auto max-w-2xl px-6">
        <p className="eyebrow">The habit</p>
        <h2 className="mt-3 text-display font-semibold text-ink">
          Five minutes. That&apos;s it.
        </h2>
        <p className="mt-4 text-body-lg leading-relaxed text-ink-muted">
          Open Sensybull. Review what changed. Decide whether your thesis still
          holds. Go back to your life.
        </p>
        <p className="mt-6 text-meta text-ink-faint">
          Every day, one question:
        </p>
        <p className="mt-2 text-title font-medium text-ink">
          &ldquo;Did anything happen that changes why I own these
          stocks?&rdquo;
        </p>
        <p className="mt-2 text-body text-ink-muted">
          If not, you&apos;re done.
        </p>

        <div className="mt-14 border-t border-line-subtle pt-14 text-center">
          <p className="mx-auto max-w-xl text-display font-semibold text-balance text-ink">
            You shouldn&apos;t have to watch 50 companies. You should be able to
            watch{" "}
            <span className="text-ink-muted italic">why you own</span> 50
            companies.
          </p>
          <p className="mx-auto mt-6 max-w-md text-body-lg leading-relaxed text-ink-muted">
            Add your portfolio. Write down why you own each stock. Let Sensybull
            watch the rest.
          </p>
          <div className="mt-8">
            <Link href="/register">
              <Button size="lg">Add your portfolio</Button>
            </Link>
          </div>
          <p className="mt-4 text-meta text-ink-faint italic">
            Your thesis stays yours. Sensybull just watches the facts.
          </p>
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
            <div>
              <span className="block text-meta text-ink-faint">Sensybull</span>
              <span className="block text-micro text-ink-dim">
                Thesis monitoring for serious investors.
              </span>
            </div>
          </Link>
          <div className="flex items-center gap-5 text-meta text-ink-faint">
            <Link href="/feed" className="transition-colors hover:text-ink">
              Live feed
            </Link>
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
          Portfolio monitoring · SEC filings · Company updates · Thesis drift
        </p>
        <p className="mt-3 text-center text-micro text-ink-dim">
          Sensybull reports what companies disclose. It is not investment
          advice — see our{" "}
          <Link href="/disclaimer" className="underline hover:text-ink">
            disclaimer
          </Link>
          .
        </p>
        <p className="mt-3 text-center text-micro text-ink-dim">
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
        <Hero />
        <Problem />
        <HowItWorks />
        <Portfolio />
        <Audience />
        <HabitAndCta />
      </main>
      <Footer />
    </div>
  );
}
