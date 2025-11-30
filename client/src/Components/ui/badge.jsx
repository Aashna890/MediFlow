import * as React from "react"
import { cn } from "@/lib/utils"

const Badge = React.forwardRef(({ className, variant = "default", ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2",
        variant === "default" && "bg-slate-900 text-slate-50",
        variant === "secondary" && "bg-slate-100 text-slate-900",
        variant === "outline" && "border border-slate-200 text-slate-900",
        className
      )}
      {...props}
    />
  )
})
Badge.displayName = "Badge"

export { Badge }