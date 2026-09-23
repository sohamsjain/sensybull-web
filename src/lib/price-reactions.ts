import type { PriceReactionPoint, PriceReactions } from "@/types/events";
import { REACTION_INTERVALS } from "@/config/constants";

/**
 * The next session's opening print. The API measures this instead of
 * 5m–1h for a filing made outside market hours (evening, pre-market,
 * weekend, holiday), because each of those would read the same bar.
 */
export const OPEN_INTERVAL = "open";

export interface ReactionSlot {
  interval: string;
  /** Short label on the chip: "5m", "1d", "At open". */
  label: string;
  /** Tooltip lead-in: "5m after filing", "At the next open". */
  description: string;
  point: PriceReactionPoint | undefined;
}

/**
 * The reaction chips an event shows, in order.
 *
 * `intervals` is the API's `price_reaction_intervals`: the slots this event
 * will actually get, so a filing late in the session doesn't show a "—" for
 * a +1h that will never be measured. Payloads from before it shipped don't
 * carry it; for those, an "open" reaction implies the off-hours set, and
 * anything else gets the six classic slots.
 */
export function reactionSlots(
  reactions: PriceReactions,
  intervals?: string[] | null
): ReactionSlot[] {
  let order: readonly string[];
  if (intervals && intervals.length > 0) order = intervals;
  else if (reactions[OPEN_INTERVAL]) order = [OPEN_INTERVAL, "1d", "1w"];
  else order = REACTION_INTERVALS;

  return order.map((interval) => ({
    interval,
    label: interval === OPEN_INTERVAL ? "At open" : interval,
    description:
      interval === OPEN_INTERVAL ? "At the next open" : `${interval} after filing`,
    point: reactions[interval],
  }));
}
