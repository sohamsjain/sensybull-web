import { cn } from "@/lib/utils";

/** A key cap. Shortcuts are part of the interface, so they are shown. */
export function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "inline-flex h-4 min-w-4 items-center justify-center rounded-xs border border-line-subtle bg-canvas-sunken px-1 font-mono text-micro leading-none text-ink-dim",
        className
      )}
      {...props}
    />
  );
}
