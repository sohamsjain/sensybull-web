import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function timeAgo(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const seconds = Math.floor(
    (Date.now() - new Date(dateStr).getTime()) / 1000
  );
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
  // Past a day, an exact date is more useful than "3d ago"
  const d = new Date(dateStr);
  const now = new Date();
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}

/** Full absolute datetime for tooltips: "Jul 1, 2026, 5:44 PM". */
export function fullDateTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export type MarketSession = "pre-market" | "after-hours" | null;

/**
 * Where a timestamp falls relative to regular US market hours
 * (9:30–16:00 ET, Mon–Fri). Weekends count as after-hours.
 */
export function marketSession(
  dateStr: string | null | undefined
): MarketSession {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    hour12: false,
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
  }).formatToParts(d);
  const get = (type: string) =>
    parts.find((p) => p.type === type)?.value ?? "";
  const weekday = get("weekday");
  if (weekday === "Sat" || weekday === "Sun") return "after-hours";
  const minutes =
    (parseInt(get("hour"), 10) % 24) * 60 + parseInt(get("minute"), 10);
  if (minutes < 9 * 60 + 30) return "pre-market";
  if (minutes >= 16 * 60) return "after-hours";
  return null;
}

/**
 * Add thousands separators to bare digit runs of 5+ characters, so
 * "1250000" → "1,250,000" and "$43400000" → "$43,400,000" while leaving
 * years, small numbers, and already-formatted values untouched.
 */
export function formatDealValue(value: string): string {
  return value.replace(/\d{5,}(?:\.\d+)?/g, (m) =>
    Number(m).toLocaleString("en-US", { maximumFractionDigits: 2 })
  );
}

/** Short chat-list timestamp: time today, weekday this week, date otherwise. */
export function chatTimestamp(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  const d = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  if (d >= startOfToday) {
    return d.toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
  }
  const daysAgo = (startOfToday.getTime() - d.getTime()) / 86400000;
  // <= 1 so a message at exactly yesterday 00:00 still reads "Yesterday"
  if (daysAgo <= 1) return "Yesterday";
  if (daysAgo < 6) return d.toLocaleDateString("en-US", { weekday: "short" });
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

/** Day separator label for conversation views. */
export function dayLabel(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfDay = new Date(d.getFullYear(), d.getMonth(), d.getDate());
  const diffDays = Math.round(
    (startOfToday.getTime() - startOfDay.getTime()) / 86400000
  );
  if (diffDays === 0) return "Today";
  if (diffDays === 1) return "Yesterday";
  return d.toLocaleDateString("en-US", {
    month: "long",
    day: "numeric",
    ...(d.getFullYear() !== now.getFullYear() ? { year: "numeric" } : {}),
  });
}

export function messageTime(dateStr: string | null | undefined): string {
  if (!dateStr) return "";
  return new Date(dateStr).toLocaleTimeString("en-US", {
    hour: "numeric",
    minute: "2-digit",
  });
}

export function formatCatalystDate(dateStr: string | null): string {
  if (!dateStr) return "TBD";
  try {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  } catch {
    return dateStr;
  }
}
