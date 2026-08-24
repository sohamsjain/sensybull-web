"use client";

import { cn } from "@/lib/utils";

/**
 * A chip is a filter, not a button: it states what the view is currently
 * showing. Selected chips are solid accent so the active filter is
 * unmistakable at a glance; everything else stays quiet.
 */
export function Chip({
  selected = false,
  variant = "filter",
  className,
  ...props
}: React.ComponentProps<"button"> & {
  selected?: boolean;
  /** "filter" sits on a well; "quiet" is a bare text control in a header. */
  variant?: "filter" | "quiet";
}) {
  return (
    <button
      type="button"
      data-selected={selected || undefined}
      className={cn(
        "shrink-0 rounded-sm px-2.5 py-1 text-meta font-medium transition-colors",
        "disabled:pointer-events-none disabled:opacity-40",
        selected
          ? "bg-brand text-brand-on"
          : variant === "filter"
            ? "bg-surface-hover text-ink-muted hover:bg-surface-active hover:text-ink"
            : "text-ink-faint hover:bg-surface-hover hover:text-ink",
        className
      )}
      {...props}
    />
  );
}

/** Horizontal chip row that scrolls rather than wraps. */
export function ChipRow({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "flex items-center gap-1 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden",
        // Fades the last chip out at the edge so the row reads as scrollable
        "[mask-image:linear-gradient(to_right,black_calc(100%-2rem),transparent)]",
        className
      )}
      {...props}
    />
  );
}

/**
 * Segmented control — two or three mutually exclusive views of the same
 * list (All / Important). Denser and more decisive than chips.
 */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  label,
  className,
}: {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  label: string;
  className?: string;
}) {
  return (
    <div
      role="tablist"
      aria-label={label}
      className={cn(
        "flex shrink-0 rounded-md bg-surface-hover p-0.5",
        className
      )}
    >
      {options.map((option) => (
        <button
          key={option.value}
          role="tab"
          type="button"
          aria-selected={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "rounded-sm px-3 py-1 text-meta font-medium transition-colors",
            value === option.value
              ? "bg-brand text-brand-on"
              : "text-ink-muted hover:text-ink"
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}
