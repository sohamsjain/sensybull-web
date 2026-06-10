"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  AlertPreferences,
  AlertPreferencesResponse,
  AlertNotification,
  PaginatedNotifications,
  AlertChannelsResponse,
} from "@/types/api";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

export function useAlertPreferences() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState<AlertPreferences | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const fetch_ = useCallback(async () => {
    if (!user) {
      setPreferences(null);
      return;
    }
    setLoading(true);
    try {
      const data = await api<AlertPreferencesResponse>("/alerts/preferences");
      setPreferences(data.preferences);
    } catch {}
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const update = async (
    updates: Partial<Pick<AlertPreferences, "enabled" | "max_tier" | "channels">>
  ) => {
    setSaving(true);
    try {
      const data = await api<AlertPreferencesResponse>("/alerts/preferences", {
        method: "PUT",
        body: JSON.stringify(updates),
      });
      setPreferences(data.preferences);
    } finally {
      setSaving(false);
    }
  };

  return { preferences, loading, saving, update, refetch: fetch_ };
}

export function useAlertNotifications() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<AlertNotification[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);

  const fetch_ = useCallback(
    async (p: number = 1) => {
      if (!user) {
        setNotifications([]);
        return;
      }
      setLoading(true);
      try {
        const data = await api<PaginatedNotifications>(
          `/alerts/notifications?page=${p}&per_page=20`
        );
        setNotifications(data.notifications || []);
        setTotal(data.total);
        setPage(p);
      } catch {}
      setLoading(false);
    },
    [user]
  );

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const goToPage = (p: number) => fetch_(p);

  return { notifications, total, page, loading, goToPage, refetch: () => fetch_(page) };
}

export function useAlertChannels() {
  const { user } = useAuth();
  const [channels, setChannels] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    api<AlertChannelsResponse>("/alerts/channels")
      .then((data) => setChannels(data.channels || []))
      .catch(() => {});
  }, [user]);

  return channels;
}
