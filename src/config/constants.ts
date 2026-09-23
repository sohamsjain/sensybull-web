/** The six classic reaction slots — the fallback for payloads without
 *  `price_reaction_intervals`. Slot choice lives in lib/price-reactions. */
export const REACTION_INTERVALS = ["5m", "15m", "30m", "1h", "1d", "1w"] as const;
