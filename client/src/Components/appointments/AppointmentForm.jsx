import React, { useState } from "react";
import { format } from "date-fns";
import { Loader2, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const appointmentTypes = [
  { value: "CONSULTATION", label: "Consultation" },
  { value: "FOLLOW_UP", label: "Follow Up" },
  { value: "EMERGENCY", label: "Emergency" },
  { value: "ROUTINE_CHECKUP", label: "Routine Checkup" }
];

const timeSlots = [];
for (let h = 9; h <= 17; h++) {
  for (let m = 0; m < 60; m += 30) {
    const hour = h.toString().padStart(2, "0");
    const min = m.toString().padStart(2, "0");
    timeSlots.push(`${hour}:${min}`);
  }
}

export default function AppointmentForm({ 
  open, 
  onClose, 
  onSubmit, 
  appointment,
  patients = [],
  doctors = [],
  departments = [],
  loading 
}) {
  const [formData, setFormData] = useState(appointment || {
    patient_id: "",
    patient_name: "",
    doctor_id: "",
    doctor_name: "",
    department: "",
    appointment_date: format(new Date(), "yyyy-MM-dd"),
    appointment_time: "09:00",
    type: "CONSULTATION",
    reason: "",
    notes: "",
    status: "SCHEDULED"
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePatientChange = (patientId) => {
    const patient = patients.find(p => p.id === patientId);
    if (patient) {
      setFormData(prev => ({
        ...prev,
        patient_id: patientId,
        patient_name: `${patient.first_name} ${patient.last_name}`
      }));
    }
  };

  const handleDoctorChange = (doctorId) => {
    const doctor = doctors.find(d => d.id === doctorId);
    if (doctor) {
      setFormData(prev => ({
        ...prev,
        doctor_id: doctorId,
        doctor_name: `${doctor.first_name} ${doctor.last_name}`,
        department: doctor.department || prev.department
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {appointment ? "Edit Appointment" : "Schedule Appointment"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
          <div>
            <Label>Patient *</Label>
            <Select
              value={formData.patient_id}
              onValueChange={handlePatientChange}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map(p => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.first_name} {p.last_name} ({p.patient_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label>Doctor *</Label>
            <Select
              value={formData.doctor_id}
              onValueChange={handleDoctorChange}
            >
              <SelectTrigger className="mt-1">
                <SelectValue placeholder="Select doctor" />
              </SelectTrigger>
              <SelectContent>
                {doctors.map(d => (
                  <SelectItem key={d.id} value={d.id}>
                    Dr. {d.first_name} {d.last_name} 
                    {d.specialization && ` - ${d.specialization}`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Date *</Label>
              <Input
                type="date"
                value={formData.appointment_date}
                onChange={(e) => handleChange("appointment_date", e.target.value)}
                min={format(new Date(), "yyyy-MM-dd")}
                required
                className="mt-1"
              />
            </div>
            <div>
              <Label>Time *</Label>
              <Select
                value={formData.appointment_time}
                onValueChange={(v) => handleChange("appointment_time", v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {timeSlots.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Department</Label>
              <Select
                value={formData.department}
                onValueChange={(v) => handleChange("department", v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  {departments.map(d => (
                    <SelectItem key={d} value={d}>{d}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Type</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => handleChange("type", v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {appointmentTypes.map(t => (
                    <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label>Reason for Visit</Label>
            <Textarea
              value={formData.reason}
              onChange={(e) => handleChange("reason", e.target.value)}
              rows={2}
              className="mt-1"
              placeholder="Describe the reason for this appointment"
            />
          </div>

          <div>
            <Label>Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={2}
              className="mt-1"
              placeholder="Additional notes"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="bg-teal-600 hover:bg-teal-700">
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                appointment ? "Update Appointment" : "Schedule"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
