"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { openCommandPalette } from "@/components/command-palette";
import { openShortcuts } from "@/components/shortcuts-sheet";
import { ThemeToggle } from "@/components/theme-toggle";
import { CountBadge } from "@/components/ui/badge";
import { KeyboardIcon, SearchIcon } from "@/components/ui/icons";
import { Tip, TooltipProvider } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

import { FontSizeToggle } from "./font-size-toggle";
import { NAV_ITEMS } from "./nav-items";
import { ProfileMenu } from "./profile-menu";

/**
 * One destination in the rail: a glyph with its name underneath.
 *
 * The name is not a nicety. Three destinations do not justify hiding their
 * labels behind a hover delay — the 40px of width that buys is worth less
 * than a reader knowing where they are without experimenting.
 */
function RailLink({
  href,
  label,
  hint,
  active,
  badge,
  children,
}: {
  href: string;
  label: string;
  hint?: string;
  active: boolean;
  badge?: number;
  children: React.ReactNode;
}) {
  const link = (
    <Link
      href={href}
      aria-current={active ? "page" : undefined}
      className={cn(
        "group relative flex w-full flex-col items-center gap-1 rounded-md px-1 py-2 transition-colors",
        active
          ? "bg-brand-soft text-brand-ink"
          : "text-ink-faint hover:bg-surface-hover hover:text-ink"
      )}
    >
      <span className="relative">
        {children}
        {badge != null && badge > 0 && (
          <CountBadge
            count={badge}
            className="absolute -top-1.5 -right-2.5 h-[17px] min-w-[17px] px-1 text-micro ring-2 ring-canvas-sunken"
          />
        )}
      </span>
      <span
        className={cn(
          "text-micro leading-none font-medium",
          active ? "text-brand-ink" : "text-ink-faint group-hover:text-ink"
        )}
      >
        {label}
      </span>
    </Link>
  );

  // The label already says what it is; the tooltip is there to say what the
  // screen is *for*, which is the part a first-time reader is missing.
  return hint ? <Tip label={hint}>{link}</Tip> : link;
}

/** A rail control that isn't a destination: search, shortcuts. */
function RailAction({
  label,
  hint,
  onClick,
  children,
}: {
  label: string;
  hint: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <Tip label={hint}>
      <button
        type="button"
        onClick={onClick}
        className="group flex w-full flex-col items-center gap-1 rounded-md px-1 py-2 text-ink-faint transition-colors hover:bg-surface-hover hover:text-ink"
      >
        {children}
        <span className="text-micro leading-none font-medium group-hover:text-ink">
          {label}
        </span>
      </button>
    </Tip>
  );
}

/**
 * The desktop rail: a persistent column that never scrolls and never moves.
 * Workspace destinations at the top, settings at the foot, search reachable
 * from either by pointer or by ⌘K.
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
      <aside
        aria-label="Primary"
        className="hidden w-19 shrink-0 flex-col items-center gap-0.5 border-r border-line-subtle bg-canvas-sunken px-1.5 py-3 md:flex"
      >
        <Link
          href="/watchlist"
          aria-label="Sensybull home"
          className="mb-2 flex h-8 items-center justify-center"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt=""
            className="h-5 opacity-70 invert-0 dark:invert"
          />
        </Link>

        {primary.map(({ href, label, hint, Icon, unread: showUnread }) => (
          <RailLink
            key={href}
            href={href}
            label={label}
            hint={hint}
            active={isActive(href)}
            badge={showUnread ? unread : undefined}
          >
            <Icon className="size-[18px]" />
          </RailLink>
        ))}

        <RailAction
          label="Search"
          hint="Search companies and actions  ⌘K"
          onClick={openCommandPalette}
        >
          <SearchIcon className="size-[18px]" />
        </RailAction>

        <div className="mt-auto flex w-full flex-col items-center gap-0.5">
          {secondary.map(({ href, label, hint, Icon }) => (
            <RailLink
              key={href}
              href={href}
              label={label}
              hint={hint}
              active={isActive(href)}
            >
              <Icon className="size-[18px]" />
            </RailLink>
          ))}

          <RailAction
            label="Keys"
            hint="Keyboard shortcuts  ?"
            onClick={openShortcuts}
          >
            <KeyboardIcon className="size-[18px]" />
          </RailAction>

          <div className="mt-1.5 flex items-center gap-0.5 border-t border-line-subtle pt-2.5">
            <FontSizeToggle />
            <ThemeToggle />
            <ProfileMenu />
          </div>
        </div>
      </aside>
    </TooltipProvider>
  );
}
