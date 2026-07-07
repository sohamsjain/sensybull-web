"use client";

import { useRef, useState } from "react";
import type { AnalystMessage } from "@/types/api";
import { askAnalyst } from "@/hooks/use-positions";

/**
 * Per-position analyst chat. The conversation lives in component state and
 * is sent whole with each turn — the API is stateless. Inline inside the
 * position card so the thesis, the verdicts, and the interrogation of both
 * share one surface.
 */
export function AnalystPanel({ positionId }: { positionId: string }) {
  const [messages, setMessages] = useState<AnalystMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  const send = async (text: string) => {
    const content = text.trim();
    if (!content || busy) return;
    const next: AnalystMessage[] = [...messages, { role: "user", content }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await askAnalyst(positionId, next);
      setMessages([...next, { role: "assistant", content: res.reply }]);
    } catch (err) {
      // The API names the cause (e.g. "AI is not configured on this
      // server") — show it rather than a generic shrug.
      setError(
        err instanceof Error && err.message
          ? err.message
          : "The analyst is unavailable right now"
      );
      // Leave the user's message in place so retry resends it.
    } finally {
      setBusy(false);
      requestAnimationFrame(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
      });
    }
  };

  const retry = () => {
    const last = messages[messages.length - 1];
    if (last?.role !== "user") return;
    setMessages(messages.slice(0, -1));
    void send(last.content);
  };

  const starters = [
    "What's the strongest evidence against my thesis?",
    "What would have to be true for this to break?",
    "Draft the bear case.",
  ];

  return (
    <div className="mt-3 border-t border-slate-100 dark:border-white/[0.05] pt-2.5">
      <div ref={scrollRef} className="max-h-72 overflow-y-auto space-y-2 pr-1">
        {messages.length === 0 && (
          <div className="flex flex-wrap gap-1.5">
            {starters.map((s) => (
              <button
                key={s}
                onClick={() => void send(s)}
                disabled={busy}
                className="px-2.5 py-1 rounded-full text-[11px] text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-white/[0.05] hover:bg-slate-200 dark:hover:bg-white/[0.08] disabled:opacity-50 transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
        {messages.map((m, i) => (
          <div
            key={i}
            className={m.role === "user" ? "flex justify-end" : "flex justify-start"}
          >
            <p
              className={`max-w-[88%] px-2.5 py-1.5 rounded-lg text-[13px] leading-relaxed whitespace-pre-wrap ${
                m.role === "user"
                  ? "bg-indigo-500/10 dark:bg-indigo-500/20 text-slate-800 dark:text-slate-100"
                  : "bg-slate-100 dark:bg-white/[0.05] text-slate-700 dark:text-slate-200"
              }`}
            >
              {m.content}
            </p>
          </div>
        ))}
        {busy && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500 animate-pulse">
            Reading the filings…
          </p>
        )}
        {error && (
          <p className="text-[11px] text-slate-400 dark:text-slate-500">
            {error}.{" "}
            <button
              onClick={retry}
              className="text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              Retry
            </button>
          </p>
        )}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send(input);
        }}
        className="mt-2 flex gap-1.5"
      >
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask about this position — grounded in its filings"
          className="flex-1 min-w-0 px-2.5 py-1.5 rounded-lg text-[13px] bg-slate-100 dark:bg-white/[0.05] text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none focus:ring-1 focus:ring-indigo-400/60"
        />
        <button
          type="submit"
          disabled={busy || !input.trim()}
          className="px-2.5 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 text-white hover:bg-indigo-500 disabled:opacity-40"
        >
          Ask
        </button>
      </form>
    </div>
  );
}
