import React, { useState, useEffect } from "react";
import { apiClient } from "@/api/apiClient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Building2,
  Save,
  Plus,
  X,
  Loader2,
  CheckCircle
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Textarea } from "@/components/ui/Textarea";
import { Badge } from "@/components/ui/Badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/Select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/Card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/Tabs";

export default function Settings() {
  const [hospital, setHospital] = useState(null);
  const [staffInfo, setStaffInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [newDepartment, setNewDepartment] = useState("");
  
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "",
    state: "",
    phone: "",
    email: "",
    departments: []
  });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const user = await apiClient.auth.me();
      const staff = await apiClient.entities.HospitalStaff.filter({ user_email: user.email });
      if (staff.length > 0) {
        setStaffInfo(staff[0]);
        const hospitals = await apiClient.entities.Hospital.filter({ id: staff[0].hospital_id });
        if (hospitals.length > 0) {
          setHospital(hospitals[0]);
          setFormData({
            name: hospitals[0].name || "",
            address: hospitals[0].address || "",
            city: hospitals[0].city || "",
            state: hospitals[0].state || "",
            phone: hospitals[0].phone || "",
            email: hospitals[0].email || "",
            departments: hospitals[0].departments || []
          });
        }
      }
    } catch (error) {
      console.error("Error loading data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const addDepartment = () => {
    if (newDepartment && !formData.departments.includes(newDepartment)) {
      setFormData(prev => ({
        ...prev,
        departments: [...prev.departments, newDepartment]
      }));
      setNewDepartment("");
    }
  };

  const removeDepartment = (dept) => {
    setFormData(prev => ({
      ...prev,
      departments: prev.departments.filter(d => d !== dept)
    }));
  };

  const handleSave = async () => {
    if (!hospital) return;
    
    setSaving(true);
    try {
      await apiClient.entities.Hospital.update(hospital.id, formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (error) {
      console.error("Error saving:", error);
    } finally {
      setSaving(false);
    }
  };

  const isAdmin = staffInfo?.role === "HOSPITAL_ADMIN";

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Settings</h1>
          <p className="text-slate-500">Manage your hospital settings</p>
        </div>
        {isAdmin && (
          <Button onClick={handleSave} disabled={saving} className="bg-teal-600 hover:bg-teal-700">
            {saving ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Saving...
              </>
            ) : saved ? (
              <>
                <CheckCircle className="w-4 h-4 mr-2" />
                Saved!
              </>
            ) : (
              <>
                <Save className="w-4 h-4 mr-2" />
                Save Changes
              </>
            )}
          </Button>
        )}
      </div>

      <Tabs defaultValue="hospital" className="w-full">
        <TabsList className="grid w-full grid-cols-2 max-w-md">
          <TabsTrigger value="hospital">Hospital Info</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="hospital" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-teal-600" />
                Hospital Information
              </CardTitle>
              <CardDescription>
                Basic details about your hospital
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label>Hospital Name</Label>
                  <Input
                    value={formData.name}
                    onChange={(e) => handleChange("name", e.target.value)}
                    disabled={!isAdmin}
                    className="mt-1"
                  />
                </div>
                
                <div className="col-span-2">
                  <Label>Address</Label>
                  <Textarea
                    value={formData.address}
                    onChange={(e) => handleChange("address", e.target.value)}
                    disabled={!isAdmin}
                    rows={2}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>City</Label>
                  <Input
                    value={formData.city}
                    onChange={(e) => handleChange("city", e.target.value)}
                    disabled={!isAdmin}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>State</Label>
                  <Input
                    value={formData.state}
                    onChange={(e) => handleChange("state", e.target.value)}
                    disabled={!isAdmin}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Phone</Label>
                  <Input
                    value={formData.phone}
                    onChange={(e) => handleChange("phone", e.target.value)}
                    disabled={!isAdmin}
                    className="mt-1"
                  />
                </div>

                <div>
                  <Label>Email</Label>
                  <Input
                    value={formData.email}
                    onChange={(e) => handleChange("email", e.target.value)}
                    disabled={!isAdmin}
                    className="mt-1"
                  />
                </div>
              </div>

              <div className="pt-4 border-t">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-slate-500">License Number</p>
                    <p className="font-medium font-mono">{hospital?.license_number}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Tenant ID</p>
                    <p className="font-medium font-mono">{hospital?.tenant_id}</p>
                  </div>
                  <div>
                    <p className="text-slate-500">Status</p>
                    <Badge className={
                      hospital?.status === "ACTIVE" 
                        ? "bg-green-100 text-green-700" 
                        : "bg-yellow-100 text-yellow-700"
                    }>
                      {hospital?.status}
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Departments</CardTitle>
              <CardDescription>
                Manage hospital departments
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {isAdmin && (
                <div className="flex gap-2">
                  <Input
                    value={newDepartment}
                    onChange={(e) => setNewDepartment(e.target.value)}
                    placeholder="Enter department name"
                    onKeyDown={(e) => e.key === "Enter" && addDepartment()}
                  />
                  <Button onClick={addDepartment} className="bg-teal-600 hover:bg-teal-700">
                    <Plus className="w-4 h-4 mr-2" />
                    Add
                  </Button>
                </div>
              )}

              <div className="flex flex-wrap gap-2">
                {formData.departments.map((dept) => (
                  <Badge 
                    key={dept} 
                    variant="secondary"
                    className="px-3 py-2 text-sm bg-slate-100 text-slate-700 flex items-center gap-2"
                  >
                    {dept}
                    {isAdmin && (
                      <button 
                        onClick={() => removeDepartment(dept)}
                        className="hover:text-red-600"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    )}
                  </Badge>
                ))}
                {formData.departments.length === 0 && (
                  <p className="text-slate-500">No departments added yet</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
