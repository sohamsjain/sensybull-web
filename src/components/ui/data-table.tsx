import { cn } from "@/lib/utils";

/**
 * Table primitives for research data — not an admin grid. Rules are
 * hairlines, headers are labels rather than buttons-in-disguise, and
 * numbers are tabular so columns compare vertically at a glance.
 *
 * Wide tables scroll inside their own container; the page never does.
 */
export function Table({ className, ...props }: React.ComponentProps<"table">) {
  return (
    <div className="w-full overflow-x-auto">
      <table
        className={cn("w-full border-collapse text-label", className)}
        {...props}
      />
    </div>
  );
}

export function THead({ className, ...props }: React.ComponentProps<"thead">) {
  return (
    <thead
      className={cn(
        "[&_th]:sticky [&_th]:top-0 [&_th]:z-10 [&_th]:bg-canvas",
        className
      )}
      {...props}
    />
  );
}

export function TH({
  numeric = false,
  className,
  ...props
}: React.ComponentProps<"th"> & { numeric?: boolean }) {
  return (
    <th
      scope="col"
      className={cn(
        "eyebrow border-b border-line-subtle px-3 py-1.5 font-semibold",
        numeric ? "text-right" : "text-left",
        className
      )}
      {...props}
    />
  );
}

export function TR({ className, ...props }: React.ComponentProps<"tr">) {
  return (
    <tr
      className={cn(
        "border-b border-line-subtle last:border-0 hover:bg-surface-hover",
        className
      )}
      {...props}
    />
  );
}

export function TD({
  numeric = false,
  className,
  ...props
}: React.ComponentProps<"td"> & { numeric?: boolean }) {
  return (
    <td
      className={cn(
        "px-3 py-2 align-top text-ink-muted",
        numeric && "text-right font-mono tabular-nums text-ink",
        className
      )}
      {...props}
    />
  );
}
