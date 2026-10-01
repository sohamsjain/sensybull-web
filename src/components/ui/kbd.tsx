import { cn } from "@/lib/utils";

/**
 * A key cap. Shortcuts are part of the interface, so they are shown rather
 * than left to be discovered — and a cap the reader has to squint at defeats
 * the point, so it is sized to hold the 12px type comfortably.
 */
export function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-xs border border-line-subtle bg-canvas-sunken px-1.5 font-mono text-micro leading-none text-ink-faint",
        className
      )}
      {...props}
    />
  );
}
