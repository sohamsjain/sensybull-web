"use client";

import { SearchIcon, CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

/**
 * Search is a primary way through this product, so it looks like a place to
 * type rather than a decorated control: a sunken well, a leading glyph, and
 * a clear affordance once there is something to clear.
 */
export function SearchInput({
  value,
  onValueChange,
  onClear,
  className,
  hint,
  ...props
}: Omit<React.ComponentProps<"input">, "onChange" | "value"> & {
  value: string;
  onValueChange: (value: string) => void;
  onClear?: () => void;
  /** Trailing shortcut hint, e.g. a "/" key cap. */
  hint?: React.ReactNode;
}) {
  return (
    <div
      className={cn(
        "flex h-8 min-w-0 items-center gap-2 rounded-md border border-line-subtle bg-canvas-sunken px-2.5",
        "transition-colors focus-within:border-brand/60",
        className
      )}
    >
      <SearchIcon className="size-3.5 shrink-0 text-ink-faint" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onValueChange(e.target.value)}
        className="min-w-0 flex-1 bg-transparent text-label text-ink outline-none placeholder:text-ink-faint [&::-webkit-search-cancel-button]:hidden"
        {...props}
      />
      {value ? (
        <button
          type="button"
          onClick={() => {
            onValueChange("");
            onClear?.();
          }}
          aria-label="Clear search"
          className="shrink-0 text-ink-faint transition-colors hover:text-ink"
        >
          <CloseIcon className="size-3.5" />
        </button>
      ) : (
        hint
      )}
    </div>
  );
}
