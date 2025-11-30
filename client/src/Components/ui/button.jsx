import * as React from "react"
import { cn } from "@/lib/utils"

const Button = React.forwardRef(({ className, variant = "default", size = "default", ...props }, ref) => {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center rounded-lg text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
        variant === "default" && "bg-teal-600 text-white hover:bg-teal-700",
        variant === "outline" && "border border-slate-300 bg-white hover:bg-slate-50 text-slate-700",
        variant === "ghost" && "hover:bg-slate-100 text-slate-700",
        variant === "destructive" && "bg-red-600 text-white hover:bg-red-700",
        size === "default" && "h-10 px-4 py-2",
        size === "sm" && "h-9 px-3 text-xs",
        size === "lg" && "h-11 px-8 text-base",
        size === "icon" && "h-10 w-10",
        className
      )}
      ref={ref}
      {...props}
    />
  )
})
Button.displayName = "Button"

export { Button }