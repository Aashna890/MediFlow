import React, { useState } from "react";
import { format } from "date-fns";
import { Loader2, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";

const frequencies = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every 6 hours",
  "Every 8 hours",
  "Every 12 hours",
  "As needed",
  "Before meals",
  "After meals",
  "At bedtime"
];

const durations = [
  "3 days",
  "5 days",
  "7 days",
  "10 days",
  "14 days",
  "21 days",
  "30 days",
  "Until finished",
  "As directed"
];

export default function PrescriptionForm({ 
  open, 
  onClose, 
  onSubmit, 
  prescription,
  patients = [],
  doctors = [],
  currentDoctor,
  loading 
}) {
  const [formData, setFormData] = useState(prescription || {
    patient_id: "",
    patient_name: "",
    doctor_id: currentDoctor?.id || "",
    doctor_name: currentDoctor ? `${currentDoctor.first_name} ${currentDoctor.last_name}` : "",
    diagnosis: "",
    symptoms: "",
    medicines: [{ name: "", dosage: "", frequency: "", duration: "", instructions: "" }],
    notes: "",
    follow_up_date: "",
    status: "ACTIVE"
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
        doctor_name: `${doctor.first_name} ${doctor.last_name}`
      }));
    }
  };

  const handleMedicineChange = (index, field, value) => {
    const newMedicines = [...formData.medicines];
    newMedicines[index] = { ...newMedicines[index], [field]: value };
    setFormData(prev => ({ ...prev, medicines: newMedicines }));
  };

  const addMedicine = () => {
    setFormData(prev => ({
      ...prev,
      medicines: [...prev.medicines, { name: "", dosage: "", frequency: "", duration: "", instructions: "" }]
    }));
  };

  const removeMedicine = (index) => {
    if (formData.medicines.length > 1) {
      setFormData(prev => ({
        ...prev,
        medicines: prev.medicines.filter((_, i) => i !== index)
      }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {prescription ? "Edit Prescription" : "Create Prescription"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          {/* Patient & Doctor */}
          <div className="grid grid-cols-2 gap-4">
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
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Diagnosis & Symptoms */}
          <div>
            <Label>Diagnosis</Label>
            <Input
              value={formData.diagnosis}
              onChange={(e) => handleChange("diagnosis", e.target.value)}
              placeholder="e.g., Upper Respiratory Infection"
              className="mt-1"
            />
          </div>

          <div>
            <Label>Symptoms</Label>
            <Textarea
              value={formData.symptoms}
              onChange={(e) => handleChange("symptoms", e.target.value)}
              rows={2}
              className="mt-1"
              placeholder="Patient's symptoms..."
            />
          </div>

          {/* Medicines */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <Label>Medicines</Label>
              <Button type="button" variant="outline" size="sm" onClick={addMedicine}>
                <Plus className="w-4 h-4 mr-1" />
                Add Medicine
              </Button>
            </div>
            
            <div className="space-y-4">
              {formData.medicines.map((med, index) => (
                <div key={index} className="p-4 bg-slate-50 rounded-xl space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <Label className="text-xs">Medicine Name *</Label>
                      <Input
                        value={med.name}
                        onChange={(e) => handleMedicineChange(index, "name", e.target.value)}
                        placeholder="e.g., Paracetamol 500mg"
                        className="mt-1"
                      />
                    </div>
                    <div className="w-32">
                      <Label className="text-xs">Dosage</Label>
                      <Input
                        value={med.dosage}
                        onChange={(e) => handleMedicineChange(index, "dosage", e.target.value)}
                        placeholder="e.g., 1 tablet"
                        className="mt-1"
                      />
                    </div>
                    {formData.medicines.length > 1 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="icon"
                        onClick={() => removeMedicine(index)}
                        className="mt-6 text-red-500 hover:text-red-600"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <Label className="text-xs">Frequency</Label>
                      <Select
                        value={med.frequency}
                        onValueChange={(v) => handleMedicineChange(index, "frequency", v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {frequencies.map(f => (
                            <SelectItem key={f} value={f}>{f}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label className="text-xs">Duration</Label>
                      <Select
                        value={med.duration}
                        onValueChange={(v) => handleMedicineChange(index, "duration", v)}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                        <SelectContent>
                          {durations.map(d => (
                            <SelectItem key={d} value={d}>{d}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs">Instructions</Label>
                    <Input
                      value={med.instructions}
                      onChange={(e) => handleMedicineChange(index, "instructions", e.target.value)}
                      placeholder="e.g., Take with food"
                      className="mt-1"
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes & Follow-up */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Follow-up Date</Label>
              <Input
                type="date"
                value={formData.follow_up_date}
                onChange={(e) => handleChange("follow_up_date", e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          <div>
            <Label>Additional Notes</Label>
            <Textarea
              value={formData.notes}
              onChange={(e) => handleChange("notes", e.target.value)}
              rows={2}
              className="mt-1"
              placeholder="Any additional instructions for the patient..."
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
                prescription ? "Update Prescription" : "Create Prescription"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
