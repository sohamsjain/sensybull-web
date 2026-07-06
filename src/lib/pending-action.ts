/**
 * Intent-preserving deep links: when an anonymous visitor lands on an action
 * URL (e.g. /add/MU), the intended action is stored here, the user goes
 * through login/signup, and the action's own page resumes and executes it
 * exactly once.
 *
 * Deliberately generic — `type` + `params` can describe any future post-auth
 * action (track analyst, follow thesis, follow ETF, ...). Each action type
 * owns its execution: the page at `resumePath` is the single place that
 * consumes the action, so refreshes and back-navigation can't double-fire.
 * The backend endpoints invoked must themselves be idempotent; that is the
 * real "never twice" guarantee.
 */

import type { ShareAttribution } from "@/lib/share";

const STORAGE_KEY = "sensybull:pending-action";
const VERSION = 1;
const TTL_MS = 60 * 60 * 1000; // stale intents (abandoned signups) expire after 1h

export type PendingActionType = "add_watchlist";

export interface PendingAction {
  v: number;
  type: PendingActionType;
  params: Record<string, string>;
  attribution?: ShareAttribution;
  /** Internal path to return to after auth; the page there executes the action. */
  resumePath: string;
  createdAt: number;
}

/** True for site-relative paths only — rejects protocol-relative and absolute URLs. */
export function isSafeInternalPath(path: string | null | undefined): path is string {
  return (
    typeof path === "string" &&
    path.startsWith("/") &&
    !path.startsWith("//") &&
    !path.includes("\\") &&
    !path.includes("\n")
  );
}

export function setPendingAction(
  action: Omit<PendingAction, "v" | "createdAt">
): void {
  if (typeof window === "undefined") return;
  if (!isSafeInternalPath(action.resumePath)) return;
  try {
    const record: PendingAction = { ...action, v: VERSION, createdAt: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(record));
  } catch {
    // Storage full/blocked — the flow still works, it just won't survive
    // a full-page auth redirect.
  }
}

export function getPendingAction(): PendingAction | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const action = JSON.parse(raw) as PendingAction;
    if (
      action.v !== VERSION ||
      typeof action.type !== "string" ||
      !isSafeInternalPath(action.resumePath) ||
      Date.now() - action.createdAt > TTL_MS
    ) {
      clearPendingAction();
      return null;
    }
    return action;
  } catch {
    clearPendingAction();
    return null;
  }
}

export function clearPendingAction(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

/**
 * Where to land after a successful login/signup: an explicit ?next= wins,
 * then a stored pending action's resume path, then the caller's default.
 * Only site-relative paths are honored (open-redirect safe).
 */
export function resolvePostAuthPath(fallback: string): string {
  if (typeof window === "undefined") return fallback;
  const next = new URLSearchParams(window.location.search).get("next");
  if (isSafeInternalPath(next)) return next;
  const pending = getPendingAction();
  if (pending) return pending.resumePath;
  return fallback;
}
