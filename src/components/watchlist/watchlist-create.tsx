"use client";

import { useState } from "react";

interface WatchlistCreateProps {
  onCreate: (name: string) => Promise<void>;
  onCancel: () => void;
}

export function WatchlistCreate({ onCreate, onCancel }: WatchlistCreateProps) {
  const [name, setName] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;
    await onCreate(name.trim());
    setName("");
  };

  return (
    <form onSubmit={handleSubmit} className="mt-2">
      <input
        type="text"
        placeholder="Watchlist name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        autoFocus
        className="w-full bg-white dark:bg-[#0a0a12] border border-slate-300 dark:border-white/[0.1] rounded px-2 py-1.5 text-sm text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none focus:border-slate-500 dark:focus:border-violet-500/40"
      />
      <div className="flex gap-1 mt-1">
        <button
          type="submit"
          className="text-xs text-violet-400 hover:text-violet-300 px-2 py-1"
        >
          Create
        </button>
        <button
          type="button"
          onClick={onCancel}
          className="text-xs text-slate-400 dark:text-slate-500 px-2 py-1"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
