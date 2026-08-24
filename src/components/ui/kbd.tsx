import { cn } from "@/lib/utils";

/** A key cap. Shortcuts are part of the interface, so they are shown. */
export function Kbd({ className, ...props }: React.ComponentProps<"kbd">) {
  return (
    <kbd
      className={cn(
        "inline-flex h-[18px] min-w-[18px] items-center justify-center rounded-xs border border-line-subtle bg-surface px-1 font-mono text-micro leading-none text-ink-faint",
        className
      )}
      {...props}
    />
  );
}
