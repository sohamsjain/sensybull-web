"use client";

import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { useWatchlists } from "@/hooks/use-watchlists";
import type { Watchlist } from "@/types/api";
import { WatchlistCreate } from "@/components/watchlist/watchlist-create";
import { WatchlistManager } from "@/components/watchlist/watchlist-manager";

interface SidebarProps {
  selectedWatchlist: Watchlist | null;
  onSelectWatchlist: (wl: Watchlist | null) => void;
}

export function Sidebar({ selectedWatchlist, onSelectWatchlist }: SidebarProps) {
  const { user } = useAuth();
  const { watchlists, create, remove, addCompany, removeCompany, refetch } =
    useWatchlists();
  const [managingWlId, setManagingWlId] = useState<string | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  const managingWl = watchlists.find((wl) => wl.id === managingWlId) || null;

  if (!user) return null;

  const handleCreate = async (name: string) => {
    const wl = await create(name);
    setShowCreate(false);
    if (wl?.id) setManagingWlId(wl.id);
  };

  const handleDelete = async (id: string) => {
    if (selectedWatchlist?.id === id) onSelectWatchlist(null);
    if (managingWlId === id) setManagingWlId(null);
    await remove(id);
  };

  return (
    <aside className="w-56 border-r border-slate-700 p-4 shrink-0 overflow-y-auto flex flex-col">
      <h2 className="text-slate-500 text-xs uppercase tracking-wide mb-3 font-medium">
        Watchlists
      </h2>

      <button
        onClick={() => onSelectWatchlist(null)}
        className={`w-full text-left px-3 py-2 rounded text-sm mb-1 transition-colors ${
          !selectedWatchlist
            ? "bg-slate-700 text-white"
            : "text-slate-400 hover:bg-slate-800"
        }`}
      >
        All Events
      </button>

      {watchlists.map((wl) => (
        <div key={wl.id} className="group flex items-center mb-1">
          <button
            onClick={() => onSelectWatchlist(wl)}
            className={`flex-1 text-left px-3 py-2 rounded text-sm transition-colors ${
              selectedWatchlist?.id === wl.id
                ? "bg-slate-700 text-white"
                : "text-slate-400 hover:bg-slate-800"
            }`}
          >
            {wl.name}
            {wl.companies?.length > 0 && (
              <span className="text-slate-600 text-xs ml-1">
                ({wl.companies.length})
              </span>
            )}
          </button>
          <button
            onClick={() =>
              setManagingWlId(managingWlId === wl.id ? null : wl.id)
            }
            className="text-slate-600 hover:text-slate-300 px-1 text-xs opacity-0 group-hover:opacity-100"
            title="Manage"
          >
            ...
          </button>
        </div>
      ))}

      {/* Manage panel */}
      {managingWl && (
        <WatchlistManager
          watchlist={managingWl}
          onClose={() => setManagingWlId(null)}
          onAddCompany={(companyId) => addCompany(managingWl.id, companyId)}
          onRemoveCompany={(companyId) =>
            removeCompany(managingWl.id, companyId)
          }
          onDelete={() => handleDelete(managingWl.id)}
          onRefresh={refetch}
        />
      )}

      {/* Create form */}
      {showCreate ? (
        <WatchlistCreate
          onCreate={handleCreate}
          onCancel={() => setShowCreate(false)}
        />
      ) : (
        <button
          onClick={() => setShowCreate(true)}
          className="mt-2 text-slate-500 hover:text-slate-300 text-xs px-3 py-1"
        >
          + New Watchlist
        </button>
      )}
    </aside>
  );
}
