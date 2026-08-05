"use client";

import { useCallback, useMemo, useState } from "react";
import {
  EMPTY_SELECTION,
  allSelected,
  deselectAll,
  pruneSelection,
  selectAll,
  toggleSelection,
  type SelectionState,
} from "@/lib/selection";

/**
 * Multi-select state for the watchlist panel.
 *
 * Selection is an explicit mode rather than always-on checkboxes: the panel
 * is primarily a reading inbox, and a row's default job is to open a company.
 *
 * Two id lists, because they answer different questions:
 *  - `allIds`     every company on the watchlist — used to prune selections
 *                 for companies that no longer exist (removed here or in
 *                 another tab). Filtering must NOT drop selections, which is
 *                 why pruning can't use the visible list.
 *  - `visibleIds` the rows on screen, in display order — the domain of
 *                 shift-click ranges and "select all".
 */
export function useWatchlistSelection(
  allIds: readonly string[],
  visibleIds: readonly string[]
) {
  const [active, setActive] = useState(false);
  const [state, setState] = useState<SelectionState>(EMPTY_SELECTION);

  // Companies that disappeared can't be acted on; drop them during render so
  // the count never promises more than the next bulk action will do.
  const pruned = pruneSelection(state, allIds);
  if (pruned !== state) setState(pruned);

  const selected = pruned.selected;

  const enter = useCallback((seedId?: string) => {
    setActive(true);
    if (seedId) {
      setState((prev) =>
        prev.selected.has(seedId)
          ? prev
          : { selected: new Set([...prev.selected, seedId]), anchor: seedId }
      );
    }
  }, []);

  const exit = useCallback(() => {
    setActive(false);
    setState(EMPTY_SELECTION);
  }, []);

  const toggle = useCallback(
    (id: string, extend = false) => {
      setState((prev) => toggleSelection(prev, id, visibleIds, extend));
    },
    [visibleIds]
  );

  const allVisibleSelected = allSelected(pruned, visibleIds);

  const toggleAll = useCallback(() => {
    setState((prev) =>
      allSelected(prev, visibleIds)
        ? deselectAll(prev, visibleIds)
        : selectAll(prev, visibleIds)
    );
  }, [visibleIds]);

  /** Selected ids in watchlist order — stable input for the bulk endpoints. */
  const selectedIds = useMemo(
    () => allIds.filter((id) => selected.has(id)),
    [allIds, selected]
  );

  return {
    /** Selection mode is on: rows show checkboxes and clicking toggles them. */
    active,
    selected,
    selectedIds,
    count: selected.size,
    allVisibleSelected,
    enter,
    exit,
    toggle,
    toggleAll,
  };
}

export type WatchlistSelection = ReturnType<typeof useWatchlistSelection>;
