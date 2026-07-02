"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-unread-count";
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

function Tab({
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
      className={`relative flex flex-col items-center justify-center gap-0.5 flex-1 h-full transition-colors ${
        active
          ? "text-indigo-600 dark:text-indigo-400"
          : "text-slate-500 dark:text-slate-400"
      }`}
      aria-current={active ? "page" : undefined}
    >
      <span className="relative">
        {children}
        {badge != null && badge > 0 && (
          <span className="absolute -top-1 -right-2 min-w-[16px] h-[16px] rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center px-1 leading-none">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </span>
      <span className="text-[10px] font-medium">{label}</span>
    </Link>
  );
}

/** Thumb-reachable primary navigation on mobile; the rail covers desktop. */
export function BottomTabs() {
  const { user } = useAuth();
  const pathname = usePathname();
  const unread = useUnreadCount();

  if (!user) return null;

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-40 h-14 pb-[env(safe-area-inset-bottom)] flex items-stretch border-t border-slate-200 dark:border-white/[0.06] bg-white/95 dark:bg-[#0b0d12]/95 backdrop-blur"
      aria-label="Primary"
    >
      <Tab
        href="/chats"
        label="Chats"
        active={pathname?.startsWith("/chats") ?? false}
        badge={unread}
      >
        <ChatsIcon />
      </Tab>
      <Tab
        href="/feed"
        label="Feed"
        active={pathname?.startsWith("/feed") ?? false}
      >
        <FeedIcon />
      </Tab>
      <Tab
        href="/alerts"
        label="Alerts"
        active={pathname?.startsWith("/alerts") ?? false}
      >
        <BellIcon />
      </Tab>
      <div className="flex-1 flex items-center justify-center">
        <ProfileMenu side="top" />
      </div>
    </nav>
  );
}
