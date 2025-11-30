import * as React from "react"
import { cn } from "@/lib/utils"

const PopoverContext = React.createContext(null)

const Popover = ({ children }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  return (
    <PopoverContext.Provider value={{ isOpen, setIsOpen }}>
      <div className="relative inline-block">
        {children}
      </div>
    </PopoverContext.Provider>
  )
}

const PopoverTrigger = React.forwardRef(({ className, children, asChild, ...props }, ref) => {
  const context = React.useContext(PopoverContext)
  
  if (asChild) {
    const child = React.Children.only(children)
    return React.cloneElement(child, {
      ref,
      onClick: (e) => {
        e.stopPropagation()
        child.props.onClick?.(e)
        context.setIsOpen(!context.isOpen)
      },
    })
  }
  
  return (
    <button
      ref={ref}
      onClick={(e) => {
        e.stopPropagation()
        context.setIsOpen(!context.isOpen)
      }}
      className={className}
      {...props}
    >
      {children}
    </button>
  )
})
PopoverTrigger.displayName = "PopoverTrigger"

const PopoverContent = React.forwardRef(({ className, align = "center", ...props }, ref) => {
  const context = React.useContext(PopoverContext)
  
  React.useEffect(() => {
    const handleClickOutside = () => context.setIsOpen(false)
    const handleEscape = (e) => {
      if (e.key === 'Escape') context.setIsOpen(false)
    }
    
    if (context.isOpen) {
      document.addEventListener('click', handleClickOutside)
      document.addEventListener('keydown', handleEscape)
      return () => {
        document.removeEventListener('click', handleClickOutside)
        document.removeEventListener('keydown', handleEscape)
      }
    }
  }, [context.isOpen])
  
  if (!context.isOpen) return null
  
  return (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 mt-2 rounded-lg border border-slate-200 bg-white p-4 shadow-lg outline-none",
        "animate-in fade-in-80 slide-in-from-top-2 duration-200",
        align === "start" && "left-0",
        align === "end" && "right-0",
        align === "center" && "left-1/2 -translate-x-1/2",
        className
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    />
  )
})
PopoverContent.displayName = "PopoverContent"

export { Popover, PopoverTrigger, PopoverContent }
