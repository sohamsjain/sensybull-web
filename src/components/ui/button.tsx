import { Button as ButtonPrimitive } from "@base-ui/react/button"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

/**
 * Buttons are quiet but never cramped. There is one solid button — the
 * accent — and it marks the single most likely next action on a screen;
 * everything else is an outline, a ghost, or plain text.
 *
 * Every size is at least 28px tall and the default is 36px, so a button is
 * comfortably clickable with a pointer and reachable with a thumb. `xs` is
 * for a control that sits inline inside a row of text, nothing else.
 */
const buttonVariants = cva(
  "group/button inline-flex shrink-0 items-center justify-center gap-1.5 rounded-md border border-transparent text-label font-medium whitespace-nowrap transition-colors outline-none select-none disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
  {
    variants: {
      variant: {
        default: "bg-brand text-brand-on hover:bg-brand-hover",
        outline:
          "border-line bg-surface text-ink hover:bg-surface-hover aria-expanded:bg-surface-hover",
        secondary:
          "bg-surface-hover text-ink hover:bg-surface-active aria-expanded:bg-surface-active",
        ghost:
          "text-ink-muted hover:bg-surface-hover hover:text-ink aria-expanded:bg-surface-hover aria-expanded:text-ink",
        destructive: "bg-danger-soft text-danger hover:bg-danger/20",
        link: "text-brand-ink underline-offset-4 hover:underline",
      },
      size: {
        default: "h-9 px-3",
        xs: "h-7 px-2 text-micro [&_svg:not([class*='size-'])]:size-3.5",
        sm: "h-8 px-2.5 text-meta",
        lg: "h-10 px-4 text-body",
        icon: "size-9",
        "icon-xs": "size-7 [&_svg:not([class*='size-'])]:size-3.5",
        "icon-sm": "size-8",
        "icon-lg": "size-10 [&_svg:not([class*='size-'])]:size-[18px]",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  ...props
}: ButtonPrimitive.Props & VariantProps<typeof buttonVariants>) {
  return (
    <ButtonPrimitive
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
