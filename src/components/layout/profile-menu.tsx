"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

/** Round profile avatar in the nav rail; opens account actions. */
export function ProfileMenu() {
  const { user, logout } = useAuth();
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
      <span className="w-8 h-8 rounded-full bg-violet-500/15 text-violet-700 dark:bg-violet-500/30 dark:text-violet-300 flex items-center justify-center text-[11px] font-semibold select-none">
        {initials}
      </span>
    );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        className="flex items-center justify-center w-10 h-10 rounded-full transition-shadow hover:ring-2 hover:ring-violet-500/40"
        aria-label={`Account: ${user.name}`}
        title={user.name}
      >
        {avatar}
      </DropdownMenuTrigger>
      <DropdownMenuContent side="right" align="end" className="min-w-52">
        <div className="px-1.5 py-1.5">
          <p className="text-sm font-medium text-slate-900 dark:text-slate-100 truncate">
            {user.name}
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
            {user.email}
          </p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>Log out</DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
