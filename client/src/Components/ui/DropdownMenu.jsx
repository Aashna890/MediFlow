import * as React from "react"
import { cn } from "@/lib/utils"

const DropdownMenuContext = React.createContext(null)

const DropdownMenu = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  return (
    <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block text-left">
        {children}
      </div>
    </DropdownMenuContext.Provider>
  )
}

const DropdownMenuTrigger = React.forwardRef(({ className, children, asChild, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext)
  
  if (asChild) {
    const child = React.Children.only(children)
    return React.cloneElement(child, {
      ref,
      onClick: (e) => {
        child.props.onClick?.(e)
        context.setIsOpen(!context.isOpen)
      },
    })
  }
  
  return (
    <button
      ref={ref}
      onClick={() => context.setIsOpen(!context.isOpen)}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
})
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef(({ className, align = "center", children, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext)
  
  React.useEffect(() => {
    const handleClickOutside = () => context.setIsOpen(false)
    if (context.isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [context.isOpen])
  
  if (!context.isOpen) return null
  
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-2 min-w-[8rem] overflow-hidden rounded-lg border border-slate-200 bg-white p-1 shadow-lg",
        "animate-in fade-in-80 slide-in-from-top-2 duration-200",
        align === "end" && "right-0",
        align === "start" && "left-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  )
})
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef(({ className, asChild, children, ...props }, ref) => {
  const context = React.useContext(DropdownMenuContext)
  
  const handleClick = (e) => {
    props.onClick?.(e)
    context.setIsOpen(false)
  }
  
  if (asChild) {
    const child = React.Children.only(children)
    return React.cloneElement(child, {
      ref,
      onClick: handleClick,
      className: cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100",
        child.props.className
      )
    })
  }
  
  return (
    <div
      ref={ref}
      onClick={handleClick}
      className={cn(
        "relative flex cursor-pointer select-none items-center rounded-md px-2 py-2 text-sm outline-none transition-colors hover:bg-slate-100 focus:bg-slate-100",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("my-1 h-px bg-slate-200", className)}
    {...props}
  />
))
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

const DropdownMenuLabel = React.forwardRef(({ className, inset, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "px-2 py-1.5 text-sm font-semibold text-slate-900",
      inset && "pl-8",
      className
    )}
    {...props}
  />
))
DropdownMenuLabel.displayName = "DropdownMenuLabel"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
}
