"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import { useAuth } from "@/hooks/use-auth";
import { useUnreadCount } from "@/hooks/use-unread-count";
import { CountBadge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

import { NAV_ITEMS } from "./nav-items";
import { ProfileMenu } from "./profile-menu";

/**
 * Thumb-reachable primary navigation on mobile; the rail covers desktop.
 * Same destinations, same icons, same labels, same order — only the geometry
 * changes. Both read `NAV_ITEMS`, so the two can never drift.
 */
export function BottomTabs() {
  const { user } = useAuth();
  const pathname = usePathname();
  const unread = useUnreadCount();

  if (!user) return null;

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 flex h-16 items-stretch border-t border-line-subtle bg-canvas pb-[env(safe-area-inset-bottom)] md:hidden"
      aria-label="Primary"
    >
      {NAV_ITEMS.map(({ href, label, Icon, unread: showUnread }) => {
        const active = pathname?.startsWith(href) ?? false;
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-1.5 transition-colors",
              active ? "text-brand-ink" : "text-ink-faint"
            )}
          >
            <span className="relative">
              <Icon className="size-5" />
              {showUnread && unread > 0 && (
                <CountBadge
                  count={unread}
                  className="absolute -top-2 -right-3 h-[17px] min-w-[17px] px-1 text-micro"
                />
              )}
            </span>
            <span className="text-micro leading-none font-medium">{label}</span>
          </Link>
        );
      })}
      <div className="flex flex-1 items-center justify-center">
        <ProfileMenu side="top" />
      </div>
    </nav>
  );
}
