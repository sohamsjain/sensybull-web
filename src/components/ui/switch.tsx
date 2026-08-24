"use client";

import { Switch as SwitchPrimitive } from "@base-ui/react/switch";

import { cn } from "@/lib/utils";

/** On/off control. One shape for every setting in the product. */
export function Switch({
  className,
  ...props
}: SwitchPrimitive.Root.Props) {
  return (
    <SwitchPrimitive.Root
      className={cn(
        "relative h-4.5 w-8 shrink-0 rounded-full border border-transparent bg-surface-active transition-colors",
        "data-checked:bg-brand data-disabled:opacity-50",
        className
      )}
      {...props}
    >
      <SwitchPrimitive.Thumb className="block size-3.5 translate-x-0.5 rounded-full bg-brand-on shadow-popover ring-1 ring-line transition-transform data-checked:translate-x-4" />
    </SwitchPrimitive.Root>
  );
}
