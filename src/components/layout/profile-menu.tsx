"use client";

import { useState } from "react";
import { useTheme } from "next-themes";
import { useAuth } from "@/hooks/use-auth";
import { useFontScale } from "@/hooks/use-font-scale";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/**
 * Round profile avatar; opens account actions. Theme and font-size entries
 * are included so the settings stay reachable on mobile, where the rail's
 * dedicated toggles are hidden.
 */
export function ProfileMenu({ side = "right" }: { side?: "right" | "top" }) {
  const { user, logout } = useAuth();
  const { resolvedTheme, setTheme } = useTheme();
  const { scale, cycle } = useFontScale();
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

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex size-9 items-center justify-center rounded-md transition-colors hover:bg-surface-hover"
        aria-label={`Account: ${user.name}`}
        title={user.name}
      >
        {avatar}
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align="end" className="min-w-52">
        <div className="px-1.5 py-1.5">
          <p className="truncate text-label font-medium text-ink">
            {user.name}
          </p>
          <p className="truncate text-meta text-ink-faint">
            {user.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          className="md:hidden"
          onClick={() =>
            setTheme(resolvedTheme === "dark" ? "light" : "dark")
          }
        >
          {resolvedTheme === "dark" ? "Light theme" : "Dark theme"}
        </DropdownMenuItem>
        <DropdownMenuItem className="md:hidden" onClick={cycle}>
          Text size: {scale.label}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="md:hidden" />
        <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
