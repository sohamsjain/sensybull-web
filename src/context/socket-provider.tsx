"use client";

import {
  createContext,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import type { Socket } from "socket.io-client";
import type { ThesisAlert } from "@/types/api";
import { connectSocket, disconnectSocket } from "@/lib/socket";
import { getTokens } from "@/lib/api-client";
import { useAuth } from "@/hooks/use-auth";

interface SocketContextValue {
  /** The one shared `/feed` socket for the whole authenticated session. */
  socket: Socket | null;
  connected: boolean;
  /** Most recent thesis_alert (new object identity per event). */
  lastThesisAlert: ThesisAlert | null;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  connected: false,
  lastThesisAlert: null,
});

/** Access the session-wide socket, connection state, and last thesis alert. */
export const useSocket = () => useContext(SocketContext);

/**
 * Owns the single Socket.IO connection at the dashboard layout level, so it
 * survives page navigation instead of being torn down and recreated by each
 * page's hook. Feature hooks (useEvents, useWatchlistInbox, useCompanyEvents)
 * subscribe to this shared socket; only this provider connects/disconnects.
 *
 * Also the one place that listens for `thesis_alert` globally — a filing that
 * breaks a held thesis raises a toast on any page.
 */
export function SocketProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [socket, setSocket] = useState<Socket | null>(null);
  const [connected, setConnected] = useState(false);
  const [lastThesisAlert, setLastThesisAlert] = useState<ThesisAlert | null>(null);

  useEffect(() => {
    if (!user) return;

    const { access } = getTokens();
    const s = connectSocket(access);

    const onConnect = () => {
      setConnected(true);
      setSocket(s);
    };
    const onDisconnect = () => setConnected(false);
    const onThesis = (alert: ThesisAlert) => setLastThesisAlert(alert);

    s.on("connect", onConnect);
    s.on("disconnect", onDisconnect);
    s.on("thesis_alert", onThesis);

    return () => {
      s.off("connect", onConnect);
      s.off("disconnect", onDisconnect);
      s.off("thesis_alert", onThesis);
      disconnectSocket();
      setSocket(null);
      setConnected(false);
    };
  }, [user]);

  return (
    <SocketContext.Provider value={{ socket, connected, lastThesisAlert }}>
      {children}
      <ThesisAlertToaster alert={lastThesisAlert} />
    </SocketContext.Provider>
  );
}

// ── Toaster ──────────────────────────────────────────────────────────────
// Impact accent mirrors the ThesisBadge palette: restrained red for a break,
// amber for at-risk, emerald for a supportive filing.
const IMPACT_ACCENT: Record<string, string> = {
  breaks: "border-l-red-500",
  threatens: "border-l-amber-500",
  supports: "border-l-emerald-500",
  neutral: "border-l-slate-400",
};
const IMPACT_TITLE: Record<string, string> = {
  breaks: "Thesis broken",
  threatens: "Thesis at risk",
  supports: "Thesis supported",
  neutral: "Thesis update",
};

interface ActiveToast extends ThesisAlert {
  key: number;
}

function ThesisAlertToaster({ alert }: { alert: ThesisAlert | null }) {
  const [toasts, setToasts] = useState<ActiveToast[]>([]);
  const idRef = useRef(0);
  const router = useRouter();

  useEffect(() => {
    if (!alert) return;
    const key = ++idRef.current;
    // Cap the stack so a burst of events can't fill the screen.
    setToasts((prev) => [...prev.slice(-2), { ...alert, key }]);
    const timer = setTimeout(
      () => setToasts((prev) => prev.filter((t) => t.key !== key)),
      9000
    );
    return () => clearTimeout(timer);
  }, [alert]);

  const dismiss = (key: number) =>
    setToasts((prev) => prev.filter((t) => t.key !== key));

  if (toasts.length === 0) return null;

  return (
    <div className="fixed z-50 top-3 inset-x-3 flex flex-col gap-2 md:top-auto md:bottom-4 md:right-4 md:left-auto md:w-80">
      {toasts.map((t) => (
        <button
          key={t.key}
          onClick={() => {
            dismiss(t.key);
            router.push("/positions");
          }}
          className={`w-full text-left rounded-lg border border-slate-200 dark:border-white/[0.08] border-l-4 ${
            IMPACT_ACCENT[t.impact] ?? IMPACT_ACCENT.neutral
          } bg-white dark:bg-[#14161c] shadow-lg px-3 py-2.5 transition-colors hover:bg-slate-50 dark:hover:bg-[#1a1d25]`}
        >
          <div className="flex items-start gap-2">
            <div className="min-w-0 flex-1">
              <div className="text-[13px] font-semibold text-slate-900 dark:text-white/90">
                {IMPACT_TITLE[t.impact] ?? "Thesis update"}
                <span className="text-slate-400 dark:text-slate-500 font-normal">
                  {" · "}
                  {t.ticker || t.company_name}
                </span>
              </div>
              {t.rationale && (
                <div className="text-xs text-slate-600 dark:text-slate-300 mt-0.5 line-clamp-3 leading-relaxed">
                  {t.rationale}
                </div>
              )}
              <div className="text-[11px] text-indigo-600 dark:text-indigo-400 mt-1">
                View position →
              </div>
            </div>
            <span
              role="button"
              tabIndex={-1}
              onClick={(e) => {
                e.stopPropagation();
                dismiss(t.key);
              }}
              className="text-slate-400 dark:text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 text-sm leading-none shrink-0"
              aria-label="Dismiss"
            >
              ✕
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}
