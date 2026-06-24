export function EventTypeTag({
  type,
  primary = false,
}: {
  type: string;
  primary?: boolean;
}) {
  if (primary) {
    return (
      <span className="shrink-0 px-2 py-0.5 bg-violet-500/20 text-violet-300 rounded text-xs font-semibold uppercase tracking-wide">
        {type}
      </span>
    );
  }

  return (
    <span className="px-1.5 py-0.5 bg-violet-500/10 text-violet-400/70 rounded text-xs">
      {type}
    </span>
  );
}
