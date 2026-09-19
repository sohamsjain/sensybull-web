"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";

import { useAuth } from "@/hooks/use-auth";
import { useFontScale } from "@/hooks/use-font-scale";
import { openShortcuts } from "@/components/shortcuts-sheet";
import {
  BellIcon,
  FontSizeIcon,
  KeyboardIcon,
  MoonIcon,
  SunIcon,
} from "@/components/ui/icons";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/**
 * The account menu, and the home of every preference: theme, text size,
 * alert preferences, the shortcut list, and sign-out. One place, so the
 * navbar carries a single control for all of it.
 */
export function ProfileMenu() {
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { scale, cycle } = useFontScale();
  const router = useRouter();
  const [imgFailed, setImgFailed] = useState(false);

  if (!user) return null;

  const initials = user.name
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

  const avatar =
    user.picture_url && !imgFailed ? (
      /* eslint-disable-next-line @next/next/no-img-element */
      <img
        src={user.picture_url}
        alt={user.name}
        referrerPolicy="no-referrer"
        onError={() => setImgFailed(true)}
        className="size-7 rounded-full object-cover"
      />
    ) : (
      <span className="flex size-7 select-none items-center justify-center rounded-full bg-brand-soft text-micro font-semibold text-brand-ink">
        {initials}
      </span>
    );

  const dark = resolvedTheme === "dark";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-9 items-center justify-center rounded-md transition-colors hover:bg-surface-hover"
        aria-label={`Account: ${user.name}`}
        title={user.name}
      >
        {avatar}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="bottom" align="end" className="min-w-56">
        <div className="px-1.5 py-1.5">
          <p className="truncate text-label font-medium text-ink">{user.name}</p>
          <p className="truncate text-meta text-ink-faint">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setTheme(dark ? "light" : "dark")}>
          {dark ? <SunIcon /> : <MoonIcon />}
          {dark ? "Light theme" : "Dark theme"}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={cycle}>
          <FontSizeIcon />
          Text size: {scale.label}
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => router.push("/alerts")}>
          <BellIcon />
          Alert preferences
        </DropdownMenuItem>
        <DropdownMenuItem onClick={openShortcuts}>
          <KeyboardIcon />
          Keyboard shortcuts
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
