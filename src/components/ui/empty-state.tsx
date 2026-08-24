import { cn } from "@/lib/utils";

/**
 * Empty and zero-result states: a sentence that says what would be here and
 * what to do about it. No illustration, no icon in a circle.
 */
export function EmptyState({
  title,
  description,
  action,
  className,
  align = "center",
}: {
  title: string;
  description?: React.ReactNode;
  action?: React.ReactNode;
  className?: string;
  align?: "center" | "start";
}) {
  return (
    <div
      className={cn(
        "px-6 py-10",
        align === "center" ? "text-center" : "text-left",
        className
      )}
    >
      <p className="text-label font-medium text-ink">{title}</p>
      {description && (
        <p
          className={cn(
            "mt-1 text-meta leading-relaxed text-ink-faint",
            align === "center" && "mx-auto max-w-xs"
          )}
        >
          {description}
        </p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
