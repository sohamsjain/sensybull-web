"use client";

import Link from "next/link";
import { getAppUrl } from "@/lib/urls";
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
    <Link href="/" className="flex items-center gap-2.5 group">
      <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-violet-500/20">
        <span className="text-white font-bold text-sm">S</span>
      </div>
      <span className="text-lg font-semibold text-white tracking-tight">
        Sensybull
      </span>
    </Link>
  );
}

function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 border-b border-white/[0.06] bg-[#0a0a0f]/80 backdrop-blur-xl">
      <div className="mx-auto max-w-6xl px-6 h-16 flex items-center justify-between">
        <Logo />
        <div className="flex items-center gap-3">
          <Link
            href={getAppUrl("/feed")}
            className="hidden sm:inline-flex text-sm text-slate-400 hover:text-white transition-colors px-3 py-1.5"
          >
            Live Feed
          </Link>
          <Link
            href={getAppUrl("/login")}
            className="text-sm text-slate-300 hover:text-white transition-colors px-3 py-1.5"
          >
            Sign In
          </Link>
          <Link
            href={getAppUrl("/register")}
            className="text-sm font-medium text-white bg-violet-600 hover:bg-violet-500 transition-colors px-4 py-2 rounded-lg"
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
    <section className="relative pt-40 pb-24 overflow-hidden">
      <div className="absolute inset-0 hero-glow pointer-events-none" />
      <div className="absolute top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-violet-600/[0.07] blur-[120px] pointer-events-none" />

      <div className="relative mx-auto max-w-4xl px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-violet-500/20 bg-violet-500/[0.08] text-violet-300 text-xs font-medium mb-8">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
          Monitoring SEC filings in real-time
        </div>

        <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold tracking-tight text-white leading-[1.08] mb-6">
          Never miss a{" "}
          <span className="bg-gradient-to-r from-violet-400 via-purple-400 to-indigo-400 bg-clip-text text-transparent">
            market-moving
          </span>{" "}
          SEC filing
        </h1>

        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed mb-10">
          AI-powered intelligence on every 8-K filing, delivered the moment it
          hits EDGAR. Track your companies, get instant briefings, act before the
          crowd.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={getAppUrl("/register")}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-base transition-all hover:shadow-lg hover:shadow-violet-600/25"
          >
            Get Started Free
            <ArrowRight className="w-4 h-4" />
          </Link>
          <Link
            href={getAppUrl("/feed")}
            className="inline-flex items-center gap-2 px-7 py-3.5 rounded-xl border border-white/10 hover:border-white/20 text-slate-300 hover:text-white font-medium text-base transition-all hover:bg-white/[0.04]"
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
    <section className="border-y border-white/[0.04] bg-white/[0.01]">
      <div className="mx-auto max-w-5xl px-6 py-10 flex flex-wrap items-center justify-center gap-x-12 gap-y-4 text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-violet-400" />
          <span>Direct from SEC EDGAR</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock className="w-4 h-4 text-violet-400" />
          <span>Sub-minute latency</span>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-violet-400" />
          <span>AI-generated briefings</span>
        </div>
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-violet-400" />
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
    <section className="py-28 relative">
      <div className="absolute top-0 right-0 w-[500px] h-[500px] rounded-full bg-indigo-600/[0.04] blur-[100px] pointer-events-none" />

      <div className="relative mx-auto max-w-6xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            Everything you need to track SEC filings
          </h2>
          <p className="text-slate-400 text-lg max-w-2xl mx-auto">
            From raw filings to actionable intelligence in seconds. Built for
            investors who need an edge.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {FEATURES.map((feature) => (
            <div
              key={feature.title}
              className="group p-7 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] hover:border-white/[0.1] transition-all duration-300"
            >
              <div className="w-11 h-11 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center mb-5 group-hover:bg-violet-500/15 transition-colors">
                <feature.icon className="w-5 h-5 text-violet-400" />
              </div>
              <h3 className="text-xl font-semibold text-white mb-2.5">
                {feature.title}
              </h3>
              <p className="text-slate-400 leading-relaxed text-[15px]">
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
      "Every new filing is analyzed by AI within seconds. Key points, catalysts, and sentiment—extracted automatically.",
  },
  {
    step: "03",
    title: "Never miss what matters",
    description:
      "Real-time push notifications for your watchlist. Filter by significance so only high-impact filings hit your phone.",
  },
];

function HowItWorksSection() {
  return (
    <section className="py-28 border-t border-white/[0.04]">
      <div className="mx-auto max-w-5xl px-6">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
            How it works
          </h2>
          <p className="text-slate-400 text-lg">
            Three steps. Zero noise. Complete coverage.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {STEPS.map((item) => (
            <div key={item.step} className="relative">
              <span className="text-5xl font-bold text-violet-500/10 block mb-4">
                {item.step}
              </span>
              <h3 className="text-lg font-semibold text-white mb-2">
                {item.title}
              </h3>
              <p className="text-slate-400 text-[15px] leading-relaxed">
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
    <section className="py-28 relative">
      <div className="absolute inset-0 bg-gradient-to-b from-violet-600/[0.05] to-transparent pointer-events-none" />

      <div className="relative mx-auto max-w-3xl px-6 text-center">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">
          Start tracking SEC filings today
        </h2>
        <p className="text-slate-400 text-lg mb-10">
          Free to use. No credit card required. Set up your watchlist in under a
          minute.
        </p>
        <Link
          href={getAppUrl("/register")}
          className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-violet-600 hover:bg-violet-500 text-white font-medium text-base transition-all hover:shadow-lg hover:shadow-violet-600/25"
        >
          Create Free Account
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
    </section>
  );
}

function Footer() {
  return (
    <footer className="border-t border-white/[0.06] bg-[#0a0a0f]">
      <div className="mx-auto max-w-6xl px-6 py-12">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          <Logo />
          <div className="flex items-center gap-6 text-sm text-slate-500">
            <Link
              href="/terms"
              className="hover:text-slate-300 transition-colors"
            >
              Terms of Use
            </Link>
            <Link
              href="/privacy"
              className="hover:text-slate-300 transition-colors"
            >
              Privacy Policy
            </Link>
            <Link
              href="/disclaimer"
              className="hover:text-slate-300 transition-colors"
            >
              Disclaimer
            </Link>
          </div>
        </div>
        <div className="mt-8 pt-6 border-t border-white/[0.04] text-center text-xs text-slate-600">
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
