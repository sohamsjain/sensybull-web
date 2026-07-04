/** Category label. Plain muted text — no pill, no color; the taxonomy
 *  shouldn't compete with the headline. */
export function EventTypeTag({
  type,
  primary = false,
}: {
  type: string;
  primary?: boolean;
}) {
  if (primary) {
    return (
      <span className="shrink-0 text-slate-600 dark:text-slate-300 text-[10px] font-semibold uppercase tracking-wider">
        {type}
      </span>
    );
  }

  return (
    <span className="text-slate-400 dark:text-slate-500 text-[10px] tracking-wide">
      {type}
    </span>
  );
}
