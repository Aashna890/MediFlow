import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "./utils";
import { apiClient } from "@/api/apiClient";
import {
  LayoutDashboard,
  Users,
  UserPlus,
  Stethoscope,
  FileText,
  Calendar,
  Settings,
  LogOut,
  Menu,
  X,
  Building2,
  ChevronDown,
  Bell,
  Pill
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";

const roleMenus = {
  HOSPITAL_ADMIN: [
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { name: "Patients", icon: Users, page: "Patients" },
    { name: "Staff", icon: UserPlus, page: "Staff" },
    { name: "Appointments", icon: Calendar, page: "Appointments" },
    { name: "Prescriptions", icon: FileText, page: "Prescriptions" },
    { name: "Settings", icon: Settings, page: "Settings" },
  ],
  DOCTOR: [
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { name: "My Patients", icon: Users, page: "Patients" },
    { name: "Appointments", icon: Calendar, page: "Appointments" },
    { name: "Prescriptions", icon: FileText, page: "Prescriptions" },
  ],
  NURSE: [
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { name: "Patients", icon: Users, page: "Patients" },
    { name: "Appointments", icon: Calendar, page: "Appointments" },
  ],
  PHARMACIST: [
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { name: "Prescriptions", icon: Pill, page: "Prescriptions" },
  ],
  RECEPTIONIST: [
    { name: "Dashboard", icon: LayoutDashboard, page: "Dashboard" },
    { name: "Patients", icon: Users, page: "Patients" },
    { name: "Appointments", icon: Calendar, page: "Appointments" },
  ],
};

export default function Layout({ children, currentPageName }) {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [staffInfo, setStaffInfo] = useState(null);
  const [hospital, setHospital] = useState(null);
  const [loading, setLoading] = useState(true);
  const [sidebarDropdownOpen, setSidebarDropdownOpen] = useState(false);
  const [headerDropdownOpen, setHeaderDropdownOpen] = useState(false);

  useEffect(() => {
    // Only load if we're on a protected page
    if (!["Home", "HospitalRegistration", "Login"].includes(currentPageName)) {
      loadUserData();
    } else {
      setLoading(false);
    }
  }, [currentPageName]);

  // Close sidebar dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (sidebarDropdownOpen && !event.target.closest('.sidebar-user-dropdown')) {
        setSidebarDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [sidebarDropdownOpen]);

  // Close header dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (headerDropdownOpen && !event.target.closest('.header-user-dropdown')) {
        setHeaderDropdownOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [headerDropdownOpen]);

  const loadUserData = async () => {
    try {
      setLoading(true);
      
      // Check if user is authenticated
      if (!apiClient.auth.isAuthenticated()) {
        navigate('/login');
        return;
      }

      // Try to get cached data from sessionStorage first
      const cachedStaff = sessionStorage.getItem('current_staff');
      const cachedHospital = sessionStorage.getItem('current_hospital');
      const cachedUser = sessionStorage.getItem('current_user');

      if (cachedStaff && cachedHospital && cachedUser) {
        // Use cached data for instant load
        setStaffInfo(JSON.parse(cachedStaff));
        setHospital(JSON.parse(cachedHospital));
        setUser(JSON.parse(cachedUser));
        setLoading(false);
        return;
      }

      // If no cached data, fetch from API
      const currentUser = await apiClient.auth.me();
      setUser(currentUser);
      
      // Get staff info
      const staffList = await apiClient.entities.HospitalStaff.filter({ 
        user_email: currentUser.email 
      });
      
      if (staffList.length > 0) {
        const staff = staffList[0];
        setStaffInfo(staff);
        
        // Store staff info in sessionStorage for quick access on next load
        sessionStorage.setItem('current_staff', JSON.stringify(staff));
        sessionStorage.setItem('current_user', JSON.stringify(currentUser));
        
        // Get hospital info
        const hospitals = await apiClient.entities.Hospital.filter({ 
          id: staff.hospital_id 
        });
        
        if (hospitals.length > 0) {
          setHospital(hospitals[0]);
          // Store hospital info in sessionStorage
          sessionStorage.setItem('current_hospital', JSON.stringify(hospitals[0]));
        }
      } else {
        // No staff record found - redirect to login
        console.error("No staff record found for user");
        handleLogout();
      }
    } catch (error) {
      console.error("Error loading user data:", error);
      // If error, redirect to login
      handleLogout();
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    // Clear session storage
    sessionStorage.removeItem('current_staff');
    sessionStorage.removeItem('current_hospital');
    sessionStorage.removeItem('current_user');
    // Call API logout
    apiClient.auth.logout();
  };

  // Public pages without layout
  if (["Home", "HospitalRegistration", "Login"].includes(currentPageName)) {
    return <>{children}</>;
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  // If no staff info after loading, redirect to login
  if (!staffInfo) {
    navigate('/login');
    return null;
  }

  const menuItems = roleMenus[staffInfo?.role] || roleMenus.HOSPITAL_ADMIN;

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-64 bg-white border-r border-slate-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center gap-3 px-6 py-5 border-b border-slate-100">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-white" />
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="font-semibold text-slate-800 truncate">
                {hospital?.name || "MediFlow HMS"}
              </h1>
              <p className="text-xs text-slate-500">Hospital Management</p>
            </div>
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1 hover:bg-slate-100 rounded"
            >
              <X className="w-5 h-5 text-slate-500" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-1 overflow-y-auto">
            {menuItems.map((item) => {
              const Icon = item.icon;
              const isActive = currentPageName === item.page;
              return (
                <Link
                  key={item.page}
                  to={createPageUrl(item.page)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all",
                    isActive
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                  )}
                >
                  <Icon className={cn("w-5 h-5", isActive ? "text-teal-600" : "text-slate-400")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User section - Sidebar */}
          <div className="p-4 border-t border-slate-100">
            <div className="relative sidebar-user-dropdown">
              <button 
                onClick={() => setSidebarDropdownOpen(!sidebarDropdownOpen)}
                className="flex items-center gap-3 px-3 py-2 w-full hover:bg-slate-50 rounded-lg transition-colors"
              >
                <Avatar className="h-9 w-9">
                  <AvatarFallback className="bg-teal-100 text-teal-700 text-sm">
                    {staffInfo?.first_name?.[0]}{staffInfo?.last_name?.[0]}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0 text-left">
                  <p className="text-sm font-medium text-slate-700 truncate">
                    {staffInfo?.first_name} {staffInfo?.last_name}
                  </p>
                  <p className="text-xs text-slate-500 capitalize">
                    {staffInfo?.role?.replace("_", " ").toLowerCase()}
                  </p>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
              
              {sidebarDropdownOpen && (
                <div className="absolute bottom-full left-0 right-0 mb-2 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                  <div className="px-3 py-2 border-b border-slate-100">
                    <p className="text-sm font-medium">{staffInfo?.first_name} {staffInfo?.last_name}</p>
                    <p className="text-xs text-slate-500">{user?.email}</p>
                  </div>
                  <Link 
                    to={createPageUrl("Settings")}
                    className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50"
                    onClick={() => setSidebarDropdownOpen(false)}
                  >
                    <Settings className="w-4 h-4" />
                    Settings
                  </Link>
                  <button 
                    onClick={handleLogout}
                    className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className="lg:pl-64">
        {/* Top bar */}
        <header className="sticky top-0 z-30 bg-white/80 backdrop-blur-sm border-b border-slate-200">
          <div className="flex items-center justify-between px-4 lg:px-8 py-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 hover:bg-slate-100 rounded-lg"
              >
                <Menu className="w-5 h-5 text-slate-600" />
              </button>
              <h2 className="text-lg font-semibold text-slate-800">
                {currentPageName}
              </h2>
            </div>

            <div className="flex items-center gap-3">
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="w-5 h-5 text-slate-500" />
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" />
              </Button>

              <div className="relative header-user-dropdown">
                <Button 
                  variant="ghost" 
                  className="flex items-center gap-2"
                  onClick={() => setHeaderDropdownOpen(!headerDropdownOpen)}
                >
                  <Avatar className="h-8 w-8">
                    <AvatarFallback className="bg-teal-100 text-teal-700 text-xs">
                      {staffInfo?.first_name?.[0]}{staffInfo?.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  <ChevronDown className="w-4 h-4 text-slate-500" />
                </Button>
                
                {headerDropdownOpen && (
                  <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-lg border border-slate-200 py-2 z-50">
                    <div className="px-3 py-2 border-b border-slate-100">
                      <p className="text-sm font-medium">{staffInfo?.first_name} {staffInfo?.last_name}</p>
                      <p className="text-xs text-slate-500">{user?.email}</p>
                    </div>
                    <Link 
                      to={createPageUrl("Settings")}
                      className="flex items-center gap-2 px-3 py-2 text-sm hover:bg-slate-50"
                      onClick={() => setHeaderDropdownOpen(false)}
                    >
                      <Settings className="w-4 h-4" />
                      Settings
                    </Link>
                    <button 
                      onClick={handleLogout}
                      className="flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Logout
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}