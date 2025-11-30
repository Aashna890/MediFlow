import React from "react";
import { cn } from "@/lib/utils";

export default function StatsCard({ 
  title, 
  value, 
  icon: Icon, 
  trend, 
  trendUp,
  className 
}) {
  return (
    <div className={cn(
      "bg-white rounded-2xl p-6 border border-slate-100 hover:shadow-lg hover:shadow-slate-100 transition-all duration-300",
      className
    )}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-3xl font-bold text-slate-800">{value}</h3>
          {trend && (
            <p className={cn(
              "text-sm mt-2 font-medium",
              trendUp ? "text-green-600" : "text-red-500"
            )}>
              {trendUp ? "↑" : "↓"} {trend}
            </p>
          )}
        </div>
        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center">
          <Icon className="w-6 h-6 text-teal-600" />
        </div>
      </div>
    </div>
  );
}