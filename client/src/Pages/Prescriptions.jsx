import React, { useState, useEffect } from "react";
import { apiClient } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import {
  Search,
  Plus,
  FileText,
  MoreVertical,
  Edit2,
  Eye,
  Printer,
  CheckCircle,
  Pill
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import PrescriptionForm from "@/components/prescriptions/PrescriptionForm";

const statusColors = {
  ACTIVE: "bg-blue-100 text-blue-700",
  DISPENSED: "bg-green-100 text-green-700",
  COMPLETED: "bg-slate-100 text-slate-700",
  CANCELLED: "bg-red-100 text-red-700"
};

export default function Prescriptions() {
  const [hospitalId, setHospitalId] = useState(null);
  const [staffInfo, setStaffInfo] = useState(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingPrescription, setEditingPrescription] = useState(null);
  const [viewingPrescription, setViewingPrescription] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadStaffInfo();
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      const dropdown = document.querySelector('.dropdown-menu-wrapper');
      if (openDropdownId && dropdown && !dropdown.contains(event.target)) {
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
    }
  };

  const { data: prescriptions = [], isLoading } = useQuery({
    queryKey: ["prescriptions", hospitalId],
    queryFn: () => apiClient.entities.Prescription.filter({ hospital_id: hospitalId }, "-created_date", 500),
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

  const { data: hospital } = useQuery({
    queryKey: ["hospital", hospitalId],
    queryFn: async () => {
      const hospitals = await apiClient.entities.Hospital.filter({ id: hospitalId });
      return hospitals[0];
    },
    enabled: !!hospitalId
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const count = prescriptions.length;
      const prescriptionId = `RX-${String(count + 1).padStart(5, "0")}`;
      
      // Create prescription
      const prescription = await apiClient.entities.Prescription.create({
        ...data,
        hospital_id: hospitalId,
        prescription_id: prescriptionId
      });

      // Find patient to get PAN/Aadhaar for cross-hospital sharing
      const patient = patients.find(p => p.id === data.patient_id);
      if (patient && (patient.pan_number || patient.aadhaar_number)) {
        // Create shareable medical record for prescription
        try {
          await apiClient.entities.MedicalRecord.create({
            patient_pan: patient.pan_number || "",
            patient_aadhaar: patient.aadhaar_number || "",
            patient_name: `${patient.first_name} ${patient.last_name}`,
            hospital_id: hospitalId,
            hospital_name: hospital?.name || "Unknown Hospital",
            record_type: "PRESCRIPTION",
            record_date: format(new Date(), "yyyy-MM-dd"),
            diagnosis: data.diagnosis || "",
            treatment: data.symptoms || "",
            medicines: data.medicines || [],
            doctor_name: data.doctor_name || "",
            department: patient.department || "",
            notes: data.notes || "",
            is_shared: true
          });
          console.log("Medical record created successfully for prescription");
        } catch (err) {
          console.error("Error creating medical record:", err);
        }
      }

      return prescription;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["prescriptions"]);
      queryClient.invalidateQueries(["medicalRecords"]);
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.entities.Prescription.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["prescriptions"]);
      setShowForm(false);
      setEditingPrescription(null);
      setOpenDropdownId(null);
    }
  });

  const handleSubmit = (data) => {
    if (editingPrescription) {
      updateMutation.mutate({ id: editingPrescription.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (rx) => {
    setEditingPrescription(rx);
    setShowForm(true);
    setOpenDropdownId(null);
  };

  const handleViewDetails = (rx) => {
    setViewingPrescription(rx);
    setOpenDropdownId(null);
  };

  const updateStatus = (rx, status) => {
    updateMutation.mutate({ id: rx.id, data: { status } });
  };

  const handlePrint = (rx) => {
    window.print();
    setOpenDropdownId(null);
  };

  // Filter prescriptions
  const filteredPrescriptions = prescriptions.filter(rx => {
    const matchesSearch = 
      rx.patient_name?.toLowerCase().includes(search.toLowerCase()) ||
      rx.prescription_id?.toLowerCase().includes(search.toLowerCase()) ||
      rx.doctor_name?.toLowerCase().includes(search.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || rx.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  // Check if current user is a doctor
  const isDoctor = staffInfo?.role === "DOCTOR";
  const currentDoctor = isDoctor ? staffInfo : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Prescriptions</h1>
          <p className="text-slate-500">{filteredPrescriptions.length} prescriptions</p>
        </div>
        {(isDoctor || staffInfo?.role === "HOSPITAL_ADMIN") && (
          <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            New Prescription
          </Button>
        )}
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by patient, ID, or doctor..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="DISPENSED">Dispensed</SelectItem>
              <SelectItem value="COMPLETED">Completed</SelectItem>
              <SelectItem value="CANCELLED">Cancelled</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Prescriptions Table */}
      <div className="bg-white rounded-xl border border-slate-100">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Prescription ID</TableHead>
                <TableHead>Patient</TableHead>
                <TableHead>Doctor</TableHead>
                <TableHead>Diagnosis</TableHead>
                <TableHead>Medicines</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredPrescriptions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-12">
                    <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500">No prescriptions found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPrescriptions.map((rx) => (
                  <TableRow key={rx.id} className="hover:bg-slate-50">
                    <TableCell>
                      <span className="font-mono text-sm text-teal-600 font-medium">
                        {rx.prescription_id}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium text-slate-800">
                      {rx.patient_name}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      Dr. {rx.doctor_name}
                    </TableCell>
                    <TableCell className="text-slate-600 max-w-xs truncate">
                      {rx.diagnosis || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Pill className="w-4 h-4 text-slate-400" />
                        <span className="text-slate-600">
                          {rx.medicines?.length || 0} items
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {format(new Date(rx.created_date), "MMM d, yyyy")}
                    </TableCell>
                    <TableCell>
                      <Badge className={statusColors[rx.status]}>
                        {rx.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="relative dropdown-menu-wrapper">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          onClick={() => setOpenDropdownId(openDropdownId === rx.id ? null : rx.id)}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        
                        {openDropdownId === rx.id && (
                          <div 
                            className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-[100]"
                            style={{ position: 'absolute', right: 0, top: '100%' }}
                          >
                            <button
                              onClick={() => handleViewDetails(rx)}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 w-full text-left transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            
                            {(isDoctor || staffInfo?.role === "HOSPITAL_ADMIN") && (
                              <button
                                onClick={() => handleEdit(rx)}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 w-full text-left transition-colors"
                              >
                                <Edit2 className="w-4 h-4" />
                                Edit
                              </button>
                            )}
                            
                            <div className="border-t border-slate-100 my-1"></div>
                            
                            {staffInfo?.role === "PHARMACIST" && rx.status === "ACTIVE" && (
                              <button
                                onClick={() => updateStatus(rx, "DISPENSED")}
                                className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-green-50 w-full text-left text-green-700 transition-colors"
                              >
                                <CheckCircle className="w-4 h-4" />
                                Mark as Dispensed
                              </button>
                            )}
                            
                            <button
                              onClick={() => handlePrint(rx)}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 w-full text-left transition-colors"
                            >
                              <Printer className="w-4 h-4" />
                              Print
                            </button>
                          </div>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Prescription Form Dialog */}
      <PrescriptionForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingPrescription(null);
        }}
        onSubmit={handleSubmit}
        prescription={editingPrescription}
        patients={patients}
        doctors={doctors}
        currentDoctor={currentDoctor}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* View Prescription Dialog */}
      <Dialog open={!!viewingPrescription} onOpenChange={() => setViewingPrescription(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <FileText className="w-5 h-5 text-teal-600" />
              Prescription {viewingPrescription?.prescription_id}
            </DialogTitle>
          </DialogHeader>
          
          {viewingPrescription && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Patient</p>
                  <p className="font-medium">{viewingPrescription.patient_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Doctor</p>
                  <p className="font-medium">Dr. {viewingPrescription.doctor_name}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date</p>
                  <p className="font-medium">
                    {format(new Date(viewingPrescription.created_date), "MMMM d, yyyy")}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Status</p>
                  <Badge className={statusColors[viewingPrescription.status]}>
                    {viewingPrescription.status}
                  </Badge>
                </div>
              </div>

              {viewingPrescription.diagnosis && (
                <div>
                  <p className="text-sm text-slate-500">Diagnosis</p>
                  <p className="font-medium">{viewingPrescription.diagnosis}</p>
                </div>
              )}

              <div>
                <p className="text-sm text-slate-500 mb-3">Medicines</p>
                <div className="space-y-3">
                  {viewingPrescription.medicines?.map((med, i) => (
                    <div key={i} className="p-4 bg-slate-50 rounded-xl">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-slate-800">{med.name}</p>
                          <p className="text-sm text-slate-600">
                            {med.dosage} • {med.frequency} • {med.duration}
                          </p>
                        </div>
                        <Pill className="w-5 h-5 text-teal-600" />
                      </div>
                      {med.instructions && (
                        <p className="text-sm text-slate-500 mt-2 italic">{med.instructions}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {viewingPrescription.notes && (
                <div>
                  <p className="text-sm text-slate-500">Notes</p>
                  <p className="text-slate-700">{viewingPrescription.notes}</p>
                </div>
              )}

              {viewingPrescription.follow_up_date && (
                <div>
                  <p className="text-sm text-slate-500">Follow-up Date</p>
                  <p className="font-medium">
                    {format(new Date(viewingPrescription.follow_up_date), "MMMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}