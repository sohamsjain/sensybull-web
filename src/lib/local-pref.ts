"use client";

/**
 * A tiny localStorage-backed external store, compatible with
 * useSyncExternalStore. Keeps every subscribed component in sync when the
 * value changes anywhere in the app.
 */
export function createLocalPref(key: string, fallback: string) {
  const listeners = new Set<() => void>();
  return {
    subscribe(cb: () => void) {
      listeners.add(cb);
      return () => {
        listeners.delete(cb);
      };
    },
    get(): string {
      try {
        return localStorage.getItem(key) ?? fallback;
      } catch {
        return fallback;
      }
    },
    getServer(): string {
      return fallback;
    },
    set(value: string) {
      try {
        localStorage.setItem(key, value);
      } catch {}
      listeners.forEach((cb) => cb());
    },
  };
}
