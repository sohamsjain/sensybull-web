"use client";

import Link from "next/link";

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt=""
            className="w-6 h-6 invert"
          />
          <span className="text-[15px] font-medium text-white/90">
            Sensybull
          </span>
        </Link>
        <div className="flex items-center gap-2">
          <Link
            href="/feed"
            className="hidden sm:inline-flex text-sm text-white/40 hover:text-white/70 transition-colors px-3 py-1.5"
          >
            Live Feed
          </Link>
          <Link
            href="/login"
            className="text-sm text-white/50 hover:text-white/80 transition-colors px-3 py-1.5"
          >
            Sign In
          </Link>
          <Link
            href="/register"
            className="text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-500 transition-colors px-4 py-1.5 rounded-md"
          >
            Get Started
          </Link>
        </div>
      </div>
    </nav>
  );
}

function HeroSection() {
  return (
    <section className="pt-40 pb-24">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h1 className="text-5xl sm:text-6xl font-bold tracking-tight text-white/90 leading-[1.1] mb-6">
          SEC filings, decoded.
        </h1>

        <p className="text-xl text-white/50 max-w-lg mx-auto leading-relaxed mb-10">
          Every 8-K filing turned into a plain-English briefing, seconds after
          it hits EDGAR. Free to use.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-md bg-indigo-600 hover:bg-indigo-500 text-white text-base font-semibold transition-colors"
          >
            Start tracking
          </Link>
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 px-7 py-3 rounded-md border border-white/[0.08] hover:border-white/[0.15] text-white/50 hover:text-white/70 text-base font-medium transition-colors"
          >
            View live feed
          </Link>
        </div>
      </div>
    </section>
  );
}

function ValueProps() {
  return (
    <section className="py-24 border-t border-white/[0.04]">
      <div className="mx-auto max-w-5xl px-6">
        <div className="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-16 md:gap-24 items-start">
          {/* Left: three value propositions */}
          <div className="space-y-12">
            <div>
              <p className="text-xl font-bold text-white/90 mb-2">
                Know before the crowd.
              </p>
              <p className="text-base text-white/50 leading-relaxed">
                The moment a company files with the SEC, you get the briefing.
                Not hours later. Seconds.
              </p>
            </div>

            <div className="border-t border-white/[0.04] pt-12">
              <p className="text-xl font-bold text-white/90 mb-2">
                Every filing, in plain English.
              </p>
              <p className="text-base text-white/50 leading-relaxed">
                Dense legalese distilled to what matters — the headline, the
                impact, the key dates. No noise.
              </p>
            </div>

            <div className="border-t border-white/[0.04] pt-12">
              <p className="text-xl font-bold text-white/90 mb-2">
                Your companies. Always watched.
              </p>
              <p className="text-base text-white/50 leading-relaxed">
                Build your watchlist. Get alerts. Every filing lands in your
                company&apos;s thread, so you never lose context.
              </p>
            </div>
          </div>

          {/* Right: logo mark + CTA */}
          <div className="hidden md:flex flex-col items-center text-center pt-4">
            <div className="w-48 h-48 rounded-2xl bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-6">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="Sensybull"
                className="w-28 h-28 invert opacity-90"
              />
            </div>
            <p className="text-2xl font-semibold text-white/90 mb-1">
              Sensybull
            </p>
            <p className="text-white/40 text-sm mb-4">Free without limits.</p>
            <Link
              href="/register"
              className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
            >
              Start tracking &rarr;
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Link href="/" className="flex items-center gap-2.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/logo.png"
              alt=""
              className="w-5 h-5 invert opacity-60"
            />
            <span className="text-sm text-white/50">Sensybull</span>
          </Link>
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link
              href="/terms"
              className="hover:text-white/60 transition-colors"
            >
              Terms
            </Link>
            <Link
              href="/privacy"
              className="hover:text-white/60 transition-colors"
            >
              Privacy
            </Link>
            <Link
              href="/disclaimer"
              className="hover:text-white/60 transition-colors"
            >
              Disclaimer
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/[0.04] text-center text-xs text-white/20">
          &copy; {new Date().getFullYear()} Sensybull, LLC. All rights
          reserved.
        </div>
      </div>
    </footer>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white antialiased">
      <Navbar />
      <main>
        <HeroSection />
        <ValueProps />
      </main>
      <Footer />
    </div>
  );
}
