import React, { useState, useEffect } from "react";
import { apiClient } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format, addDays, startOfWeek, isSameDay } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  ChevronLeft,
  ChevronRight,
  Calendar as CalendarIcon,
  Clock,
  MoreVertical,
  Edit2,
  XCircle,
  CheckCircle,
  User,
  FileText,
  ClipboardCheck,
  UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import AppointmentForm from "@/components/appointments/AppointmentForm";

const statusColors = {
  SCHEDULED: "bg-yellow-100 text-yellow-700",
  CONFIRMED: "bg-blue-100 text-blue-700",
  IN_PROGRESS: "bg-teal-100 text-teal-700",
  COMPLETED: "bg-green-100 text-green-700",
  CANCELLED: "bg-red-100 text-red-700",
  NO_SHOW: "bg-slate-100 text-slate-700"
};

export default function Appointments() {
  const navigate = useNavigate();
  const [hospitalId, setHospitalId] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [staffInfo, setStaffInfo] = useState(null);
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingAppointment, setEditingAppointment] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadStaffInfo();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (openDropdownId && !event.target.closest('.dropdown-container')) {
        setOpenDropdownId(null);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [openDropdownId]);

  const loadStaffInfo = async () => {
    const user = await apiClient.auth.me();
    const staff = await apiClient.entities.HospitalStaff.filter({ user_email: user.email });
    if (staff.length > 0) {
      setStaffInfo(staff[0]);
      setHospitalId(staff[0].hospital_id);
      const hospitals = await apiClient.entities.Hospital.filter({ id: staff[0].hospital_id });
      if (hospitals.length > 0) {
        setHospital(hospitals[0]);
      }
    }
  };

  const { data: appointments = [], isLoading } = useQuery({
    queryKey: ["appointments", hospitalId],
    queryFn: () => apiClient.entities.Appointment.filter({ hospital_id: hospitalId }, "-appointment_date", 500),
    enabled: !!hospitalId
  });

  const { data: patients = [] } = useQuery({
    queryKey: ["patients", hospitalId],
    queryFn: () => apiClient.entities.Patient.filter({ hospital_id: hospitalId }),
    enabled: !!hospitalId
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors", hospitalId],
    queryFn: () => apiClient.entities.HospitalStaff.filter({ hospital_id: hospitalId, role: "DOCTOR" }),
    enabled: !!hospitalId
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.entities.Appointment.create({
      ...data,
      hospital_id: hospitalId
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.entities.Appointment.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["appointments"]);
      setShowForm(false);
      setEditingAppointment(null);
      setOpenDropdownId(null);
    }
  });

  const handleSubmit = (data) => {
    if (editingAppointment) {
      updateMutation.mutate({ id: editingAppointment.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (apt) => {
    setEditingAppointment(apt);
    setShowForm(true);
    setOpenDropdownId(null);
  };

  const updateStatus = (apt, status) => {
    updateMutation.mutate({ id: apt.id, data: { status } });
  };

  const handleStartConsultation = (apt) => {
    updateMutation.mutate({ 
      id: apt.id, 
      data: { status: "IN_PROGRESS" } 
    });
    setOpenDropdownId(null);
  };

  // Replace the handleCompleteConsultation function in Appointments.jsx with this:

const handleCompleteConsultation = async (apt) => {
  // Get patient details for medical record
  const patient = patients.find(p => p.id === apt.patient_id);
  
  // Mark appointment as completed
  updateMutation.mutate({ 
    id: apt.id, 
    data: { status: "COMPLETED" } 
  });
  
  // Create medical record for the consultation
  if (patient && (patient.pan_number || patient.aadhaar_number)) {
    try {
      await apiClient.entities.MedicalRecord.create({
        patient_pan: patient.pan_number || "",
        patient_aadhaar: patient.aadhaar_number || "",
        patient_name: `${patient.first_name} ${patient.last_name}`,
        hospital_id: hospitalId,
        hospital_name: hospital?.name || "Unknown Hospital",
        record_type: "DIAGNOSIS",
        record_date: format(new Date(), "yyyy-MM-dd"),
        diagnosis: apt.reason || "Consultation completed",
        treatment: apt.notes || "",
        medicines: [],
        doctor_name: apt.doctor_name || "",
        department: apt.department || patient.department || "",
        notes: `Appointment ${apt.type} completed`,
        is_shared: true
      });
      console.log("Medical record created for completed consultation");
    } catch (err) {
      console.error("Error creating consultation medical record:", err);
    }
  }
  
  // Redirect to prescriptions page to create prescription
  setTimeout(() => {
    navigate('/prescriptions', { 
      state: { 
        createPrescription: true,
        appointmentId: apt.id,
        patientId: apt.patient_id,
        patientName: apt.patient_name
      } 
    });
  }, 500);
  
  setOpenDropdownId(null);
};

  const handleMarkNoShow = (apt) => {
    updateMutation.mutate({ 
      id: apt.id, 
      data: { status: "NO_SHOW" } 
    });
    setOpenDropdownId(null);
  };

  const handleCreatePrescription = (apt) => {
    navigate('/prescriptions', { 
      state: { 
        createPrescription: true,
        appointmentId: apt.id,
        patientId: apt.patient_id,
        patientName: apt.patient_name
      } 
    });
    setOpenDropdownId(null);
  };

  // Filter appointments
  const dateStr = format(selectedDate, "yyyy-MM-dd");
  const filteredAppointments = appointments.filter(apt => {
    const matchesDate = apt.appointment_date === dateStr;
    const matchesStatus = statusFilter === "all" || apt.status === statusFilter;
    return matchesDate && matchesStatus;
  });

  // Sort by time
  const sortedAppointments = [...filteredAppointments].sort((a, b) => 
    (a.appointment_time || "").localeCompare(b.appointment_time || "")
  );

  // Week days for mini calendar
  const weekStart = startOfWeek(selectedDate, { weekStartsOn: 1 });
  const weekDays = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  // Stats for selected date
  const scheduled = filteredAppointments.filter(a => a.status === "SCHEDULED").length;
  const completed = filteredAppointments.filter(a => a.status === "COMPLETED").length;

  const isDoctor = staffInfo?.role === "DOCTOR";

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Appointments</h1>
          <p className="text-slate-500">{format(selectedDate, "EEEE, MMMM d, yyyy")}</p>
        </div>
        {!isDoctor && (
          <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            New Appointment
          </Button>
        )}
      </div>

      {/* Date Navigation */}
      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSelectedDate(addDays(selectedDate, -7))}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <CalendarIcon className="w-4 h-4" />
                  {format(selectedDate, "MMM d, yyyy")}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={selectedDate}
                  onSelect={(d) => d && setSelectedDate(d)}
                />
              </PopoverContent>
            </Popover>
            <Button 
              variant="outline" 
              size="icon"
              onClick={() => setSelectedDate(addDays(selectedDate, 7))}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedDate(new Date())}
              className="text-teal-600"
            >
              Today
            </Button>
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="SCHEDULED">Scheduled</SelectItem>
              <SelectItem value="CONFIRMED">Confirmed</SelectItem>
              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
              <SelectItem value="NO_SHOW">No Show</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Week View */}
        <div className="grid grid-cols-7 gap-2">
          {weekDays.map((day) => {
            const isSelected = isSameDay(day, selectedDate);
            const isToday = isSameDay(day, new Date());
            const dayAppts = appointments.filter(a => a.appointment_date === format(day, "yyyy-MM-dd"));
            
            return (
              <button
                key={day.toISOString()}
                onClick={() => setSelectedDate(day)}
                className={`p-3 rounded-xl text-center transition-all ${
                  isSelected 
                    ? "bg-teal-600 text-white" 
                    : isToday 
                      ? "bg-teal-50 text-teal-700" 
                      : "hover:bg-slate-50"
                }`}
              >
                <p className={`text-xs font-medium ${isSelected ? "text-teal-100" : "text-slate-500"}`}>
                  {format(day, "EEE")}
                </p>
                <p className={`text-lg font-bold ${isSelected ? "text-white" : "text-slate-800"}`}>
                  {format(day, "d")}
                </p>
                {dayAppts.length > 0 && (
                  <div className={`text-xs mt-1 ${isSelected ? "text-teal-100" : "text-slate-500"}`}>
                    {dayAppts.length} appt{dayAppts.length > 1 ? "s" : ""}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <p className="text-sm text-slate-500">Total Today</p>
          <p className="text-2xl font-bold text-slate-800 mt-1">{filteredAppointments.length}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <p className="text-sm text-slate-500">Scheduled</p>
          <p className="text-2xl font-bold text-yellow-600 mt-1">{scheduled}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <p className="text-sm text-slate-500">Completed</p>
          <p className="text-2xl font-bold text-green-600 mt-1">{completed}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <p className="text-sm text-slate-500">Pending</p>
          <p className="text-2xl font-bold text-blue-600 mt-1">
            {filteredAppointments.filter(a => ["SCHEDULED", "CONFIRMED"].includes(a.status)).length}
          </p>
        </div>
      </div>

      {/* Appointments List */}
      <div className="bg-white rounded-xl border border-slate-100">
        <div className="p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">
            Appointments for {format(selectedDate, "MMMM d, yyyy")}
          </h3>
        </div>
        
        <div className="divide-y divide-slate-50">
          {isLoading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600 mx-auto"></div>
            </div>
          ) : sortedAppointments.length === 0 ? (
            <div className="p-12 text-center">
              <CalendarIcon className="w-12 h-12 text-slate-200 mx-auto mb-3" />
              <p className="text-slate-500">No appointments for this date</p>
              {!isDoctor && (
                <Button 
                  onClick={() => setShowForm(true)} 
                  variant="outline" 
                  className="mt-4"
                >
                  Schedule Appointment
                </Button>
              )}
            </div>
          ) : (
            sortedAppointments.map((apt) => (
              <div key={apt.id} className="p-4 hover:bg-slate-50 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-teal-50 to-teal-100 flex flex-col items-center justify-center shrink-0">
                    <Clock className="w-4 h-4 text-teal-600 mb-1" />
                    <span className="text-sm font-bold text-teal-700">
                      {apt.appointment_time}
                    </span>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <p className="font-semibold text-slate-800 truncate">
                        {apt.patient_name}
                      </p>
                      <Badge className={statusColors[apt.status]}>
                        {apt.status?.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="text-sm text-slate-500">
                      Dr. {apt.doctor_name} • {apt.department || apt.type?.replace("_", " ")}
                    </p>
                    {apt.reason && (
                      <p className="text-sm text-slate-400 mt-1 truncate">{apt.reason}</p>
                    )}
                  </div>

                  <div className="relative dropdown-container" style={{ position: 'relative', zIndex: 1 }}>
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setOpenDropdownId(openDropdownId === apt.id ? null : apt.id)}
                    >
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                    
                    {openDropdownId === apt.id && (
                      <div 
                        className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1"
                        style={{ 
                          position: 'absolute', 
                          right: 0, 
                          top: '100%',
                          zIndex: 9999 
                        }}
                      >
                        {/* Edit Option - Available to all */}
                        {!isDoctor && (
                          <>
                            <button
                              onClick={() => handleEdit(apt)}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 w-full text-left"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit Appointment
                            </button>
                            <div className="border-t border-slate-100 my-1"></div>
                          </>
                        )}

                        {/* Doctor-specific options */}
                        {isDoctor && (
                          <>
                            {/* Start Consultation - Only for SCHEDULED or CONFIRMED */}
                            {["SCHEDULED", "CONFIRMED"].includes(apt.status) && (
                              <button
                                onClick={() => handleStartConsultation(apt)}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-teal-50 w-full text-left text-teal-700"
                              >
                                <UserCheck className="w-4 h-4" />
                                Start Consultation
                              </button>
                            )}

                            {/* Complete & Prescribe - Only for IN_PROGRESS */}
                            {apt.status === "IN_PROGRESS" && (
                              <button
                                onClick={() => handleCompleteConsultation(apt)}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-green-50 w-full text-left text-green-700"
                              >
                                <ClipboardCheck className="w-4 h-4" />
                                Complete & Prescribe
                              </button>
                            )}

                            {/* Add Prescription - Only for COMPLETED */}
                            {apt.status === "COMPLETED" && (
                              <button
                                onClick={() => handleCreatePrescription(apt)}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 w-full text-left text-blue-700"
                              >
                                <FileText className="w-4 h-4" />
                                Add Prescription
                              </button>
                            )}

                            {/* Mark as No Show */}
                            {["SCHEDULED", "CONFIRMED"].includes(apt.status) && (
                              <>
                                <div className="border-t border-slate-100 my-1"></div>
                                <button
                                  onClick={() => handleMarkNoShow(apt)}
                                  className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 w-full text-left text-slate-600"
                                >
                                  <XCircle className="w-4 h-4" />
                                  Mark as No Show
                                </button>
                              </>
                            )}
                          </>
                        )}

                        {/* Status change options - Available to non-doctors */}
                        {!isDoctor && (
                          <>
                            <button
                              onClick={() => updateStatus(apt, "CONFIRMED")}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 w-full text-left text-blue-600"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Confirm
                            </button>
                            <button
                              onClick={() => updateStatus(apt, "COMPLETED")}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-green-50 w-full text-left text-green-600"
                            >
                              <CheckCircle className="w-4 h-4" />
                              Mark Complete
                            </button>
                            <button
                              onClick={() => updateStatus(apt, "CANCELLED")}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 w-full text-left text-red-600"
                            >
                              <XCircle className="w-4 h-4" />
                              Cancel
                            </button>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Appointment Form Dialog */}
      {!isDoctor && (
        <AppointmentForm
          open={showForm}
          onClose={() => {
            setShowForm(false);
            setEditingAppointment(null);
          }}
          onSubmit={handleSubmit}
          appointment={editingAppointment}
          patients={patients}
          doctors={doctors}
          departments={hospital?.departments || []}
          loading={createMutation.isPending || updateMutation.isPending}
        />
      )}
    </div>
  );
}