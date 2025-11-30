import React from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { format } from "date-fns";
import { User, ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function RecentPatients({ patients = [] }) {
  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-700";
      case "DISCHARGED": return "bg-slate-100 text-slate-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const getTypeColor = (type) => {
    return type === "IPD" 
      ? "bg-purple-100 text-purple-700" 
      : "bg-blue-100 text-blue-700";
  };

  return (
    <div className="bg-white rounded-2xl border border-slate-100 overflow-hidden">
      <div className="p-6 border-b border-slate-100 flex items-center justify-between">
        <h3 className="text-lg font-semibold text-slate-800">Recent Patients</h3>
        <Link 
          to={createPageUrl("Patients")} 
          className="text-sm text-teal-600 hover:text-teal-700 font-medium flex items-center gap-1"
        >
          View All
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>
      
      <div className="divide-y divide-slate-50">
        {patients.length === 0 ? (
          <div className="p-8 text-center">
            <User className="w-12 h-12 text-slate-200 mx-auto mb-3" />
            <p className="text-slate-500">No patients registered yet</p>
          </div>
        ) : (
          patients.slice(0, 5).map((patient) => (
            <Link
              key={patient.id}
              to={createPageUrl(`Patients?id=${patient.id}`)}
              className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
            >
              <Avatar className="h-11 w-11">
                <AvatarFallback className="bg-teal-100 text-teal-700 font-medium">
                  {patient.first_name?.[0]}{patient.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-medium text-slate-800 truncate">
                  {patient.first_name} {patient.last_name}
                </p>
                <p className="text-sm text-slate-500">
                  {patient.patient_id} • {patient.department || "General"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className={getTypeColor(patient.patient_type)}>
                  {patient.patient_type}
                </Badge>
                <Badge className={getStatusColor(patient.status)}>
                  {patient.status}
                </Badge>
              </div>
            </Link>
          ))
        )}
      </div>
    </div>
  );
}