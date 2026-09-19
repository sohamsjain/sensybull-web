"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { openCommandPalette } from "@/components/command-palette";
import { ThemeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { CountBadge } from "@/components/ui/badge";
import { IconButton } from "@/components/ui/icon-button";
import { SearchIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

import { NAV_ITEMS } from "./nav-items";
import { NavSearch } from "./nav-search";
import { ProfileMenu } from "./profile-menu";

/**
 * The app's one bar: wordmark, the two destinations, a company search, and
 * the account menu with every preference folded into it.
 *
 * Horizontal rather than a rail because the product has two places to be
 * and one thing to look up — a 76px column spent most of its height empty.
 * Same bar on every width: on phones the destinations keep their labels
 * and the search collapses to a glyph that opens the ⌘K palette.
 */
export function TopNav() {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const unread = useUnreadCount();

  const items = NAV_ITEMS.filter((item) => !item.authed || user);

  return (
    <header className="shrink-0 border-b border-line-subtle bg-canvas">
      <div className="flex h-12 items-center gap-1 px-3 sm:px-4">
        <Link
          href={user ? "/watchlist" : "/feed"}
          aria-label="Sensybull home"
          className="mr-2 flex h-8 shrink-0 items-center gap-2 rounded-md px-1"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo.png"
            alt=""
            className="h-5 opacity-80 invert-0 dark:invert"
          />
          <span className="hidden text-label font-semibold tracking-tight text-ink sm:inline">
            Sensybull
          </span>
        </Link>

        <nav aria-label="Primary" className="flex items-center gap-0.5">
          {items.map(({ href, label, hint, unread: showUnread }) => {
            const active = pathname?.startsWith(href) ?? false;
            return (
              <Link
                key={href}
                href={href}
                title={hint}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex h-8 items-center gap-1.5 rounded-md px-2.5 text-label font-medium transition-colors",
                  active
                    ? "bg-brand-soft text-brand-ink"
                    : "text-ink-muted hover:bg-surface-hover hover:text-ink"
                )}
              >
                {label}
                {showUnread && unread > 0 && <CountBadge count={unread} />}
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-1.5">
          <NavSearch className="hidden sm:flex" />
          <IconButton
            size="lg"
            className="sm:hidden"
            onClick={openCommandPalette}
            title="Search for a company"
            aria-label="Search for a company"
          >
            <SearchIcon />
          </IconButton>

          {user ? (
            <ProfileMenu />
          ) : loading ? (
            /* Hold the slot so the bar doesn't jump when auth resolves */
            <span className="size-9" aria-hidden />
          ) : (
            <>
              <ThemeToggle size="md" />
              <Link href="/login">
                <Button size="sm">Sign in</Button>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
