import React, { useState } from "react";
import { Link } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { apiClient } from "@/api/apiClient";
import {
  Building2,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  Mail,
  Phone,
  MapPin,
  FileText,
  Loader2
} from "lucide-react";
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
import { Card, CardContent } from "@/components/ui/card";

export default function HospitalRegistration() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    license_number: "",
    address: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    admin_email: "",
    admin_first_name: "",
    admin_last_name: "",
    admin_phone: "",
    departments: []
  });

  const departments = [
    "General Medicine",
    "Pediatrics",
    "Cardiology",
    "Orthopedics",
    "Neurology",
    "Dermatology",
    "Ophthalmology",
    "ENT",
    "Gynecology",
    "Psychiatry",
    "Emergency",
    "ICU",
    "Radiology",
    "Pathology",
    "Pharmacy"
  ];

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError("");
  };

  const toggleDepartment = (dept) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.includes(dept)
        ? prev.departments.filter(d => d !== dept)
        : [...prev.departments, dept]
    }));
  };

  const validateStep = () => {
    if (step === 1) {
      if (!formData.name || !formData.license_number || !formData.email || !formData.phone) {
        setError("Please fill in all required fields");
        return false;
      }
    }
    if (step === 2) {
      if (!formData.address || !formData.city || !formData.state) {
        setError("Please fill in all address fields");
        return false;
      }
    }
    if (step === 3) {
      if (!formData.admin_email || !formData.admin_first_name || !formData.admin_last_name) {
        setError("Please fill in all admin details");
        return false;
      }
    }
    return true;
  };

  const nextStep = () => {
    if (validateStep()) {
      setStep(step + 1);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    setError("");
  };

  const generateTenantId = () => {
    return 'HOSP-' + Math.random().toString(36).substr(2, 9).toUpperCase();
  };

  const handleSubmit = async () => {
    if (!validateStep()) return;
    
    setLoading(true);
    setError("");
    
    try {
      // Check if license number already exists
      const existingHospitals = await apiClient.entities.Hospital.filter({ 
        license_number: formData.license_number 
      });
      
      if (existingHospitals.length > 0) {
        setError("A hospital with this license number already exists");
        setLoading(false);
        return;
      }

      // Create hospital
      const tenantId = generateTenantId();
      const hospital = await apiClient.entities.Hospital.create({
        name: formData.name,
        license_number: formData.license_number,
        address: formData.address,
        city: formData.city,
        state: formData.state,
        phone: formData.phone,
        email: formData.email,
        admin_email: formData.admin_email,
        tenant_id: tenantId,
        departments: formData.departments.length > 0 ? formData.departments : departments.slice(0, 5),
        status: "PENDING"
      });

      // Create admin staff record
      await apiClient.entities.HospitalStaff.create({
        hospital_id: hospital.id,
        user_email: formData.admin_email,
        first_name: formData.admin_first_name,
        last_name: formData.admin_last_name,
        phone: formData.admin_phone,
        role: "HOSPITAL_ADMIN",
        status: "ACTIVE"
      });

      // Send welcome email
      try {
        await apiClient.integrations.Core.SendEmail({
          to: formData.admin_email,
          subject: `Welcome to MediFlow - ${formData.name}`,
          body: `
            <h2>Welcome to MediFlow!</h2>
            <p>Dear ${formData.admin_first_name},</p>
            <p>Your hospital <strong>${formData.name}</strong> has been successfully registered on our platform.</p>
            <p><strong>Tenant ID:</strong> ${tenantId}</p>
            <p><strong>License Number:</strong> ${formData.license_number}</p>
            <p>Your hospital status is currently <strong>PENDING</strong>. Once verified, you'll have full access to all features.</p>
            <p>Please sign in to complete your setup.</p>
            <br/>
            <p>Best regards,<br/>MediFlow Team</p>
          `
        });
      } catch (e) {
        console.log("Email sending skipped");
      }

      setSuccess(true);
    } catch (err) {
      setError("Failed to register hospital. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle2 className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Registration Successful!</h2>
            <p className="text-slate-600 mb-6">
              Your hospital has been registered. Check your email for verification instructions.
            </p>
            <Link to={createPageUrl("Home")}>
              <Button className="bg-teal-600 hover:bg-teal-700">
                Go to Home Page
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="bg-white border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link to={createPageUrl("Home")} className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-800">MediFlow</span>
            </Link>
            <Link to={createPageUrl("Home")}>
              <Button variant="ghost" className="text-slate-600">
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Home
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-2xl mx-auto px-4 py-12">
        {/* Progress Steps */}
        <div className="flex items-center justify-center mb-12">
          {[1, 2, 3, 4].map((s) => (
            <React.Fragment key={s}>
              <div
                className={`w-10 h-10 rounded-full flex items-center justify-center font-medium transition-all ${
                  s <= step
                    ? "bg-teal-600 text-white"
                    : "bg-slate-100 text-slate-400"
                }`}
              >
                {s < step ? <CheckCircle2 className="w-5 h-5" /> : s}
              </div>
              {s < 4 && (
                <div
                  className={`w-16 sm:w-24 h-1 mx-1 rounded transition-all ${
                    s < step ? "bg-teal-600" : "bg-slate-100"
                  }`}
                />
              )}
            </React.Fragment>
          ))}
        </div>

        <Card className="shadow-lg border-0">
          <CardContent className="p-8">
            {/* Step 1: Hospital Info */}
            {step === 1 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Building2 className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-slate-800">Hospital Information</h2>
                  <p className="text-slate-500 mt-2">Basic details about your hospital</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="name">Hospital Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => handleChange("name", e.target.value)}
                      placeholder="City General Hospital"
                      className="mt-1"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="license">License Number *</Label>
                    <div className="relative mt-1">
                      <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="license"
                        value={formData.license_number}
                        onChange={(e) => handleChange("license_number", e.target.value)}
                        placeholder="MED-2024-XXXXX"
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="email">Hospital Email *</Label>
                      <div className="relative mt-1">
                        <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="email"
                          type="email"
                          value={formData.email}
                          onChange={(e) => handleChange("email", e.target.value)}
                          placeholder="info@hospital.com"
                          className="pl-10"
                        />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <div className="relative mt-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                        <Input
                          id="phone"
                          value={formData.phone}
                          onChange={(e) => handleChange("phone", e.target.value)}
                          placeholder="+1 234 567 8900"
                          className="pl-10"
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Address */}
            {step === 2 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <MapPin className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-slate-800">Hospital Address</h2>
                  <p className="text-slate-500 mt-2">Where is your hospital located?</p>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="address">Street Address *</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => handleChange("address", e.target.value)}
                      placeholder="123 Healthcare Avenue, Medical District"
                      className="mt-1"
                      rows={3}
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">City *</Label>
                      <Input
                        id="city"
                        value={formData.city}
                        onChange={(e) => handleChange("city", e.target.value)}
                        placeholder="New York"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">State *</Label>
                      <Input
                        id="state"
                        value={formData.state}
                        onChange={(e) => handleChange("state", e.target.value)}
                        placeholder="NY"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 3: Admin Details */}
            {step === 3 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Users className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-slate-800">Admin Details</h2>
                  <p className="text-slate-500 mt-2">Primary administrator information</p>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="admin_first_name">First Name *</Label>
                      <Input
                        id="admin_first_name"
                        value={formData.admin_first_name}
                        onChange={(e) => handleChange("admin_first_name", e.target.value)}
                        placeholder="John"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label htmlFor="admin_last_name">Last Name *</Label>
                      <Input
                        id="admin_last_name"
                        value={formData.admin_last_name}
                        onChange={(e) => handleChange("admin_last_name", e.target.value)}
                        placeholder="Doe"
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="admin_email">Admin Email *</Label>
                    <div className="relative mt-1">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="admin_email"
                        type="email"
                        value={formData.admin_email}
                        onChange={(e) => handleChange("admin_email", e.target.value)}
                        placeholder="admin@hospital.com"
                        className="pl-10"
                      />
                    </div>
                    <p className="text-xs text-slate-500 mt-1">
                      This email will be used to log in to the system
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="admin_phone">Admin Phone</Label>
                    <div className="relative mt-1">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                      <Input
                        id="admin_phone"
                        value={formData.admin_phone}
                        onChange={(e) => handleChange("admin_phone", e.target.value)}
                        placeholder="+1 234 567 8900"
                        className="pl-10"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 4: Departments */}
            {step === 4 && (
              <div className="space-y-6">
                <div className="text-center mb-8">
                  <Stethoscope className="w-12 h-12 text-teal-600 mx-auto mb-4" />
                  <h2 className="text-2xl font-bold text-slate-800">Select Departments</h2>
                  <p className="text-slate-500 mt-2">Choose the departments in your hospital</p>
                </div>
                
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {departments.map((dept) => (
                    <button
                      key={dept}
                      type="button"
                      onClick={() => toggleDepartment(dept)}
                      className={`p-3 rounded-xl text-sm font-medium border-2 transition-all ${
                        formData.departments.includes(dept)
                          ? "border-teal-600 bg-teal-50 text-teal-700"
                          : "border-slate-200 hover:border-slate-300 text-slate-600"
                      }`}
                    >
                      {dept}
                    </button>
                  ))}
                </div>
                <p className="text-sm text-slate-500 text-center">
                  You can add more departments later from settings
                </p>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between mt-8 pt-6 border-t border-slate-100">
              {step > 1 ? (
                <Button variant="outline" onClick={prevStep}>
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
              ) : (
                <div />
              )}
              
              {step < 4 ? (
                <Button onClick={nextStep} className="bg-teal-600 hover:bg-teal-700">
                  Continue
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <Button 
                  onClick={handleSubmit} 
                  disabled={loading}
                  className="bg-teal-600 hover:bg-teal-700"
                >
                  {loading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    <>
                      Complete Registration
                      <CheckCircle2 className="w-4 h-4 ml-2" />
                    </>
                  )}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function Users(props) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}
