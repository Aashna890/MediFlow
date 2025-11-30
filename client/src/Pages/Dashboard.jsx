import React, { useState, useEffect } from "react";
import { apiClient } from "@/api/apiClient";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Users,
  UserPlus,
  Calendar,
  FileText,
  Activity,
  TrendingUp,
  Stethoscope,
  Bed
} from "lucide-react";
import StatsCard from "@/components/dashboard/StatsCard";
import RecentPatients from "@/components/dashboard/RecentPatients";
import TodayAppointments from "@/components/dashboard/TodayAppointments";

export default function Dashboard() {
  const [staffInfo, setStaffInfo] = useState(null);
  const [hospitalId, setHospitalId] = useState(null);

  useEffect(() => {
    loadStaffInfo();
  }, []);

  const loadStaffInfo = async () => {
    const user = await apiClient.auth.me();
    const staff = await apiClient.entities.HospitalStaff.filter({ user_email: user.email });
    if (staff.length > 0) {
      setStaffInfo(staff[0]);
      setHospitalId(staff[0].hospital_id);
    }
  };

  const { data: patients = [] } = useQuery({
    queryKey: ["patients", hospitalId],
    queryFn: () => apiClient.entities.Patient.filter({ hospital_id: hospitalId }, "-created_date", 100),
    enabled: !!hospitalId
  });

  const { data: appointments = [] } = useQuery({
    queryKey: ["appointments", hospitalId],
    queryFn: () => apiClient.entities.Appointment.filter({ hospital_id: hospitalId }, "-created_date", 100),
    enabled: !!hospitalId
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ["prescriptions", hospitalId],
    queryFn: () => apiClient.entities.Prescription.filter({ hospital_id: hospitalId }, "-created_date", 100),
    enabled: !!hospitalId
  });

  const { data: staff = [] } = useQuery({
    queryKey: ["staff", hospitalId],
    queryFn: () => apiClient.entities.HospitalStaff.filter({ hospital_id: hospitalId }),
    enabled: !!hospitalId
  });

  // Calculate stats
  const today = format(new Date(), "yyyy-MM-dd");
  const todayAppointments = appointments.filter(a => a.appointment_date === today);
  const activePatients = patients.filter(p => p.status === "ACTIVE");
  const ipdPatients = patients.filter(p => p.patient_type === "IPD" && p.status === "ACTIVE");
  const doctors = staff.filter(s => s.role === "DOCTOR");

  const stats = [
    { 
      title: "Total Patients", 
      value: patients.length, 
      icon: Users,
      trend: "+12% this month",
      trendUp: true
    },
    { 
      title: "Today's Appointments", 
      value: todayAppointments.length, 
      icon: Calendar,
      trend: `${appointments.filter(a => a.status === "COMPLETED").length} completed`,
      trendUp: true
    },
    { 
      title: "IPD Patients", 
      value: ipdPatients.length, 
      icon: Bed,
      trend: "Active admissions",
      trendUp: true
    },
    { 
      title: "Doctors", 
      value: doctors.length, 
      icon: Stethoscope,
      trend: `${staff.length} total staff`,
      trendUp: true
    }
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-teal-600 to-teal-700 rounded-2xl p-8 text-white">
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">
          Welcome back, {staffInfo?.first_name}!
        </h1>
        <p className="text-teal-100 text-lg">
          Here's what's happening at your hospital today
        </p>
        <div className="mt-6 flex flex-wrap gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
            <p className="text-teal-100 text-sm">Today's Date</p>
            <p className="text-white font-semibold">{format(new Date(), "EEEE, MMMM d, yyyy")}</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
            <p className="text-teal-100 text-sm">Active Patients</p>
            <p className="text-white font-semibold">{activePatients.length} patients</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl px-4 py-3">
            <p className="text-teal-100 text-sm">Prescriptions Today</p>
            <p className="text-white font-semibold">
              {prescriptions.filter(p => format(new Date(p.created_date), "yyyy-MM-dd") === today).length} issued
            </p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, i) => (
          <StatsCard key={i} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid lg:grid-cols-2 gap-6">
        <RecentPatients patients={patients} />
        <TodayAppointments appointments={todayAppointments} />
      </div>

      {/* Quick Stats by Department */}
      <div className="bg-white rounded-2xl border border-slate-100 p-6">
        <h3 className="text-lg font-semibold text-slate-800 mb-6">Department Overview</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {["General Medicine", "Cardiology", "Orthopedics", "Pediatrics", "Neurology", "Emergency"].map((dept) => {
            const deptPatients = patients.filter(p => p.department === dept);
            return (
              <div key={dept} className="text-center p-4 bg-slate-50 rounded-xl">
                <p className="text-2xl font-bold text-teal-600">{deptPatients.length}</p>
                <p className="text-sm text-slate-600 mt-1">{dept}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
