"use client";

import { useCallback, useRef, useState, useSyncExternalStore } from "react";
import { createLocalPref } from "@/lib/local-pref";

// Wide enough for a ticker, a price, and two lines of headline before the
// reader has to touch the drag handle.
const DEFAULT_WIDTH = 360;
const MIN_WIDTH = 260;
const MAX_WIDTH = 480;
// Dragging narrower than this snaps the pane closed
const COLLAPSE_AT = 180;

const widthStore = createLocalPref("sb.watchlist.paneWidth", String(DEFAULT_WIDTH));
const collapsedStore = createLocalPref("sb.watchlist.paneCollapsed", "0");

function clamp(w: number): number {
  if (!Number.isFinite(w) || w === 0) return DEFAULT_WIDTH;
  return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, w));
}

/**
 * Width + collapsed state for the watchlist pane, persisted locally.
 * Returns pointer handlers to spread onto the drag handle between panes.
 */
export function usePaneWidth() {
  const storedWidth = clamp(
    Number(useSyncExternalStore(widthStore.subscribe, widthStore.get, widthStore.getServer))
  );
  const collapsed =
    useSyncExternalStore(collapsedStore.subscribe, collapsedStore.get, collapsedStore.getServer) === "1";
  // Live width while dragging; the store only sees the final value
  const [dragWidth, setDragWidth] = useState<number | null>(null);
  const dragState = useRef<{ startX: number; startWidth: number } | null>(null);

  const width = dragWidth ?? storedWidth;

  const collapse = useCallback(() => collapsedStore.set("1"), []);
  const expand = useCallback(() => collapsedStore.set("0"), []);
  const reset = useCallback(() => {
    setDragWidth(null);
    widthStore.set(String(DEFAULT_WIDTH));
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
    setDragWidth(clamp(drag.startWidth + (e.clientX - drag.startX)));
  }, []);

  const onPointerUp = useCallback(
    (e: React.PointerEvent<HTMLElement>) => {
      const drag = dragState.current;
      if (!drag) return;
      dragState.current = null;
      document.body.style.userSelect = "";
      document.body.style.cursor = "";
      setDragWidth(null);
      const raw = drag.startWidth + (e.clientX - drag.startX);
      if (raw < COLLAPSE_AT) {
        // Reopen later at the pre-drag width
        widthStore.set(String(drag.startWidth));
        collapse();
        return;
      }
      widthStore.set(String(clamp(raw)));
    },
    [collapse]
  );

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
