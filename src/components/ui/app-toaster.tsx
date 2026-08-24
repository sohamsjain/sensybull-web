"use client";

/**
 * Minimal global toast. `toast({...})` can be called from anywhere (it's a
 * module-level emitter, no context needed) and survives client-side
 * navigation because <AppToaster/> mounts once in the root layout.
 */

import { useEffect, useRef, useState } from "react";

import { CloseIcon } from "@/components/ui/icons";

export interface ToastInput {
  title: string;
  description?: string;
  /** "success" gets the success accent; default is neutral. */
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
    <div className="fixed inset-x-3 top-3 z-[60] flex flex-col gap-2 md:top-auto md:right-4 md:bottom-4 md:left-auto md:w-80">
      {toasts.map((t) => (
        <div
          key={t.key}
          role="status"
          className={`w-full rounded-md border border-line border-l-2 bg-surface-raised px-3 py-2.5 shadow-overlay ${
            t.tone === "success" ? "border-l-success" : "border-l-line-strong"
          }`}
        >
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-label font-medium text-ink">{t.title}</div>
              {t.description && (
                <div className="mt-0.5 text-meta leading-relaxed text-ink-muted">
                  {t.description}
                </div>
              )}
            </div>
            <button
              onClick={() => dismiss(t.key)}
              className="shrink-0 text-ink-faint transition-colors hover:text-ink"
              aria-label="Dismiss"
            >
              <CloseIcon className="size-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
