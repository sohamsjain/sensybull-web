import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

/**
 * Text field. A sunken well with a hairline border; the accent appears only
 * on focus.
 *
 * The border is `line`, not `line-subtle`: at 6% white a subtle hairline
 * vanishes on a dark card and the field reads as a hole in the page rather
 * than somewhere to type. `SearchInput` learned the same thing in light
 * mode — whatever the theme, the border is what defines a field.
 */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-9 w-full min-w-0 rounded-md border border-line bg-canvas-sunken px-3 text-base text-ink transition-colors outline-none",
        "placeholder:text-ink-faint hover:border-line-strong focus-visible:border-brand",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-danger",
        // 16px on mobile: iOS zooms the page when a focused field is
        // smaller, which is worse than the size being off-scale for one
        // breakpoint. The token takes over from `md` up.
        "md:text-label",
        className
      )}
      {...props}
    />
  )
}

export { Input }
