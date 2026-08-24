"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { openCommandPalette } from "@/components/command-palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { CountBadge } from "@/components/ui/badge";
import { SearchIcon } from "@/components/ui/icons";
import { Tip, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { FontSizeToggle } from "./font-size-toggle";
import { NAV_ITEMS } from "./nav-items";
import { ProfileMenu } from "./profile-menu";

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
    <Tip label={label}>
      <Link
        href={href}
        aria-label={label}
        aria-current={active ? "page" : undefined}
        className={cn(
          "relative flex size-9 items-center justify-center rounded-md transition-colors",
          active
            ? "bg-brand text-brand-on"
            : "text-ink-faint hover:bg-surface-hover hover:text-ink"
        )}
      >
        {children}
        {badge != null && badge > 0 && (
          <CountBadge
            count={badge}
            className="absolute -top-1 -right-1 h-4 min-w-4 px-1 text-nano ring-2 ring-canvas-sunken"
          />
        )}
      </Link>
    </Tip>
  );
}

/**
 * The desktop rail: a persistent, icon-width column that never scrolls and
 * never moves. Workspace destinations at the top, settings at the foot,
 * search reachable from either by pointer or by ⌘K.
 */
export function NavRail() {
  const { user } = useAuth();
  const pathname = usePathname();
  const unread = useUnreadCount();

  if (!user) return null;

  const isActive = (href: string) => pathname?.startsWith(href) ?? false;
  const primary = NAV_ITEMS.filter((item) => !item.secondary);
  const secondary = NAV_ITEMS.filter((item) => item.secondary);

  return (
    <TooltipProvider delay={400}>
      <aside className="hidden w-13 shrink-0 flex-col items-center gap-1 border-r border-line-subtle bg-canvas-sunken py-2.5 md:flex">
        <Link
          href="/watchlist"
          aria-label="Sensybull"
          className="mb-1.5 flex size-9 items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt=""
            className="size-5 opacity-70 invert-0 dark:invert"
          />
        </Link>

        {primary.map(({ href, label, Icon, unread: showUnread }) => (
          <RailLink
            key={href}
            href={href}
            label={label}
            active={isActive(href)}
            badge={showUnread ? unread : undefined}
          >
            <Icon className="size-[18px]" />
          </RailLink>
        ))}

        <Tip label="Search  ⌘K">
          <button
            type="button"
            onClick={openCommandPalette}
            aria-label="Search companies and actions"
            className="flex size-9 items-center justify-center rounded-md text-ink-faint transition-colors hover:bg-surface-hover hover:text-ink"
          >
            <SearchIcon className="size-[18px]" />
          </button>
        </Tip>

        <div className="mt-auto flex flex-col items-center gap-1">
          {secondary.map(({ href, label, Icon }) => (
            <RailLink
              key={href}
              href={href}
              label={label}
              active={isActive(href)}
            >
              <Icon className="size-[18px]" />
            </RailLink>
          ))}
          <FontSizeToggle />
          <ThemeToggle />
          <ProfileMenu />
        </div>
      </aside>
    </TooltipProvider>
  );
}
