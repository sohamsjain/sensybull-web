import { cn } from "@/lib/utils";

/** Loading placeholder. Same shape as the content it stands in for. */
export function Skeleton({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("animate-pulse rounded-sm bg-surface-hover", className)}
      {...props}
    />
  );
}

/** Placeholder rows for a list: avatar + two lines, at list density. */
export function SkeletonRows({ rows = 6 }: { rows?: number }) {
  return (
    <div aria-hidden className="animate-pulse">
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="flex items-center gap-3 px-3 py-2.5">
          <div className="size-9 shrink-0 rounded-full bg-surface-hover" />
          <div className="min-w-0 flex-1 space-y-1.5">
            <div className="h-3 w-1/3 rounded-xs bg-surface-hover" />
            <div className="h-2.5 w-4/5 rounded-xs bg-surface-hover" />
          </div>
        </div>
      ))}
    </div>
  );
}
