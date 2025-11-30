import * as React from "react"
import { cn } from "@/lib/utils"

const TabsContext = React.createContext(null)

const Tabs = ({ children, defaultValue, value: controlledValue, onValueChange, className }) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue)
  const value = controlledValue ?? internalValue
  
  const setValue = (newValue) => {
    setInternalValue(newValue)
    onValueChange?.(newValue)
  }
  
  return (
    <TabsContext.Provider value={{ value, setValue }}>
      <div className={className}>
        {children}
      </div>
    </TabsContext.Provider>
  )
}

const TabsList = React.forwardRef(({ className, children, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "inline-flex h-10 items-center justify-center rounded-lg bg-slate-100 p-1 text-slate-500",
      className
    )}
    {...props}
  >
    {children}
  </div>
))
TabsList.displayName = "TabsList"

const TabsTrigger = React.forwardRef(({ className, value: triggerValue, children, disabled, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  const isActive = context.value === triggerValue
  
  return (
    <button
      ref={ref}
      type="button"
      onClick={() => !disabled && context.setValue(triggerValue)}
      disabled={disabled}
      className={cn(
        "inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium",
        "transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
        "disabled:pointer-events-none disabled:opacity-50",
        isActive 
          ? "bg-white text-slate-900 shadow-sm" 
          : "text-slate-600 hover:text-slate-900 hover:bg-slate-50",
        className
      )}
      {...props}
    >
      {children}
    </button>
  )
})
TabsTrigger.displayName = "TabsTrigger"

const TabsContent = React.forwardRef(({ className, value: contentValue, children, ...props }, ref) => {
  const context = React.useContext(TabsContext)
  const isActive = context.value === contentValue
  
  if (!isActive) return null
  
  return (
    <div
      ref={ref}
      className={cn(
        "mt-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-500 focus-visible:ring-offset-2",
        "animate-in fade-in-50 duration-200",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
})
TabsContent.displayName = "TabsContent"

export { Tabs, TabsList, TabsTrigger, TabsContent }