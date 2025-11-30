import React, { useState } from "react";
import { format } from "date-fns";
import { Loader2 } from "lucide-react";
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const bloodGroups = ["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-", "Unknown"];
const genders = ["Male", "Female", "Other"];

export default function PatientForm({ 
  open, 
  onClose, 
  onSubmit, 
  patient, 
  departments = [],
  doctors = [],
  loading 
}) {
  const [formData, setFormData] = useState(patient || {
    first_name: "",
    last_name: "",
    date_of_birth: "",
    gender: "",
    blood_group: "",
    phone: "",
    email: "",
    address: "",
    city: "",
    pan_number: "",
    aadhaar_number: "",
    emergency_contact_name: "",
    emergency_contact_phone: "",
    emergency_contact_relation: "",
    patient_type: "OPD",
    department: "",
    assigned_doctor_id: "",
    medical_history: "",
    allergies: "",
    room_number: "",
    bed_number: ""
  });

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
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
            {patient ? "Edit Patient" : "Register New Patient"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6 mt-4">
          <Tabs defaultValue="personal" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="personal">Personal</TabsTrigger>
              <TabsTrigger value="medical">Medical</TabsTrigger>
              <TabsTrigger value="emergency">Emergency</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>First Name *</Label>
                  <Input
                    value={formData.first_name}
                    onChange={(e) => handleChange("first_name", e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Last Name *</Label>
                  <Input
                    value={formData.last_name}
                    onChange={(e) => handleChange("last_name", e.target.value)}
                    required
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>PAN Number</Label>
                  <Input
                    value={formData.pan_number}
                    onChange={(e) => handleChange("pan_number", e.target.value.toUpperCase())}
                    placeholder="ABCDE1234F"
                    maxLength={10}
                    className="mt-1 font-mono"
                  />
                </div>
                <div>
                  <Label>Aadhaar Number</Label>
                  <Input
                    value={formData.aadhaar_number}
                    onChange={(e) => handleChange("aadhaar_number", e.target.value.replace(/\D/g, ""))}
                    placeholder="1234 5678 9012"
                    maxLength={12}
                    className="mt-1 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Date of Birth</Label>
                  <Input
                    type="date"
                    value={formData.date_of_birth}
                    onChange={(e) => handleChange("date_of_birth", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Gender</Label>
                  <Select
                    value={formData.gender}
                    onValueChange={(v) => handleChange("gender", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select gender" />
                    </SelectTrigger>
                    <SelectContent>
                      {genders.map(g => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    className="mt-1"
                  />
                </div>
              </div>

              <div>
                <Label>Address</Label>
                <Textarea
                  value={formData.address}
                  onChange={(e) => handleChange("address", e.target.value)}
                  rows={2}
                  className="mt-1"
                />
              </div>

              <div>
                <Label>City</Label>
                <Input
                  value={formData.city}
                  onChange={(e) => handleChange("city", e.target.value)}
                  className="mt-1"
                />
              </div>
            </TabsContent>

            <TabsContent value="medical" className="space-y-4 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Patient Type *</Label>
                  <Select
                    value={formData.patient_type}
                    onValueChange={(v) => handleChange("patient_type", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="OPD">OPD (Outpatient)</SelectItem>
                      <SelectItem value="IPD">IPD (Inpatient)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Blood Group</Label>
                  <Select
                    value={formData.blood_group}
                    onValueChange={(v) => handleChange("blood_group", v)}
                  >
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {bloodGroups.map(bg => (
                        <SelectItem key={bg} value={bg}>{bg}</SelectItem>
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
                      <SelectValue placeholder="Select department" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map(d => (
                        <SelectItem key={d} value={d}>{d}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Assigned Doctor</Label>
                  <Select
                    value={formData.assigned_doctor_id}
                    onValueChange={(v) => handleChange("assigned_doctor_id", v)}
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

              {formData.patient_type === "IPD" && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label>Room Number</Label>
                    <Input
                      value={formData.room_number}
                      onChange={(e) => handleChange("room_number", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label>Bed Number</Label>
                    <Input
                      value={formData.bed_number}
                      onChange={(e) => handleChange("bed_number", e.target.value)}
                      className="mt-1"
                    />
                  </div>
                </div>
              )}

              <div>
                <Label>Medical History</Label>
                <Textarea
                  value={formData.medical_history}
                  onChange={(e) => handleChange("medical_history", e.target.value)}
                  rows={3}
                  className="mt-1"
                  placeholder="Any previous conditions, surgeries, etc."
                />
              </div>

              <div>
                <Label>Allergies</Label>
                <Textarea
                  value={formData.allergies}
                  onChange={(e) => handleChange("allergies", e.target.value)}
                  rows={2}
                  className="mt-1"
                  placeholder="Known allergies to medications, food, etc."
                />
              </div>
            </TabsContent>

            <TabsContent value="emergency" className="space-y-4 mt-4">
              <div>
                <Label>Emergency Contact Name</Label>
                <Input
                  value={formData.emergency_contact_name}
                  onChange={(e) => handleChange("emergency_contact_name", e.target.value)}
                  className="mt-1"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Emergency Contact Phone</Label>
                  <Input
                    value={formData.emergency_contact_phone}
                    onChange={(e) => handleChange("emergency_contact_phone", e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label>Relation</Label>
                  <Input
                    value={formData.emergency_contact_relation}
                    onChange={(e) => handleChange("emergency_contact_relation", e.target.value)}
                    placeholder="e.g., Spouse, Parent, Sibling"
                    className="mt-1"
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

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
                patient ? "Update Patient" : "Register Patient"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
