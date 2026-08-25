"use client";

import { Tooltip as TooltipPrimitive } from "@base-ui/react/tooltip";

import { cn } from "@/lib/utils";

/**
 * Tooltip for icon-only controls. Deliberately plain: a label, appearing
 * after a beat, gone the moment the pointer leaves. Anything that needs a
 * sentence of explanation belongs in the interface, not in a tooltip.
 */
export function Tip({
  label,
  side = "right",
  delay = 400,
  children,
  className,
}: {
  label: React.ReactNode;
  side?: "top" | "right" | "bottom" | "left";
  delay?: number;
  /** A single element — the trigger props are merged onto it. */
  children: React.ReactElement;
  className?: string;
}) {
  return (
    <TooltipPrimitive.Root>
      <TooltipPrimitive.Trigger delay={delay} render={children} />
      <TooltipPrimitive.Portal>
        <TooltipPrimitive.Positioner side={side} sideOffset={6} className="z-50">
          <TooltipPrimitive.Popup
            className={cn(
              "rounded-sm border border-line bg-surface-raised px-2 py-1 text-micro whitespace-nowrap text-ink shadow-popover",
              "data-open:animate-in data-open:fade-in-0 data-closed:animate-out data-closed:fade-out-0",
              className
            )}
          >
            {label}
          </TooltipPrimitive.Popup>
        </TooltipPrimitive.Positioner>
      </TooltipPrimitive.Portal>
    </TooltipPrimitive.Root>
  );
}

/** Shares one hover delay across a group of adjacent tooltips (e.g. a rail). */
export const TooltipProvider = TooltipPrimitive.Provider;
