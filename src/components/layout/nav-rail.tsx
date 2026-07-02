"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { ThemeToggle } from "@/components/theme-toggle";
import { FontSizeToggle } from "./font-size-toggle";
import { ProfileMenu } from "./profile-menu";

function ChatsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.8}
        d="M8 10h8m-8 4h5m7-2c0 4.418-4.03 8-9 8a9.86 9.86 0 01-3.534-.65L3 21l1.35-3.6A7.6 7.6 0 013 12c0-4.418 4.03-8 9-8s8 3.582 8 8z"
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
        href="/chats"
        label="Chats"
        active={pathname?.startsWith("/chats") ?? false}
        badge={unread}
      >
        <ChatsIcon />
      </RailLink>
      <RailLink
        href="/feed"
        label="Feed"
        active={pathname?.startsWith("/feed") ?? false}
      >
        <FeedIcon />
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
