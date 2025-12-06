import React, { useState, useEffect } from "react";
import { apiClient } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Plus,
  Filter,
  Download,
  MoreVertical,
  Edit2,
  Eye,
  FileText,
  User,
  ArrowDownUp,
  Shield,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
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
import PatientForm from "@/components/patients/PatientForm";
import PatientRecordLookup from "@/components/patients/PatientRecordLookup";

export default function Patients() {
  const navigate = useNavigate();
  const [hospitalId, setHospitalId] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingPatient, setEditingPatient] = useState(null);
  const [showRecordLookup, setShowRecordLookup] = useState(false);
  const [viewingPatient, setViewingPatient] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const queryClient = useQueryClient();

  useEffect(() => {
    loadStaffInfo();
  }, []);

  // FIXED: Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if the click is on a dropdown button or inside a dropdown
      const isDropdownButton = event.target.closest('.dropdown-toggle');
      const isDropdownMenu = event.target.closest('.dropdown-menu-wrapper');
      
      if (openDropdownId && !isDropdownButton && !isDropdownMenu) {
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
      setHospitalId(staff[0].hospital_id);
      const hospitals = await apiClient.entities.Hospital.filter({ id: staff[0].hospital_id });
      if (hospitals.length > 0) {
        setHospital(hospitals[0]);
      }
    }
  };

  const { data: patients = [], isLoading } = useQuery({
    queryKey: ["patients", hospitalId],
    queryFn: () => apiClient.entities.Patient.filter({ hospital_id: hospitalId }, "-created_date", 500),
    enabled: !!hospitalId
  });

  const { data: doctors = [] } = useQuery({
    queryKey: ["doctors", hospitalId],
    queryFn: () => apiClient.entities.HospitalStaff.filter({ hospital_id: hospitalId, role: "DOCTOR" }),
    enabled: !!hospitalId
  });

  const { data: prescriptions = [] } = useQuery({
    queryKey: ["prescriptions", hospitalId],
    queryFn: () => apiClient.entities.Prescription.filter({ hospital_id: hospitalId }),
    enabled: !!hospitalId
  });

  const createMutation = useMutation({
    mutationFn: async (data) => {
      const count = patients.length;
      const patientId = `P-${String(count + 1).padStart(5, "0")}`;
      
      const patient = await apiClient.entities.Patient.create({
        ...data,
        hospital_id: hospitalId,
        patient_id: patientId,
        status: "ACTIVE",
        admission_date: data.patient_type === "IPD" ? format(new Date(), "yyyy-MM-dd") : null
      });

      // Create initial medical record
      if (patient && (data.pan_number || data.aadhaar_number)) {
        try {
          await apiClient.entities.MedicalRecord.create({
            patient_pan: data.pan_number || "",
            patient_aadhaar: data.aadhaar_number || "",
            patient_name: `${data.first_name} ${data.last_name}`,
            patient_dob: data.date_of_birth,
            patient_gender: data.gender,
            patient_blood_group: data.blood_group,
            patient_allergies: data.allergies,
            patient_medical_history: data.medical_history,
            hospital_id: hospitalId,
            hospital_name: hospital?.name || "Unknown Hospital",
            record_type: data.patient_type === "IPD" ? "ADMISSION" : "DIAGNOSIS",
            record_date: format(new Date(), "yyyy-MM-dd"),
            diagnosis: "Initial Registration",
            treatment: data.medical_history || "Patient registered",
            medicines: [],
            doctor_name: "",
            department: data.department || "General",
            notes: data.allergies ? `Allergies: ${data.allergies}` : "",
            is_shared: true
          });
        } catch (err) {
          console.error("Error creating initial medical record:", err);
        }
      }

      return patient;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["patients"]);
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.entities.Patient.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["patients"]);
      setShowForm(false);
      setEditingPatient(null);
    }
  });

  const handleSubmit = (data) => {
    if (editingPatient) {
      updateMutation.mutate({ id: editingPatient.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (patient) => {
    setEditingPatient(patient);
    setShowForm(true);
    setOpenDropdownId(null);
  };

  const handleViewDetails = (patient) => {
    setViewingPatient(patient);
    setOpenDropdownId(null);
  };

  const handleViewPrescriptions = (patient) => {
    navigate('/prescriptions', { 
      state: { 
        filterPatientId: patient.id,
        patientName: `${patient.first_name} ${patient.last_name}`
      } 
    });
    setOpenDropdownId(null);
  };

  const handleCreateAppointment = (patient) => {
    navigate('/appointments', { 
      state: { 
        createAppointment: true,
        patientId: patient.id,
        patientName: `${patient.first_name} ${patient.last_name}`
      } 
    });
    setOpenDropdownId(null);
  };

  const handleImportRecords = async (importData) => {
    const count = patients.length;
    const patientId = `P-${String(count + 1).padStart(5, "0")}`;
    
    const patientData = {
      hospital_id: hospitalId,
      patient_id: patientId,
      first_name: importData.patientInfo.name?.split(" ")[0] || "",
      last_name: importData.patientInfo.name?.split(" ").slice(1).join(" ") || "",
      date_of_birth: importData.patientInfo.dob,
      gender: importData.patientInfo.gender,
      blood_group: importData.patientInfo.blood_group,
      allergies: importData.patientInfo.allergies,
      medical_history: importData.patientInfo.medical_history,
      pan_number: importData.pan,
      aadhaar_number: importData.aadhaar,
      patient_type: "OPD",
      status: "ACTIVE",
      imported_from_hospital: importData.records[0]?.hospital_name || "External Hospital",
      imported_records: importData.records
    };

    await apiClient.entities.Patient.create(patientData);
    queryClient.invalidateQueries(["patients"]);
  };

  const filteredPatients = patients.filter(patient => {
    const matchesSearch = 
      patient.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      patient.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      patient.patient_id?.toLowerCase().includes(search.toLowerCase()) ||
      patient.phone?.includes(search);
    
    const matchesType = typeFilter === "all" || patient.patient_type === typeFilter;
    const matchesStatus = statusFilter === "all" || patient.status === statusFilter;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case "ACTIVE": return "bg-green-100 text-green-700";
      case "DISCHARGED": return "bg-slate-100 text-slate-700";
      case "TRANSFERRED": return "bg-blue-100 text-blue-700";
      default: return "bg-slate-100 text-slate-600";
    }
  };

  const exportToCSV = () => {
    const headers = ["Patient ID", "Name", "Type", "Department", "Phone", "Status", "Admission Date"];
    const rows = filteredPatients.map(p => [
      p.patient_id,
      `${p.first_name} ${p.last_name}`,
      p.patient_type,
      p.department || "",
      p.phone || "",
      p.status,
      p.admission_date || ""
    ]);
    
    const csv = [headers, ...rows].map(row => row.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `patients-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Patients</h1>
          <p className="text-slate-500">{filteredPatients.length} patients registered</p>
        </div>
        <div className="flex gap-2">
          <Button 
            onClick={() => setShowRecordLookup(true)} 
            variant="outline"
            className="border-teal-200 text-teal-700 hover:bg-teal-50"
          >
            <ArrowDownUp className="w-4 h-4 mr-2" />
            Transfer Records
          </Button>
          <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700">
            <Plus className="w-4 h-4 mr-2" />
            Register Patient
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name, ID, or phone..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="OPD">OPD</SelectItem>
              <SelectItem value="IPD">IPD</SelectItem>
            </SelectContent>
          </Select>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="ACTIVE">Active</SelectItem>
              <SelectItem value="DISCHARGED">Discharged</SelectItem>
              <SelectItem value="TRANSFERRED">Transferred</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={exportToCSV}>
            <Download className="w-4 h-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-slate-100">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50">
                <TableHead>Patient</TableHead>
                <TableHead>ID</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Department</TableHead>
                <TableHead>Contact</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-12"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredPatients.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-12">
                    <User className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500">No patients found</p>
                  </TableCell>
                </TableRow>
              ) : (
                filteredPatients.map((patient) => (
                  <TableRow key={patient.id} className="hover:bg-slate-50">
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <Avatar className="h-10 w-10">
                          <AvatarFallback className="bg-teal-100 text-teal-700 font-medium">
                            {patient.first_name?.[0]}{patient.last_name?.[0]}
                          </AvatarFallback>
                        </Avatar>
                        <div>
                          <p className="font-medium text-slate-800">
                            {patient.first_name} {patient.last_name}
                          </p>
                          <p className="text-sm text-slate-500">
                            {patient.gender} • {patient.blood_group || "N/A"}
                            {patient.imported_from_hospital && (
                              <span className="ml-2 inline-flex items-center text-teal-600">
                                <Shield className="w-3 h-3 mr-1" />
                                Transferred
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm text-slate-600">{patient.patient_id}</span>
                    </TableCell>
                    <TableCell>
                      <Badge className={patient.patient_type === "IPD" 
                        ? "bg-purple-100 text-purple-700" 
                        : "bg-blue-100 text-blue-700"
                      }>
                        {patient.patient_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {patient.department || "-"}
                    </TableCell>
                    <TableCell className="text-slate-600">
                      {patient.phone || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(patient.status)}>
                        {patient.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="relative dropdown-menu-wrapper">
                        <Button 
                          variant="ghost" 
                          size="icon"
                          className="dropdown-toggle"
                          onClick={(e) => {
                            e.stopPropagation();
                            setOpenDropdownId(openDropdownId === patient.id ? null : patient.id);
                          }}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                        
                        {openDropdownId === patient.id && (
                          <div 
                            className="absolute right-0 top-full mt-1 w-56 bg-white rounded-lg shadow-xl border border-slate-200 py-1"
                            style={{ 
                              position: 'absolute', 
                              right: 0, 
                              top: '100%',
                              zIndex: 9999 
                            }}
                          >
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewDetails(patient);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 w-full text-left transition-colors"
                            >
                              <Eye className="w-4 h-4" />
                              View Details
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEdit(patient);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 w-full text-left transition-colors"
                            >
                              <Edit2 className="w-4 h-4" />
                              Edit Patient
                            </button>
                            
                            <div className="border-t border-slate-100 my-1"></div>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleViewPrescriptions(patient);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-blue-50 w-full text-left text-blue-700 transition-colors"
                            >
                              <FileText className="w-4 h-4" />
                              View Prescriptions
                            </button>
                            
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCreateAppointment(patient);
                              }}
                              className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-teal-50 w-full text-left text-teal-700 transition-colors"
                            >
                              <Activity className="w-4 h-4" />
                              Book Appointment
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

      <PatientForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingPatient(null);
        }}
        onSubmit={handleSubmit}
        patient={editingPatient}
        departments={hospital?.departments || []}
        doctors={doctors}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      <PatientRecordLookup
        open={showRecordLookup}
        onClose={() => setShowRecordLookup(false)}
        onImportRecords={handleImportRecords}
        currentHospitalId={hospitalId}
      />

      <Dialog open={!!viewingPatient} onOpenChange={() => setViewingPatient(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <User className="w-5 h-5 text-teal-600" />
              Patient Details
            </DialogTitle>
          </DialogHeader>
          
          {viewingPatient && (
            <div className="space-y-6 mt-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-slate-500">Patient ID</p>
                  <p className="font-mono font-medium">{viewingPatient.patient_id}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Full Name</p>
                  <p className="font-medium">
                    {viewingPatient.first_name} {viewingPatient.last_name}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Date of Birth</p>
                  <p className="font-medium">
                    {viewingPatient.date_of_birth ? format(new Date(viewingPatient.date_of_birth), "MMMM d, yyyy") : "-"}
                  </p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Gender</p>
                  <p className="font-medium">{viewingPatient.gender}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Blood Group</p>
                  <p className="font-medium">{viewingPatient.blood_group || "-"}</p>
                </div>
                <div>
                  <p className="text-sm text-slate-500">Patient Type</p>
                  <Badge className={viewingPatient.patient_type === "IPD" 
                    ? "bg-purple-100 text-purple-700" 
                    : "bg-blue-100 text-blue-700"
                  }>
                    {viewingPatient.patient_type}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Contact Information</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-slate-500">Phone</p>
                    <p className="font-medium">{viewingPatient.phone || "-"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-slate-500">Email</p>
                    <p className="font-medium">{viewingPatient.email || "-"}</p>
                  </div>
                  <div className="col-span-2">
                    <p className="text-sm text-slate-500">Address</p>
                    <p className="font-medium">{viewingPatient.address || "-"}</p>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-semibold text-slate-800 mb-3">Medical Information</h3>
                <div className="space-y-3">
                  <div>
                    <p className="text-sm text-slate-500">Department</p>
                    <p className="font-medium">{viewingPatient.department || "-"}</p>
                  </div>
                  {viewingPatient.allergies && (
                    <div>
                      <p className="text-sm text-slate-500">Allergies</p>
                      <p className="font-medium text-red-600">{viewingPatient.allergies}</p>
                    </div>
                  )}
                  {viewingPatient.medical_history && (
                    <div>
                      <p className="text-sm text-slate-500">Medical History</p>
                      <p className="font-medium">{viewingPatient.medical_history}</p>
                    </div>
                  )}
                </div>
              </div>

              {viewingPatient.imported_from_hospital && (
                <div className="p-4 bg-teal-50 rounded-lg border border-teal-100">
                  <div className="flex items-center gap-2 mb-2">
                    <Shield className="w-4 h-4 text-teal-600" />
                    <p className="font-semibold text-teal-800">Transferred Patient</p>
                  </div>
                  <p className="text-sm text-teal-700">
                    Records transferred from: {viewingPatient.imported_from_hospital}
                  </p>
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={() => {
                    setViewingPatient(null);
                    handleEdit(viewingPatient);
                  }}
                  variant="outline"
                >
                  <Edit2 className="w-4 h-4 mr-2" />
                  Edit
                </Button>
                <Button 
                  onClick={() => {
                    setViewingPatient(null);
                    handleViewPrescriptions(viewingPatient);
                  }}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  <FileText className="w-4 h-4 mr-2" />
                  View Prescriptions
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}