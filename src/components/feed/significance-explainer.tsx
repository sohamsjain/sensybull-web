import type { FilingItem } from "@/types/events";
import type { Significance } from "@/config/constants";

const LEVEL_MEANING: Record<Significance, string> = {
  High: "the kind of event that typically moves the stock",
  Medium: "materially relevant, though rarely market-moving on its own",
  Low: "routine or administrative",
};

/** One-line "why this rating" note shown in expanded cards/messages. */
export function SignificanceExplainer({
  level,
  items,
}: {
  level: Significance;
  items?: FilingItem[];
}) {
  const itemNote =
    items && items.length > 0
      ? ` Filed under ${items
          .slice(0, 3)
          .map((it) => `Item ${it.number} (${it.category})`)
          .join(", ")}.`
      : "";
  return (
    <p className="mt-2.5 text-[11px] text-slate-400 dark:text-slate-500 leading-relaxed">
      <span className="font-semibold">
        Why {level === "Medium" ? "MED" : level.toUpperCase()}?
      </span>{" "}
      Rated {LEVEL_MEANING[level]}.{itemNote}
    </p>
  );
}
