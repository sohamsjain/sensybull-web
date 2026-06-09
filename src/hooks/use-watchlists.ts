"use client";

import { useState, useEffect, useCallback } from "react";
import type { Watchlist, PaginatedWatchlists } from "@/types/api";
import { api } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

export function useWatchlists() {
  const { user } = useAuth();
  const [watchlists, setWatchlists] = useState<Watchlist[]>([]);
  const [loading, setLoading] = useState(false);

  const fetch_ = useCallback(async () => {
    if (!user) {
      setWatchlists([]);
      return;
    }
    setLoading(true);
    try {
      const data = await api<PaginatedWatchlists>("/watchlists/");
      setWatchlists(data.watchlists || []);
    } catch {}
    setLoading(false);
  }, [user]);

  useEffect(() => {
    fetch_();
  }, [fetch_]);

  const create = async (name: string) => {
    const data = await api<{ watchlist: Watchlist }>("/watchlists/", {
      method: "POST",
      body: JSON.stringify({ name }),
    });
    await fetch_();
    return data.watchlist;
  };

  const remove = async (id: string) => {
    await api(`/watchlists/${id}`, { method: "DELETE" });
    await fetch_();
  };

  const addCompany = async (watchlistId: string, companyId: string) => {
    await api(`/watchlists/${watchlistId}/companies`, {
      method: "POST",
      body: JSON.stringify({ company_id: companyId }),
    });
    await fetch_();
  };

  const removeCompany = async (watchlistId: string, companyId: string) => {
    await api(`/watchlists/${watchlistId}/companies/${companyId}`, {
      method: "DELETE",
    });
    await fetch_();
  };

  return {
    watchlists,
    loading,
    refetch: fetch_,
    create,
    remove,
    addCompany,
    removeCompany,
  };
}
