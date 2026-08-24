import { cn } from "@/lib/utils";

const TONES = {
  neutral: "bg-surface-hover text-ink-muted",
  brand: "bg-brand-soft text-brand-ink",
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  danger: "bg-danger-soft text-danger",
  info: "bg-info-soft text-info",
} as const;

/** Small status label. Colour is reserved for status — never for taxonomy. */
export function Badge({
  tone = "neutral",
  className,
  ...props
}: React.ComponentProps<"span"> & { tone?: keyof typeof TONES }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-xs px-1.5 py-0.5 text-micro font-medium",
        TONES[tone],
        className
      )}
      {...props}
    />
  );
}

/**
 * Unread count. Accent while it wants attention, muted once the company is
 * muted — the number still matters, the colour no longer does.
 */
export function CountBadge({
  count,
  muted = false,
  className,
}: {
  count: number;
  muted?: boolean;
  className?: string;
}) {
  if (count <= 0) return null;
  return (
    <span
      className={cn(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1.5 text-micro font-semibold leading-none tabular-nums",
        muted ? "bg-surface-active text-ink-muted" : "bg-brand text-brand-on",
        className
      )}
    >
      {count > 99 ? "99+" : count}
    </span>
  );
}

/**
 * The Important marker. Priority is binary in this product — this is the
 * only place red appears outside negative price data.
 */
export function ImportantMarker({ className }: { className?: string }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 text-micro font-semibold uppercase tracking-[0.07em] text-danger",
        className
      )}
    >
      <span className="size-1.5 rounded-full bg-danger" />
      Important
    </span>
  );
}

/** Connection state. A dot, a title, no animation. */
export function StatusDot({
  live,
  className,
  title,
}: {
  live: boolean;
  className?: string;
  title?: string;
}) {
  return (
    <span
      title={title ?? (live ? "Live" : "Connecting…")}
      className={cn(
        "size-1.5 shrink-0 rounded-full",
        live ? "bg-success" : "bg-ink-dim",
        className
      )}
    />
  );
}

/** Metadata that reads as a label rather than prose: form types, sources. */
export function MetaLabel({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      className={cn(
        "text-micro font-medium uppercase tracking-[0.06em] text-ink-faint",
        className
      )}
      {...props}
    />
  );
}
