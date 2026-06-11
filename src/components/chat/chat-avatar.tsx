"use client";

const AVATAR_COLORS = [
  "bg-blue-500/30 text-blue-300",
  "bg-emerald-500/30 text-emerald-300",
  "bg-violet-500/30 text-violet-300",
  "bg-amber-500/30 text-amber-300",
  "bg-rose-500/30 text-rose-300",
  "bg-cyan-500/30 text-cyan-300",
  "bg-indigo-500/30 text-indigo-300",
  "bg-teal-500/30 text-teal-300",
];

function colorFor(key: string): string {
  let hash = 0;
  for (let i = 0; i < key.length; i++) {
    hash = (hash * 31 + key.charCodeAt(i)) | 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

export function ChatAvatar({
  ticker,
  name,
  size = "md",
}: {
  ticker: string | null;
  name: string;
  size?: "sm" | "md";
}) {
  const label = ticker || name.slice(0, 2).toUpperCase();
  const sizeClass =
    size === "sm" ? "w-9 h-9 text-[10px]" : "w-12 h-12 text-xs";
  return (
    <div
      className={`${sizeClass} ${colorFor(label)} rounded-full flex items-center justify-center font-mono font-bold shrink-0 select-none`}
      aria-hidden="true"
    >
      {label.slice(0, 4)}
    </div>
  );
}
