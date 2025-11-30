import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { createPageUrl } from "@/utils";
import { apiClient } from "@/api/apiClient";
import {
  Building2,
  Shield,
  Users,
  FileText,
  Calendar,
  ArrowRight,
  CheckCircle2,
  Stethoscope,
  Activity
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Home() {
  const navigate = useNavigate();
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [checking, setChecking] = React.useState(true);

  React.useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const authenticated = apiClient.auth.isAuthenticated();
      setIsAuthenticated(authenticated);
      if (authenticated) {
        navigate('/dashboard');
      }
    } catch (e) {
      setIsAuthenticated(false);
    } finally {
      setChecking(false);
    }
  };

  const handleLogin = () => {
    navigate('/login');
  };

  if (checking) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-teal-600"></div>
      </div>
    );
  }

  const features = [
    {
      icon: Building2,
      title: "Multi-Tenant Architecture",
      description: "Complete data isolation for each hospital with dedicated workspaces"
    },
    {
      icon: Shield,
      title: "Role-Based Access",
      description: "Granular permissions for Admins, Doctors, Nurses, and Staff"
    },
    {
      icon: Users,
      title: "Patient Management",
      description: "Complete patient lifecycle from registration to discharge"
    },
    {
      icon: FileText,
      title: "Digital Prescriptions",
      description: "Create and manage prescriptions with medicine details"
    },
    {
      icon: Calendar,
      title: "Appointment Scheduling",
      description: "Efficient scheduling and management of patient appointments"
    },
    {
      icon: Activity,
      title: "Real-time Dashboard",
      description: "Live insights into hospital operations and statistics"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/80 backdrop-blur-md border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-slate-800">MediFlow</span>
            </div>
            <div className="flex items-center gap-4">
              <Link to="/hospital-registration">
                <Button variant="ghost" className="text-slate-600 hover:text-teal-600">
                  Register Hospital
                </Button>
              </Link>
              <Button onClick={handleLogin} className="bg-teal-600 hover:bg-teal-700">
                Sign In
              </Button>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4">
        <div className="max-w-7xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-teal-50 text-teal-700 text-sm font-medium mb-8">
            <CheckCircle2 className="w-4 h-4" />
            Cloud-Based Hospital Management
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-slate-900 mb-6 leading-tight">
            Transform Your Hospital
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-500 to-teal-600">
              Operations Digitally
            </span>
          </h1>
          <p className="text-lg sm:text-xl text-slate-600 max-w-3xl mx-auto mb-10">
            A comprehensive, multi-tenant SaaS platform enabling hospitals of any size 
            to digitize their operations with zero upfront infrastructure investment.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/hospital-registration">
              <Button size="lg" className="bg-teal-600 hover:bg-teal-700 text-lg px-8 py-6">
                Register Your Hospital
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
            </Link>
            <Button size="lg" variant="outline" className="text-lg px-8 py-6" onClick={handleLogin}>
              Sign In to Dashboard
            </Button>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-16 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {[
              { value: "500+", label: "Hospitals" },
              { value: "1M+", label: "Patients Managed" },
              { value: "99.9%", label: "Uptime" },
              { value: "24/7", label: "Support" }
            ].map((stat, i) => (
              <div key={i} className="text-center">
                <div className="text-3xl sm:text-4xl font-bold text-teal-600 mb-2">{stat.value}</div>
                <div className="text-slate-600">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4">
              Everything You Need
            </h2>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto">
              Comprehensive features designed for modern healthcare management
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {features.map((feature, i) => {
              const Icon = feature.icon;
              return (
                <div
                  key={i}
                  className="p-8 bg-white rounded-2xl border border-slate-100 hover:border-teal-100 hover:shadow-lg hover:shadow-teal-50 transition-all duration-300"
                >
                  <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-teal-50 to-teal-100 flex items-center justify-center mb-6">
                    <Icon className="w-7 h-7 text-teal-600" />
                  </div>
                  <h3 className="text-xl font-semibold text-slate-800 mb-3">
                    {feature.title}
                  </h3>
                  <p className="text-slate-600 leading-relaxed">
                    {feature.description}
                  </p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-gradient-to-br from-teal-600 to-teal-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
            Ready to Get Started?
          </h2>
          <p className="text-lg text-teal-100 mb-10 max-w-2xl mx-auto">
            Register your hospital today and become operational within 24 hours. 
            No upfront costs, no infrastructure required.
          </p>
          <Link to="/hospital-registration">
            <Button size="lg" className="bg-white text-teal-700 hover:bg-teal-50 text-lg px-8 py-6">
              Register Your Hospital
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center">
                <Stethoscope className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-white">MediFlow</span>
            </div>
            <p className="text-slate-400 text-sm">
              © 2025 MediFlow. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}