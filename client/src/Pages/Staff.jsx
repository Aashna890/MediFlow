import React, { useState, useEffect } from "react";
import { apiClient } from "@/api/apiClient";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Search,
  Plus,
  MoreVertical,
  Edit2,
  UserX,
  UserCheck,
  Stethoscope,
  Users,
  Trash2
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
import StaffForm from "@/components/staff/StaffForm";

const roleLabels = {
  HOSPITAL_ADMIN: "Hospital Admin",
  DOCTOR: "Doctor",
  NURSE: "Nurse",
  PHARMACIST: "Pharmacist",
  RECEPTIONIST: "Receptionist"
};

const roleColors = {
  HOSPITAL_ADMIN: "bg-purple-100 text-purple-700",
  DOCTOR: "bg-teal-100 text-teal-700",
  NURSE: "bg-blue-100 text-blue-700",
  PHARMACIST: "bg-orange-100 text-orange-700",
  RECEPTIONIST: "bg-pink-100 text-pink-700"
};

export default function Staff() {
  const [hospitalId, setHospitalId] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [showForm, setShowForm] = useState(false);
  const [editingStaff, setEditingStaff] = useState(null);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [deletingStaff, setDeletingStaff] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
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
      setHospitalId(staff[0].hospital_id);
      const hospitals = await apiClient.entities.Hospital.filter({ id: staff[0].hospital_id });
      if (hospitals.length > 0) {
        setHospital(hospitals[0]);
      }
    }
  };

  const { data: staffList = [], isLoading } = useQuery({
    queryKey: ["staff", hospitalId],
    queryFn: () => apiClient.entities.HospitalStaff.filter({ hospital_id: hospitalId }, "-created_date"),
    enabled: !!hospitalId
  });

  const createMutation = useMutation({
    mutationFn: (data) => apiClient.entities.HospitalStaff.create({
      ...data,
      hospital_id: hospitalId
    }),
    onSuccess: () => {
      queryClient.invalidateQueries(["staff"]);
      setShowForm(false);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => apiClient.entities.HospitalStaff.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(["staff"]);
      setShowForm(false);
      setEditingStaff(null);
      setOpenDropdownId(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => {
      // Since there's no delete method in the API client, we'll use update to mark as deleted
      // Or we can remove from localStorage directly
      const data = JSON.parse(localStorage.getItem('mediflow_data') || '{}');
      data.staff = data.staff.filter(s => s.id !== id);
      localStorage.setItem('mediflow_data', JSON.stringify(data));
      return Promise.resolve();
    },
    onSuccess: () => {
      queryClient.invalidateQueries(["staff"]);
      setShowDeleteConfirm(false);
      setDeletingStaff(null);
      setOpenDropdownId(null);
    }
  });

  const handleSubmit = (data) => {
    if (editingStaff) {
      updateMutation.mutate({ id: editingStaff.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleEdit = (staff) => {
    setEditingStaff(staff);
    setShowForm(true);
    setOpenDropdownId(null);
  };

  const toggleStatus = (staff) => {
    const newStatus = staff.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
    updateMutation.mutate({ id: staff.id, data: { status: newStatus } });
  };

  const handleDeleteClick = (staff) => {
    setDeletingStaff(staff);
    setShowDeleteConfirm(true);
    setOpenDropdownId(null);
  };

  const confirmDelete = () => {
    if (deletingStaff) {
      deleteMutation.mutate(deletingStaff.id);
    }
  };

  // Filter staff
  const filteredStaff = staffList.filter(s => {
    const matchesSearch = 
      s.first_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.last_name?.toLowerCase().includes(search.toLowerCase()) ||
      s.user_email?.toLowerCase().includes(search.toLowerCase());
    
    const matchesRole = roleFilter === "all" || s.role === roleFilter;
    
    return matchesSearch && matchesRole;
  });

  // Stats
  const doctors = staffList.filter(s => s.role === "DOCTOR");
  const nurses = staffList.filter(s => s.role === "NURSE");
  const activeStaff = staffList.filter(s => s.status === "ACTIVE");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Staff Management</h1>
          <p className="text-slate-500">{staffList.length} staff members</p>
        </div>
        <Button onClick={() => setShowForm(true)} className="bg-teal-600 hover:bg-teal-700">
          <Plus className="w-4 h-4 mr-2" />
          Add Staff
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-teal-100 flex items-center justify-center">
              <Stethoscope className="w-5 h-5 text-teal-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{doctors.length}</p>
              <p className="text-sm text-slate-500">Doctors</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{nurses.length}</p>
              <p className="text-sm text-slate-500">Nurses</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <UserCheck className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{activeStaff.length}</p>
              <p className="text-sm text-slate-500">Active</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl p-5 border border-slate-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-2xl font-bold text-slate-800">{staffList.length}</p>
              <p className="text-sm text-slate-500">Total Staff</p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl border border-slate-100 p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={roleFilter} onValueChange={setRoleFilter}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by role" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              <SelectItem value="HOSPITAL_ADMIN">Hospital Admin</SelectItem>
              <SelectItem value="DOCTOR">Doctor</SelectItem>
              <SelectItem value="NURSE">Nurse</SelectItem>
              <SelectItem value="PHARMACIST">Pharmacist</SelectItem>
              <SelectItem value="RECEPTIONIST">Receptionist</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white rounded-xl border border-slate-100 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-slate-50">
              <TableHead>Staff Member</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Department</TableHead>
              <TableHead>Contact</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-12"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredStaff.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-12">
                  <Users className="w-12 h-12 text-slate-200 mx-auto mb-3" />
                  <p className="text-slate-500">No staff members found</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredStaff.map((staff) => (
                <TableRow key={staff.id} className="hover:bg-slate-50">
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarFallback className="bg-teal-100 text-teal-700 font-medium">
                          {staff.first_name?.[0]}{staff.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium text-slate-800">
                          {staff.role === "DOCTOR" ? "Dr. " : ""}{staff.first_name} {staff.last_name}
                        </p>
                        <p className="text-sm text-slate-500">{staff.user_email}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={roleColors[staff.role]}>
                      {roleLabels[staff.role]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {staff.department || "-"}
                    {staff.specialization && (
                      <span className="block text-sm text-slate-400">{staff.specialization}</span>
                    )}
                  </TableCell>
                  <TableCell className="text-slate-600">
                    {staff.phone || "-"}
                  </TableCell>
                  <TableCell>
                    <Badge className={staff.status === "ACTIVE" 
                      ? "bg-green-100 text-green-700" 
                      : "bg-slate-100 text-slate-600"
                    }>
                      {staff.status}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="relative dropdown-container">
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => setOpenDropdownId(openDropdownId === staff.id ? null : staff.id)}
                      >
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                      
                      {openDropdownId === staff.id && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-slate-200 py-1 z-50">
                          <button
                            onClick={() => handleEdit(staff)}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 w-full text-left"
                          >
                            <Edit2 className="w-4 h-4" />
                            Edit
                          </button>
                          <div className="border-t border-slate-100 my-1"></div>
                          <button
                            onClick={() => toggleStatus(staff)}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50 w-full text-left"
                          >
                            {staff.status === "ACTIVE" ? (
                              <>
                                <UserX className="w-4 h-4 text-red-600" />
                                <span className="text-red-600">Deactivate</span>
                              </>
                            ) : (
                              <>
                                <UserCheck className="w-4 h-4 text-green-600" />
                                <span className="text-green-600">Activate</span>
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => handleDeleteClick(staff)}
                            className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-red-50 w-full text-left text-red-600"
                          >
                            <Trash2 className="w-4 h-4" />
                            Delete
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

      {/* Staff Form Dialog */}
      <StaffForm
        open={showForm}
        onClose={() => {
          setShowForm(false);
          setEditingStaff(null);
        }}
        onSubmit={handleSubmit}
        staff={editingStaff}
        departments={hospital?.departments || []}
        loading={createMutation.isPending || updateMutation.isPending}
      />

      {/* Delete Confirmation Dialog */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <Trash2 className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-slate-800">Delete Staff Member</h3>
                <p className="text-sm text-slate-500">This action cannot be undone</p>
              </div>
            </div>
            
            <p className="text-slate-600 mb-6">
              Are you sure you want to delete{" "}
              <span className="font-semibold">
                {deletingStaff?.first_name} {deletingStaff?.last_name}
              </span>
              ? All associated data will be permanently removed.
            </p>
            
            <div className="flex gap-3 justify-end">
              <Button
                variant="outline"
                onClick={() => {
                  setShowDeleteConfirm(false);
                  setDeletingStaff(null);
                }}
                disabled={deleteMutation.isPending}
              >
                Cancel
              </Button>
              <Button
                onClick={confirmDelete}
                disabled={deleteMutation.isPending}
                className="bg-red-600 hover:bg-red-700 text-white"
              >
                {deleteMutation.isPending ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}