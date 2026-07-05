"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { ThemeToggle } from "@/components/theme-toggle";
import { FontSizeToggle } from "./font-size-toggle";
import { ProfileMenu } from "./profile-menu";

function WatchlistIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M11.48 3.5c.2-.4.84-.4 1.04 0l2.12 4.3c.08.16.23.27.4.29l4.75.69c.45.07.63.62.3.94l-3.43 3.35c-.13.12-.19.3-.16.48l.81 4.73c.08.44-.39.78-.79.57l-4.25-2.23a.55.55 0 00-.51 0l-4.25 2.23c-.4.21-.87-.13-.79-.57l.81-4.73a.55.55 0 00-.16-.48L3.94 9.72a.55.55 0 01.3-.94l4.75-.69a.55.55 0 00.4-.29l2.09-4.3z"
      />
    </svg>
  );
}

function FeedIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M4 6h16M4 10h16M4 14h10M4 18h7"
      />
    </svg>
  );
}

function PositionsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M8 7V5.5A1.5 1.5 0 019.5 4h5A1.5 1.5 0 0116 5.5V7m4 0H4a1 1 0 00-1 1v10a1 1 0 001 1h16a1 1 0 001-1V8a1 1 0 00-1-1zM3 12h18"
      />
    </svg>
  );
}

function MoversIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M3 17l5.5-5.5 4 4L21 7m0 0h-5m5 0v5"
      />
    </svg>
  );
}

function CalendarIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M6.75 3v2.25M17.25 3v2.25M3.75 18.75V7.5a2.25 2.25 0 012.25-2.25h12a2.25 2.25 0 012.25 2.25v11.25m-16.5 0a2.25 2.25 0 002.25 2.25h12a2.25 2.25 0 002.25-2.25m-16.5 0v-7.5a2.25 2.25 0 012.25-2.25h12a2.25 2.25 0 012.25 2.25v7.5"
      />
    </svg>
  );
}

function BellIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M14.857 17.082a23.848 23.848 0 005.454-1.31A8.967 8.967 0 0118 9.75V9A6 6 0 006 9v.75a8.967 8.967 0 01-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 01-5.714 0m5.714 0a3 3 0 11-5.714 0"
      />
    </svg>
  );
}

function RailLink({
  href,
  label,
  active,
  badge,
  children,
}: {
  href: string;
  label: string;
  active: boolean;
  badge?: number;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className={`relative flex items-center justify-center w-10 h-10 rounded-xl transition-colors ${
        active
          ? "bg-slate-200 dark:bg-white/[0.08] text-slate-900 dark:text-white"
          : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-white/[0.05]"
      }`}
    >
      {children}
      {badge != null && badge > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[17px] h-[17px] rounded-full bg-indigo-500 text-white text-[10px] font-bold flex items-center justify-center px-1 leading-none">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}

export function NavRail() {
  const { user } = useAuth();
  const pathname = usePathname();
  const unread = useUnreadCount();

  if (!user) return null;

  return (
    <aside className="hidden md:flex w-14 shrink-0 flex-col items-center gap-1.5 py-3 border-r border-slate-200 dark:border-white/[0.04] bg-slate-100 dark:bg-[#07080c]">
      <RailLink
        href="/watchlist"
        label="Watchlist"
        active={pathname?.startsWith("/watchlist") ?? false}
        badge={unread}
      >
        <WatchlistIcon />
      </RailLink>
      <RailLink
        href="/positions"
        label="Positions"
        active={pathname?.startsWith("/positions") ?? false}
      >
        <PositionsIcon />
      </RailLink>
      <RailLink
        href="/feed"
        label="Feed"
        active={pathname?.startsWith("/feed") ?? false}
      >
        <FeedIcon />
      </RailLink>
      <RailLink
        href="/movers"
        label="Movers"
        active={pathname?.startsWith("/movers") ?? false}
      >
        <MoversIcon />
      </RailLink>
      <RailLink
        href="/calendar"
        label="Catalyst calendar"
        active={pathname?.startsWith("/calendar") ?? false}
      >
        <CalendarIcon />
      </RailLink>

      <div className="mt-auto flex flex-col items-center gap-1.5">
        <RailLink
          href="/alerts"
          label="Alerts"
          active={pathname?.startsWith("/alerts") ?? false}
        >
          <BellIcon />
        </RailLink>
        <FontSizeToggle className="w-10 h-10" />
        <ThemeToggle className="w-10 h-10" />
        <ProfileMenu />
      </div>
    </aside>
  );
}
