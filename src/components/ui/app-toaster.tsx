"use client";

/**
 * Minimal global toast. `toast({...})` can be called from anywhere (it's a
 * module-level emitter, no context needed) and survives client-side
 * navigation because <AppToaster/> mounts once in the root layout.
 */

import { useEffect, useRef, useState } from "react";

export interface ToastInput {
  title: string;
  description?: string;
  /** "success" gets the emerald accent; default is neutral. */
  tone?: "success" | "neutral";
  durationMs?: number;
}

type Listener = (t: ToastInput) => void;
let listener: Listener | null = null;
const queue: ToastInput[] = [];

export function toast(input: ToastInput): void {
  if (listener) listener(input);
  else queue.push(input); // fired before mount (e.g. right before a redirect)
}

interface ActiveToast extends ToastInput {
  key: number;
}

export function AppToaster() {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const idRef = useRef(0);
  const timersRef = useRef<Map<number, ReturnType<typeof setTimeout>>>(new Map());

  useEffect(() => {
    const show = (input: ToastInput) => {
      const key = ++idRef.current;
      // Cap the stack so bursts can't fill the screen.
      setToasts((prev) => [...prev.slice(-2), { ...input, key }]);
      const timer = setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.key !== key));
        timersRef.current.delete(key);
      }, input.durationMs ?? 6000);
      timersRef.current.set(key, timer);
    };
    listener = show;
    while (queue.length) show(queue.shift()!);
    const timers = timersRef.current;
    return () => {
      listener = null;
      timers.forEach(clearTimeout);
      timers.clear();
    };
  }, []);

  const dismiss = (key: number) =>
    setToasts((prev) => prev.filter((t) => t.key !== key));

  if (toasts.length === 0) return null;

  return (
    <div className="fixed z-[60] top-3 inset-x-3 flex flex-col gap-2 md:top-auto md:bottom-4 md:right-4 md:left-auto md:w-80">
      {toasts.map((t) => (
        <div
          key={t.key}
          role="status"
          className={`w-full rounded-lg border border-slate-200 dark:border-white/[0.08] border-l-4 ${
            t.tone === "success" ? "border-l-emerald-500" : "border-l-slate-400"
          } bg-white dark:bg-[#14161c] shadow-lg px-3 py-2.5`}
        >
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-slate-900 dark:text-white/90">
                {t.title}
              </div>
              {t.description && (
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 leading-relaxed">
                  {t.description}
                </div>
              )}
            </div>
            <button
              onClick={() => dismiss(t.key)}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-sm leading-none shrink-0"
              aria-label="Dismiss"
            >
              ✕
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
