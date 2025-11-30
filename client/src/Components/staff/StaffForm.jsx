import React, { useState } from "react";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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

const roles = [
  { value: "HOSPITAL_ADMIN", label: "Hospital Admin" },
  { value: "DOCTOR", label: "Doctor" },
  { value: "NURSE", label: "Nurse" },
  { value: "PHARMACIST", label: "Pharmacist" },
  { value: "RECEPTIONIST", label: "Receptionist" }
];

const shifts = [
  { value: "MORNING", label: "Morning (6 AM - 2 PM)" },
  { value: "AFTERNOON", label: "Afternoon (2 PM - 10 PM)" },
  { value: "NIGHT", label: "Night (10 PM - 6 AM)" },
  { value: "FLEXIBLE", label: "Flexible" }
];

export default function StaffForm({ 
  open, 
  onClose, 
  onSubmit, 
  staff, 
  departments = [],
  loading 
}) {
  const [formData, setFormData] = useState(staff || {
    first_name: "",
    last_name: "",
    user_email: "",
    phone: "",
    role: "RECEPTIONIST",
    department: "",
    specialization: "",
    license_number: "",
    shift: "FLEXIBLE",
    status: "ACTIVE"
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
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {staff ? "Edit Staff Member" : "Add New Staff"}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 mt-4">
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

          <div>
            <Label>Email *</Label>
            <Input
              type="email"
              value={formData.user_email}
              onChange={(e) => handleChange("user_email", e.target.value)}
              required
              className="mt-1"
              disabled={!!staff}
            />
            {!staff && (
              <p className="text-xs text-slate-500 mt-1">
                This email will be used to invite the user to the system
              </p>
            )}
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
              <Label>Role *</Label>
              <Select
                value={formData.role}
                onValueChange={(v) => handleChange("role", v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(r => (
                    <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
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
              <Label>Shift</Label>
              <Select
                value={formData.shift}
                onValueChange={(v) => handleChange("shift", v)}
              >
                <SelectTrigger className="mt-1">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {shifts.map(s => (
                    <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {formData.role === "DOCTOR" && (
            <>
              <div>
                <Label>Specialization</Label>
                <Input
                  value={formData.specialization}
                  onChange={(e) => handleChange("specialization", e.target.value)}
                  placeholder="e.g., Cardiology, Orthopedics"
                  className="mt-1"
                />
              </div>
              <div>
                <Label>Medical License Number</Label>
                <Input
                  value={formData.license_number}
                  onChange={(e) => handleChange("license_number", e.target.value)}
                  className="mt-1"
                />
              </div>
            </>
          )}

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
                staff ? "Update Staff" : "Add Staff"
              )}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}