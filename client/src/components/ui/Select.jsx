import * as React from "react"
import { cn } from "@/lib/utils"
import { ChevronDown } from "lucide-react"

const SelectContext = React.createContext(null)

const Select = ({ children, value, onValueChange, disabled }) => {
  const [isOpen, setIsOpen] = React.useState(false)
  
  React.useEffect(() => {
    const handleClickOutside = () => setIsOpen(false)
    if (isOpen) {
      document.addEventListener('click', handleClickOutside)
      return () => document.removeEventListener('click', handleClickOutside)
    }
  }, [isOpen])
  
  return (
    <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen, disabled }}>
      <div className="relative">
        {children}
      </div>
    </SelectContext.Provider>
  )
}

const SelectTrigger = React.forwardRef(({ className, children, ...props }, ref) => {
  const context = React.useContext(SelectContext)
  
  return (
    <button
      ref={ref}
      type="button"
      onClick={(e) => {
        e.stopPropagation()
        if (!context.disabled) {
          context.setIsOpen(!context.isOpen)
        }
      }}
      disabled={context.disabled}
      className={cn(
        "flex h-10 w-full items-center justify-between rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm",
        "focus:outline-none focus:ring-2 focus:ring-teal-500 focus:border-transparent",
        "disabled:cursor-not-allowed disabled:opacity-50",
        "transition-colors",
        className
      )}
      {...props}
    >
      <span className="block truncate">{children}</span>
      <ChevronDown className={cn(
        "h-4 w-4 opacity-50 transition-transform",
        context.isOpen && "rotate-180"
      )} />
    </button>
  )
})
SelectTrigger.displayName = "SelectTrigger"

const SelectValue = ({ placeholder }) => {
  const context = React.useContext(SelectContext)
  
  // Find the selected item's label
  const selectedLabel = context.value || placeholder
  
  return (
    <span className={cn(!context.value && "text-slate-400")}>
      {selectedLabel}
    </span>
  )
}
SelectValue.displayName = "SelectValue"

const SelectContent = ({ children, ...props }) => {
  const context = React.useContext(SelectContext)
  
  if (!context.isOpen) return null
  
  return (
    <div
      className={cn(
        "absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-lg border border-slate-200 bg-white py-1 shadow-lg",
        "animate-in fade-in-80 slide-in-from-top-2 duration-200"
      )}
      onClick={(e) => e.stopPropagation()}
      {...props}
    >
      {children}
    </div>
  )
}
SelectContent.displayName = "SelectContent"

const SelectItem = ({ children, value, className, disabled }) => {
  const context = React.useContext(SelectContext)
  const isSelected = context.value === value
  
  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        if (!disabled) {
          context.onValueChange(value)
          context.setIsOpen(false)
        }
      }}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-md py-2 px-3 text-sm outline-none",
        "transition-colors",
        isSelected && "bg-teal-50 text-teal-900 font-medium",
        !isSelected && "hover:bg-slate-100 focus:bg-slate-100",
        disabled && "pointer-events-none opacity-50",
        className
      )}
    >
      {children}
    </div>
  )
}
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn("my-1 h-px bg-slate-200", className)}
    {...props}
  />
))
SelectSeparator.displayName = "SelectSeparator"

export { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem,
  SelectSeparator 
}