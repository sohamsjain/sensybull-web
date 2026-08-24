import { cn } from "@/lib/utils";

/**
 * A section is a titled group of information. It is separated by space and
 * a heading, not by a box — cards are reserved for things that are genuinely
 * a unit you could pick up and move.
 */
export function Section({
  title,
  action,
  className,
  children,
  ...props
}: React.ComponentProps<"section"> & {
  title?: string;
  action?: React.ReactNode;
}) {
  return (
    <section className={cn("min-w-0", className)} {...props}>
      {(title || action) && (
        <div className="mb-2 flex items-baseline justify-between gap-3">
          {title && <h3 className="eyebrow">{title}</h3>}
          {action}
        </div>
      )}
      {children}
    </section>
  );
}

/** Standalone heading for groups inside a list (e.g. search result groups). */
export function GroupLabel({
  className,
  ...props
}: React.ComponentProps<"p">) {
  return <p className={cn("eyebrow px-3 pt-3 pb-1", className)} {...props} />;
}

/**
 * A card, used sparingly: a bordered plane for something that is one
 * conceptual unit (a set of deal terms, a briefing entry). Never nested.
 */
export function Card({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "rounded-md border border-line-subtle bg-surface",
        className
      )}
      {...props}
    />
  );
}
