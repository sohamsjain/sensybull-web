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
        className="w-8 h-8 rounded-full object-cover"
      />
    ) : (
      <span className="w-8 h-8 rounded-full bg-indigo-500/15 text-indigo-700 dark:bg-indigo-500/30 dark:text-indigo-300 flex items-center justify-center text-[11px] font-semibold select-none">
        {initials}
      </span>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center justify-center w-10 h-10 rounded-full transition-shadow hover:ring-2 hover:ring-indigo-500/40"
        aria-label={`Account: ${user.name}`}
        title={user.name}
      >
        {avatar}
      </DropdownMenuTrigger>
      <DropdownMenuContent side={side} align="end" className="min-w-52">
        <div className="px-1.5 py-1.5">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
            {user.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
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
          Font size: {scale.label}
        </DropdownMenuItem>
        <DropdownMenuSeparator className="md:hidden" />
        <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
