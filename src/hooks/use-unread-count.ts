"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/hooks/use-auth";
import { api } from "@/lib/api-client";
import type { ChatsResponse } from "@/types/api";

/** Total unread chat count for nav badges; refreshes on navigation. */
export function useUnreadCount(): number {
  const { user } = useAuth();
  const pathname = usePathname();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (!user) return;
    let cancelled = false;
    api<ChatsResponse>("/chats/")
      .then((data) => {
        if (!cancelled) setUnread(data.total_unread || 0);
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [user, pathname]);

  return unread;
}
