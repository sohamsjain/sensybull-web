"use client";

import Link from "next/link";
import {
  Zap,
  Brain,
  MessageSquare,
  Bell,
  ArrowRight,
  FileText,
  Shield,
  Clock,
} from "lucide-react";

function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2">
      <div className="w-7 h-7 rounded-md bg-violet-600 flex items-center justify-center">
        <span className="text-white font-semibold text-sm">S</span>
      </div>
      <span className="text-[15px] font-medium text-white/90">
        Sensybull
      </span>
    </Link>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#0a0a0f]/90 backdrop-blur-sm">
      <div className="mx-auto max-w-5xl px-6 h-14 flex items-center justify-between">
        <Logo />
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
            className="text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-1.5 rounded-md"
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
    <section className="pt-36 pb-20">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <p className="text-sm text-white/40 mb-8 tracking-wide">
          Monitoring SEC filings in real-time
        </p>

        <h1 className="text-3xl sm:text-4xl md:text-[2.75rem] font-semibold tracking-tight text-white/90 leading-[1.2] mb-6">
          Never miss a market-moving SEC filing
        </h1>

        <p className="text-base text-white/45 max-w-xl mx-auto leading-relaxed mb-10">
          AI-powered intelligence on every 8-K filing, delivered the moment it
          hits EDGAR. Track your companies, get instant briefings, act before the
          crowd.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          <Link
            href="/register"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
          >
            Get Started Free
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/feed"
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md border border-white/[0.08] hover:border-white/[0.15] text-white/50 hover:text-white/70 text-sm font-medium transition-colors"
          >
            View Live Feed
          </Link>
        </div>
      </div>
    </section>
  );
}

function TrustBar() {
  return (
    <section className="border-y border-white/[0.04]">
      <div className="mx-auto max-w-5xl px-6 py-8 flex flex-wrap items-center justify-center gap-x-10 gap-y-3 text-sm text-white/35">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4" />
          <span>Direct from SEC EDGAR</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4" />
          <span>Sub-minute latency</span>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4" />
          <span>AI-generated briefings</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4" />
          <span>Free to use</span>
        </div>
      </div>
    </section>
  );
}

const FEATURES = [
  {
    icon: Zap,
    title: "Real-Time Filing Feed",
    description:
      "Every 8-K filing, the instant it hits EDGAR. Significance-rated and categorized so you see what matters first.",
  },
  {
    icon: Brain,
    title: "AI-Powered Briefings",
    description:
      "Every filing automatically summarized. Key catalysts, sentiment analysis, and deal terms extracted in seconds.",
  },
  {
    icon: MessageSquare,
    title: "Company Chat Threads",
    description:
      "Track filings like messages. Each company gets its own thread so you never lose context on what happened and when.",
  },
  {
    icon: Bell,
    title: "Smart Alerts",
    description:
      "Get notified the moment your watchlist companies file. Filter by significance tier. Email, push, or both.",
  },
];

function FeaturesSection() {
  return (
    <section className="py-24">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white/90 mb-3">
            Everything you need to track SEC filings
          </h2>
          <p className="text-white/40 text-base max-w-xl mx-auto">
            From raw filings to actionable intelligence in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-px bg-white/[0.04] rounded-lg overflow-hidden border border-white/[0.06]">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="p-6 bg-[#0a0a0f]"
            >
              <feature.icon className="w-5 h-5 text-white/25 mb-4" />
              <h3 className="text-[15px] font-medium text-white/85 mb-2">
                {feature.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const STEPS = [
  {
    step: "01",
    title: "Build your watchlist",
    description:
      "Search by ticker or company name. Add the companies you follow to personalized watchlists.",
  },
  {
    step: "02",
    title: "Get AI briefings instantly",
    description:
      "Every new filing is analyzed by AI within seconds. Key points, catalysts, and sentiment — extracted automatically.",
  },
  {
    step: "03",
    title: "Never miss what matters",
    description:
      "Real-time push notifications for your watchlist. Filter by significance so only high-impact filings reach you.",
  },
];

function HowItWorksSection() {
  return (
    <section className="py-24 border-t border-white/[0.04]">
      <div className="mx-auto max-w-4xl px-6">
        <div className="text-center mb-14">
          <h2 className="text-2xl sm:text-3xl font-semibold text-white/90 mb-3">
            How it works
          </h2>
          <p className="text-white/40 text-base">
            Three steps. Zero noise. Complete coverage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((item) => (
            <div key={item.step}>
              <span className="text-4xl font-semibold text-white/[0.06] block mb-3">
                {item.step}
              </span>
              <h3 className="text-[15px] font-medium text-white/85 mb-2">
                {item.title}
              </h3>
              <p className="text-white/40 text-sm leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function CtaSection() {
  return (
    <section className="py-24 border-t border-white/[0.04]">
      <div className="mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-2xl sm:text-3xl font-semibold text-white/90 mb-3">
          Start tracking SEC filings today
        </h2>
        <p className="text-white/40 text-base mb-10">
          Free to use. No credit card required. Set up your watchlist in under a
          minute.
        </p>
        <Link
          href="/register"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-md bg-violet-600 hover:bg-violet-500 text-white text-sm font-medium transition-colors"
        >
          Create Free Account
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06]">
      <div className="mx-auto max-w-5xl px-6 py-10">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo />
          <div className="flex items-center gap-6 text-sm text-white/30">
            <Link
              href="/terms"
              className="hover:text-white/60 transition-colors"
            >
              Terms of Use
            </Link>
            <Link
              href="/privacy"
              className="hover:text-white/60 transition-colors"
            >
              Privacy Policy
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
        <TrustBar />
        <FeaturesSection />
        <HowItWorksSection />
        <CtaSection />
      </main>
      <Footer />
    </div>
  );
}
