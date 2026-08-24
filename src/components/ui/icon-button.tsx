"use client";

import { cn } from "@/lib/utils";

const SIZES = {
  sm: "size-6 [&_svg]:size-3.5",
  md: "size-7 [&_svg]:size-4",
  lg: "size-9 [&_svg]:size-[18px]",
} as const;

/**
 * Icon-only control for headers, rails and rows. Quiet by default: the
 * shape appears on hover, and the accent fill is reserved for a control
 * that is currently *on*.
 */
export function IconButton({
  size = "md",
  active = false,
  className,
  ...props
}: React.ComponentProps<"button"> & {
  size?: keyof typeof SIZES;
  active?: boolean;
}) {
  return (
    <button
      type="button"
      aria-pressed={active || undefined}
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-sm transition-colors",
        "disabled:pointer-events-none disabled:opacity-40",
        active
          ? "bg-brand text-brand-on"
          : "text-ink-faint hover:bg-surface-hover hover:text-ink",
        SIZES[size],
        className
      )}
      {...props}
    />
  );
}
