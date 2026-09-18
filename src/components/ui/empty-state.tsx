import { cn } from "@/lib/utils";
import type { IconProps } from "@/components/ui/icons";

/**
 * Empty, zero-result and error states.
 *
 * Three jobs, in order: say what would be here, say why it isn't, and offer
 * the one thing that would fix it. A state that only says "No results" makes
 * the reader guess whether the app is broken, whether they typed something
 * wrong, or whether there is genuinely nothing — so every one of these gets
 * a next step where a next step exists.
 *
 * The optional glyph is a quiet marker, not an illustration: it sits in
 * `ink-dim` at the reading size, so it orients the eye without turning a
 * dead end into a decorated one.
 */
export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  className,
  align = "center",
}: {
  icon?: React.ComponentType<IconProps>;
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
      {Icon && (
        <Icon
          aria-hidden="true"
          className={cn(
            "mb-3 size-6 text-ink-dim",
            align === "center" && "mx-auto"
          )}
        />
      )}
      <p className="text-body font-semibold text-ink">{title}</p>
      {description && (
        <p
          className={cn(
            "mt-1.5 text-label leading-relaxed text-ink-muted",
            align === "center" && "mx-auto max-w-sm"
          )}
        >
          {description}
        </p>
      )}
      {action && (
        <div
          className={cn(
            "mt-5 flex flex-wrap items-center gap-2",
            align === "center" ? "justify-center" : "justify-start"
          )}
        >
          {action}
        </div>
      )}
    </div>
  );
}
