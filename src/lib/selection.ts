/**
 * List selection with shift-click range support.
 *
 * Kept free of React so the fiddly parts (range direction, a stale anchor,
 * ids disappearing from the list) are unit-testable. `ids` is always the
 * currently *visible* order — ranges follow what the user can see, not the
 * underlying data order.
 */

export interface SelectionState {
  /** Selected company ids. Never mutated in place — every helper returns a new set. */
  readonly selected: ReadonlySet<string>;
  /** Last individually-toggled id; the origin of the next shift-click range. */
  readonly anchor: string | null;
}

export const EMPTY_SELECTION: SelectionState = {
  selected: new Set<string>(),
  anchor: null,
};

/**
 * Toggle one id.
 *
 * With `extend` (shift-click) the inclusive range from the anchor to `id` is
 * *added* to the selection and the anchor moves to `id`, so repeated
 * shift-clicks keep extending from where you last landed. Falls back to a
 * plain toggle when there is no anchor or the anchor has been filtered out
 * of view — a range with an invisible endpoint would select rows the user
 * can't see.
 */
export function toggleSelection(
  state: SelectionState,
  id: string,
  ids: readonly string[],
  extend = false
): SelectionState {
  const from = state.anchor === null ? -1 : ids.indexOf(state.anchor);
  const to = ids.indexOf(id);

  if (extend && from !== -1 && to !== -1) {
    const [start, end] = from <= to ? [from, to] : [to, from];
    const selected = new Set(state.selected);
    for (const rangeId of ids.slice(start, end + 1)) selected.add(rangeId);
    return { selected, anchor: id };
  }

  const selected = new Set(state.selected);
  if (selected.has(id)) selected.delete(id);
  else selected.add(id);
  return { selected, anchor: id };
}

/** Select every visible id, keeping selections that scrolled out of view. */
export function selectAll(
  state: SelectionState,
  ids: readonly string[]
): SelectionState {
  const selected = new Set(state.selected);
  for (const id of ids) selected.add(id);
  return { selected, anchor: ids.length ? ids[ids.length - 1] : state.anchor };
}

/** Deselect every visible id, keeping selections that scrolled out of view. */
export function deselectAll(
  state: SelectionState,
  ids: readonly string[]
): SelectionState {
  const selected = new Set(state.selected);
  for (const id of ids) selected.delete(id);
  return { selected, anchor: null };
}

/**
 * Drop ids that no longer exist (removed companies, a narrowed filter's
 * results going away). Returns the same object when nothing changed, so
 * callers can bail out of a state update.
 */
export function pruneSelection(
  state: SelectionState,
  ids: readonly string[]
): SelectionState {
  const live = new Set(ids);
  const selected = new Set([...state.selected].filter((id) => live.has(id)));
  if (selected.size === state.selected.size) return state;
  return {
    selected,
    anchor: state.anchor && selected.has(state.anchor) ? state.anchor : null,
  };
}

/** True when every visible id is selected (and there is something to select). */
export function allSelected(
  state: SelectionState,
  ids: readonly string[]
): boolean {
  return ids.length > 0 && ids.every((id) => state.selected.has(id));
}
