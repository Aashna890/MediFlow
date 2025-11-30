import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { Calendar, Clock, ArrowRight, User } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function TodayAppointments({ appointments = [] }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "SCHEDULED": return "bg-yellow-100 text-yellow-700";
      case "CONFIRMED": return "bg-blue-100 text-blue-700";
      case "IN_PROGRESS": return "bg-teal-100 text-teal-700";
      case "COMPLETED": return "bg-green-100 text-green-700";
      case "CANCELLED": return "bg-red-100 text-red-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Today's Appointments</h3>
        <Link 
          to={createPageUrl("Appointments")} 
          className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="divide-y divide-slate-50">
        {appointments.length === 0 ? (
          <div className="p-8 text-center">
            <Calendar className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No appointments for today</p>
          </div>
        ) : (
          appointments.slice(0, 5).map((apt) => (
            <div key={apt.id} className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 flex flex-col items-center justify-center">
                <span className="text-xs text-teal-600 font-medium">
                  {apt.appointment_time?.split(":")[0] || "00"}
                </span>
                <span className="text-lg font-bold text-teal-700">
                  {apt.appointment_time?.split(":")[1] || "00"}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">
                  {apt.patient_name}
                </p>
                <p className="text-sm text-slate-500">
                  Dr. {apt.doctor_name} • {apt.department || apt.type}
                </p>
              </div>
              <Badge className={getStatusColor(apt.status)}>
                {apt.status?.replace("_", " ")}
              </Badge>
            </div>
          ))
        )}
      </div>
    </div>
  );
}