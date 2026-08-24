import { Input as InputPrimitive } from "@base-ui/react/input"

import { cn } from "@/lib/utils"

/** Text field. A sunken well with a hairline border; the accent appears
 *  only on focus. */
function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <InputPrimitive
      type={type}
      data-slot="input"
      className={cn(
        "h-8 w-full min-w-0 rounded-md border border-line-subtle bg-canvas-sunken px-2.5 text-base text-ink transition-colors outline-none",
        "placeholder:text-ink-faint focus-visible:border-brand/60",
        "disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50",
        "aria-invalid:border-danger/60",
        "md:text-label",
        className
      )}
      {...props}
    />
  )
}

export { Input }
