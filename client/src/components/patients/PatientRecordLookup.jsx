import React, { useState } from "react";
import { apiClient } from "@/api/apiClient";
import { format } from "date-fns";
import {
  Search,
  FileText,
  Pill,
  Stethoscope,
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle,
  Loader2,
  Download,
  User,
  Shield,
  Clock
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Badge } from "@/components/ui/Badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/Dialog";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/Tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";

const recordTypeIcons = {
  DIAGNOSIS: Stethoscope,
  PRESCRIPTION: Pill,
  LAB_REPORT: FileText,
  ADMISSION: Building2,
  DISCHARGE: CheckCircle,
  SURGERY: Stethoscope,
  ALLERGY: AlertTriangle,
  VACCINATION: Shield
};

const recordTypeColors = {
  DIAGNOSIS: "bg-blue-100 text-blue-700",
  PRESCRIPTION: "bg-purple-100 text-purple-700",
  LAB_REPORT: "bg-amber-100 text-amber-700",
  ADMISSION: "bg-teal-100 text-teal-700",
  DISCHARGE: "bg-green-100 text-green-700",
  SURGERY: "bg-red-100 text-red-700",
  ALLERGY: "bg-orange-100 text-orange-700",
  VACCINATION: "bg-indigo-100 text-indigo-700"
};

export default function PatientRecordLookup({ 
  open, 
  onClose, 
  onImportRecords,
  currentHospitalId 
}) {
  const [searchType, setSearchType] = useState("pan");
  const [searchValue, setSearchValue] = useState("");
  const [loading, setLoading] = useState(false);
  const [patientInfo, setPatientInfo] = useState(null);
  const [medicalRecords, setMedicalRecords] = useState([]);
  const [error, setError] = useState("");
  const [importing, setImporting] = useState(false);

  // Replace the handleSearch function in PatientRecordLookup.jsx with this:

const handleSearch = async () => {
  if (!searchValue.trim()) {
    setError("Please enter a valid PAN or Aadhaar number");
    return;
  }

  setLoading(true);
  setError("");
  setPatientInfo(null);
  setMedicalRecords([]);

  try {
    // Search for patient records across all hospitals using PAN/Aadhaar
    const query = searchType === "pan" 
      ? { patient_pan: searchValue.toUpperCase() }
      : { patient_aadhaar: searchValue };

    console.log("Searching for medical records with query:", query);
    const records = await apiClient.entities.MedicalRecord.filter(query, "-record_date", 100);
    console.log("Found medical records:", records.length);
    
    if (records.length === 0) {
      // Also check if patient exists in any hospital
      const patientQuery = searchType === "pan"
        ? { pan_number: searchValue.toUpperCase() }
        : { aadhaar_number: searchValue };
      
      const patients = await apiClient.entities.Patient.filter(patientQuery, "-created_date", 10);
      console.log("Found patients:", patients.length);
      
      if (patients.length === 0) {
        setError("No records found for this " + (searchType === "pan" ? "PAN" : "Aadhaar") + " number");
        setLoading(false);
        return;
      }

      // Patient exists - create initial medical record if they have medical history
      const patient = patients[0];
      setPatientInfo({
        name: `${patient.first_name} ${patient.last_name}`,
        dob: patient.date_of_birth,
        gender: patient.gender,
        blood_group: patient.blood_group,
        allergies: patient.allergies,
        medical_history: patient.medical_history
      });

      // Check if patient has any existing data worth sharing
      if (patient.medical_history || patient.allergies) {
        // Get hospital info
        const hospitals = await apiClient.entities.Hospital.filter({ id: patient.hospital_id });
        const hospitalName = hospitals[0]?.name || "Unknown Hospital";
        
        // Create a medical record from existing patient data
        try {
          const newRecord = await apiClient.entities.MedicalRecord.create({
            patient_pan: patient.pan_number || "",
            patient_aadhaar: patient.aadhaar_number || "",
            patient_name: `${patient.first_name} ${patient.last_name}`,
            hospital_id: patient.hospital_id,
            hospital_name: hospitalName,
            record_type: "DIAGNOSIS",
            record_date: patient.admission_date || format(new Date(), "yyyy-MM-dd"),
            diagnosis: "Patient History",
            treatment: patient.medical_history || "Patient registered",
            medicines: [],
            doctor_name: "",
            department: patient.department || "General",
            notes: patient.allergies ? `Allergies: ${patient.allergies}` : "",
            is_shared: true
          });
          console.log("Created medical record from patient data:", newRecord);
          setMedicalRecords([newRecord]);
        } catch (err) {
          console.error("Error creating medical record:", err);
          setMedicalRecords([]);
        }
      } else {
        setMedicalRecords([]);
      }
    } else {
      // Found medical records
      setPatientInfo({
        name: records[0].patient_name,
        pan: searchType === "pan" ? searchValue.toUpperCase() : null,
        aadhaar: searchType === "aadhaar" ? searchValue : null
      });
      setMedicalRecords(records);
    }
  } catch (err) {
    console.error("Search error:", err);
    setError("Failed to search records. Please try again.");
  } finally {
    setLoading(false);
  }
};

  const handleImport = async () => {
    setImporting(true);
    try {
      const importData = {
        patientInfo,
        records: medicalRecords,
        pan: searchType === "pan" ? searchValue.toUpperCase() : null,
        aadhaar: searchType === "aadhaar" ? searchValue : null
      };
      await onImportRecords(importData);
      onClose();
    } catch (err) {
      setError("Failed to import records");
    } finally {
      setImporting(false);
    }
  };

  const groupedRecords = medicalRecords.reduce((acc, record) => {
    const hospital = record.hospital_name || "Unknown Hospital";
    if (!acc[hospital]) acc[hospital] = [];
    acc[hospital].push(record);
    return acc;
  }, {});

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Shield className="w-6 h-6 text-teal-600" />
            Patient Record Transfer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          {/* Search Section */}
          <Card className="border-teal-100">
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Search Patient Records</CardTitle>
              <CardDescription>
                Enter patient's PAN or Aadhaar number to fetch their complete medical history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex gap-4">
                <Select value={searchType} onValueChange={setSearchType}>
                  <SelectTrigger className="w-40">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pan">PAN Number</SelectItem>
                    <SelectItem value="aadhaar">Aadhaar Number</SelectItem>
                  </SelectContent>
                </Select>
                <div className="flex-1 relative">
                  <Input
                    placeholder={searchType === "pan" ? "Enter PAN (e.g., ABCDE1234F)" : "Enter 12-digit Aadhaar"}
                    value={searchValue}
                    onChange={(e) => setSearchValue(e.target.value)}
                    onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                    className="pr-10"
                  />
                </div>
                <Button 
                  onClick={handleSearch} 
                  disabled={loading}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {loading ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Search
                    </>
                  )}
                </Button>
              </div>

              {error && (
                <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" />
                  {error}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Results Section */}
          {patientInfo && (
            <>
              {/* Patient Info Card */}
              <Card className="border-green-100 bg-green-50/50">
                <CardContent className="pt-6">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full bg-teal-100 flex items-center justify-center">
                        <User className="w-8 h-8 text-teal-600" />
                      </div>
                      <div>
                        <h3 className="text-xl font-semibold text-slate-800">{patientInfo.name}</h3>
                        <div className="flex items-center gap-4 mt-1 text-sm text-slate-600">
                          {patientInfo.dob && (
                            <span>DOB: {format(new Date(patientInfo.dob), "MMM d, yyyy")}</span>
                          )}
                          {patientInfo.gender && <span>{patientInfo.gender}</span>}
                          {patientInfo.blood_group && (
                            <Badge variant="outline">{patientInfo.blood_group}</Badge>
                          )}
                        </div>
                        <p className="text-sm text-slate-500 mt-1">
                          {searchType === "pan" ? "PAN" : "Aadhaar"}: {searchValue.toUpperCase()}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className="bg-green-100 text-green-700">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Verified
                      </Badge>
                    </div>
                  </div>

                  {patientInfo.allergies && (
                    <div className="mt-4 p-3 bg-orange-50 border border-orange-100 rounded-lg">
                      <div className="flex items-center gap-2 text-orange-700">
                        <AlertTriangle className="w-4 h-4" />
                        <span className="font-medium">Allergies:</span>
                        <span>{patientInfo.allergies}</span>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Medical Records */}
              {medicalRecords.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="font-semibold text-slate-800">
                      Medical History ({medicalRecords.length} records)
                    </h3>
                    <Button 
                      onClick={handleImport} 
                      disabled={importing}
                      className="bg-teal-600 hover:bg-teal-700"
                    >
                      {importing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Importing...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Import All Records
                        </>
                      )}
                    </Button>
                  </div>

                  <Tabs defaultValue="all" className="w-full">
                    <TabsList>
                      <TabsTrigger value="all">All Records</TabsTrigger>
                      <TabsTrigger value="diagnosis">Diagnoses</TabsTrigger>
                      <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
                      <TabsTrigger value="labs">Lab Reports</TabsTrigger>
                    </TabsList>

                    <TabsContent value="all" className="mt-4 space-y-4">
                      {Object.entries(groupedRecords).map(([hospital, records]) => (
                        <Card key={hospital}>
                          <CardHeader className="pb-2">
                            <div className="flex items-center gap-2">
                              <Building2 className="w-4 h-4 text-slate-500" />
                              <CardTitle className="text-sm font-medium">{hospital}</CardTitle>
                            </div>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            {records.map((record, idx) => {
                              const Icon = recordTypeIcons[record.record_type] || FileText;
                              return (
                                <div 
                                  key={idx} 
                                  className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                                >
                                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${recordTypeColors[record.record_type]}`}>
                                    <Icon className="w-5 h-5" />
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                      <Badge className={recordTypeColors[record.record_type]}>
                                        {record.record_type?.replace("_", " ")}
                                      </Badge>
                                      <span className="text-sm text-slate-500 flex items-center gap-1">
                                        <Clock className="w-3 h-3" />
                                        {record.record_date && format(new Date(record.record_date), "MMM d, yyyy")}
                                      </span>
                                    </div>
                                    {record.diagnosis && (
                                      <p className="font-medium text-slate-800 mt-1">{record.diagnosis}</p>
                                    )}
                                    {record.treatment && (
                                      <p className="text-sm text-slate-600 mt-1">{record.treatment}</p>
                                    )}
                                    {record.doctor_name && (
                                      <p className="text-sm text-slate-500 mt-1">
                                        Dr. {record.doctor_name} • {record.department}
                                      </p>
                                    )}
                                    {record.medicines && record.medicines.length > 0 && (
                                      <div className="mt-2 flex flex-wrap gap-1">
                                        {record.medicines.map((med, i) => (
                                          <Badge key={i} variant="outline" className="text-xs">
                                            {med.name}
                                          </Badge>
                                        ))}
                                      </div>
                                    )}
                                  </div>
                                </div>
                              );
                            })}
                          </CardContent>
                        </Card>
                      ))}
                    </TabsContent>

                    <TabsContent value="diagnosis" className="mt-4">
                      <div className="space-y-3">
                        {medicalRecords
                          .filter(r => r.record_type === "DIAGNOSIS")
                          .map((record, idx) => (
                            <Card key={idx} className="p-4">
                              <div className="flex items-start gap-3">
                                <Stethoscope className="w-5 h-5 text-blue-600 mt-1" />
                                <div>
                                  <p className="font-medium">{record.diagnosis}</p>
                                  <p className="text-sm text-slate-500">
                                    {record.hospital_name} • {record.record_date && format(new Date(record.record_date), "MMM d, yyyy")}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="prescriptions" className="mt-4">
                      <div className="space-y-3">
                        {medicalRecords
                          .filter(r => r.record_type === "PRESCRIPTION")
                          .map((record, idx) => (
                            <Card key={idx} className="p-4">
                              <div className="flex items-start gap-3">
                                <Pill className="w-5 h-5 text-purple-600 mt-1" />
                                <div className="flex-1">
                                  <p className="font-medium">{record.diagnosis}</p>
                                  <p className="text-sm text-slate-500 mb-2">
                                    Dr. {record.doctor_name} • {record.hospital_name}
                                  </p>
                                  {record.medicines?.map((med, i) => (
                                    <div key={i} className="text-sm bg-slate-50 p-2 rounded mt-1">
                                      <span className="font-medium">{med.name}</span>
                                      <span className="text-slate-500"> - {med.dosage}, {med.frequency}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>

                    <TabsContent value="labs" className="mt-4">
                      <div className="space-y-3">
                        {medicalRecords
                          .filter(r => r.record_type === "LAB_REPORT")
                          .map((record, idx) => (
                            <Card key={idx} className="p-4">
                              <div className="flex items-start gap-3">
                                <FileText className="w-5 h-5 text-amber-600 mt-1" />
                                <div>
                                  <p className="font-medium">{record.diagnosis || "Lab Report"}</p>
                                  <p className="text-sm text-slate-600">{record.lab_results}</p>
                                  <p className="text-sm text-slate-500 mt-1">
                                    {record.hospital_name} • {record.record_date && format(new Date(record.record_date), "MMM d, yyyy")}
                                  </p>
                                </div>
                              </div>
                            </Card>
                          ))}
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>
              ) : (
                <Card className="border-slate-200">
                  <CardContent className="py-8 text-center">
                    <FileText className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                    <p className="text-slate-500">No shared medical records found</p>
                    <p className="text-sm text-slate-400 mt-1">
                      The patient exists but has no transferable records
                    </p>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
