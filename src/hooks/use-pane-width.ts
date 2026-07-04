"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const WIDTH_KEY = "sb.watchlist.paneWidth";
const COLLAPSED_KEY = "sb.watchlist.paneCollapsed";

const DEFAULT_WIDTH = 320;
const MIN_WIDTH = 240;
const MAX_WIDTH = 480;
// Dragging narrower than this snaps the pane closed
const COLLAPSE_AT = 180;

/**
 * Width + collapsed state for the watchlist pane, persisted locally.
 * Returns pointer handlers to spread onto the drag handle between panes.
 */
export function usePaneWidth() {
  const [width, setWidth] = useState(DEFAULT_WIDTH);
  const [collapsed, setCollapsed] = useState(false);
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);

  // Restore persisted state after mount (avoids SSR hydration mismatch)
  useEffect(() => {
    const stored = Number(window.localStorage.getItem(WIDTH_KEY));
    if (Number.isFinite(stored) && stored > 0) {
      setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, stored)));
    }
    if (window.localStorage.getItem(COLLAPSED_KEY) === "1") {
      setCollapsed(true);
    }
  }, []);

  const persistWidth = (w: number) => {
    try {
      window.localStorage.setItem(WIDTH_KEY, String(w));
    } catch {}
  };

  const persistCollapsed = (c: boolean) => {
    try {
      window.localStorage.setItem(COLLAPSED_KEY, c ? "1" : "0");
    } catch {}
  };

  const collapse = useCallback(() => {
    setCollapsed(true);
    persistCollapsed(true);
  }, []);

  const expand = useCallback(() => {
    setCollapsed(false);
    persistCollapsed(false);
  }, []);

  const onPointerDown = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      e.preventDefault();
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
      dragState.current = { startX: e.clientX, startWidth: width };
      document.body.style.userSelect = "none";
      document.body.style.cursor = "col-resize";
    },
    [width]
  );

  const onPointerMove = useCallback((e: React.PointerEvent<HTMLElement>) => {
    const drag = dragState.current;
    if (!drag) return;
    const raw = drag.startWidth + (e.clientX - drag.startX);
    setWidth(Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, raw)));
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const drag = dragState.current;
      if (!drag) return;
      dragState.current = null;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      const raw = drag.startWidth + (e.clientX - drag.startX);
      if (raw < COLLAPSE_AT) {
        setWidth(drag.startWidth); // reopen at the pre-drag width
        collapse();
        return;
      }
      const clamped = Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, raw));
      setWidth(clamped);
      persistWidth(clamped);
    },
    [collapse]
  );

  const reset = useCallback(() => {
    setWidth(DEFAULT_WIDTH);
    persistWidth(DEFAULT_WIDTH);
  }, []);

  return {
    width,
    collapsed,
    collapse,
    expand,
    reset,
    handleProps: {
      onPointerDown,
      onPointerMove,
      onPointerUp,
      onDoubleClick: reset,
    },
  };
}
