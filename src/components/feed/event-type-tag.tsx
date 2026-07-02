/** Category label. Neutral by design — color is reserved for materiality
 *  and sentiment, so the taxonomy doesn't shout. */
export function EventTypeTag({
  type,
  primary = false,
}: {
  type: string;
  primary?: boolean;
}) {
  if (primary) {
    return (
      <span className="shrink-0 px-2 py-0.5 rounded-full bg-slate-500/10 text-slate-600 dark:bg-white/[0.07] dark:text-slate-300 text-[10px] font-semibold uppercase tracking-wider">
        {type}
      </span>
    );
  }

  return (
    <span className="px-1.5 py-0.5 rounded-full bg-slate-500/[0.07] text-slate-500 dark:bg-white/[0.04] dark:text-slate-400 text-[10px] tracking-wide">
      {type}
    </span>
  );
}
