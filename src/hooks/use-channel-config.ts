"use client";

import { useState, useEffect, useCallback } from "react";
import type {
  ChannelConfig,
  ChannelConfigResponse,
  TelegramLinkResponse,
} from "@/types/api";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

export function useChannelConfig(channelName: string) {
  const { user } = useAuth();
  const [config, setConfig] = useState<Record<string, string> | null>(null);
  const [verified, setVerified] = useState(false);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetch_ = useCallback(async () => {
    if (!user || !channelName) return;
    setLoading(true);
    setError(null);
    try {
      const data = await api<ChannelConfig>(
        `/alerts/channels/${channelName}/config`
      );
      setConfig(data.config);
      setVerified(data.verified);
    } catch {
      setConfig(null);
      setVerified(false);
    }
    setLoading(false);
  }, [user, channelName]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const save = async (configData: Record<string, string>) => {
    setSaving(true);
    setError(null);
    try {
      const data = await api<ChannelConfigResponse>(
        `/alerts/channels/${channelName}/config`,
        {
          method: "PUT",
          body: JSON.stringify({ config: configData }),
        }
      );
      setConfig(data.config);
      setVerified(data.verified);
      return data;
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "Failed to save channel config.";
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    setSaving(true);
    setError(null);
    try {
      await api(`/alerts/channels/${channelName}/config`, {
        method: "DELETE",
      });
      setConfig(null);
      setVerified(false);
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to remove channel config.";
      setError(message);
      throw err;
    } finally {
      setSaving(false);
    }
  };

  return { config, verified, loading, saving, error, save, remove, refetch: fetch_ };
}

export function useTelegramLink() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const link = async (): Promise<TelegramLinkResponse> => {
    setLoading(true);
    setError(null);
    try {
      const data = await api<TelegramLinkResponse>("/alerts/telegram/link", {
        method: "POST",
      });
      return data;
    } catch (err) {
      const message =
        err instanceof Error
          ? err.message
          : "Failed to generate Telegram link.";
      setError(message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { link, loading, error };
}
