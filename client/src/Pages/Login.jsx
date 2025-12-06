import React, { useState, useEffect } from "react";
import { useNavigate, useSearchParams, Link } from "react-router-dom";
import { apiClient } from "@/api/apiClient";
import { Loader2, Stethoscope, Mail, Lock, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Label } from "@/components/ui/Label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/Card";

export default function Login() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  // Check if already logged in
  useEffect(() => {
    if (apiClient.auth.isAuthenticated()) {
      navigate('/dashboard');
    }
  }, [navigate]);

  const handleChange = (e) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Step 1: Login
      await apiClient.auth.login(formData);
      
      // Step 2: Get current user
      const user = await apiClient.auth.me();
      
      // Step 3: Check if password change is required
      if (user.forcePasswordChange) {
        navigate('/change-password?forced=true');
        return;
      }
      
      // Step 4: Get staff info to determine role and permissions
      const staffList = await apiClient.entities.HospitalStaff.filter({ 
        user_email: user.email 
      });
      
      if (staffList.length === 0) {
        setError("No staff record found. Please contact your administrator.");
        apiClient.auth.logout();
        return;
      }
      
      const staff = staffList[0];
      
      // Step 5: Store staff info in sessionStorage for immediate access across app
      sessionStorage.setItem('current_staff', JSON.stringify(staff));
      sessionStorage.setItem('current_user', JSON.stringify(user));
      
      // Step 6: Get and store hospital info
      const hospitals = await apiClient.entities.Hospital.filter({ 
        id: staff.hospital_id 
      });
      
      if (hospitals.length > 0) {
        sessionStorage.setItem('current_hospital', JSON.stringify(hospitals[0]));
      }
      
      // Step 7: Navigate with full page reload to ensure all components load with correct role
      const returnUrl = searchParams.get('returnUrl') || '/dashboard';
      
      // Use window.location.href to force full page reload
      // This ensures Layout and all components reinitialize with correct role
      window.location.href = returnUrl;
      
    } catch (err) {
      if (err.message.includes('Password change required')) {
        navigate('/change-password?forced=true');
      } else {
        setError(err.message || "Login failed. Please check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-teal-500 to-teal-600 flex items-center justify-center mx-auto mb-4">
            <Stethoscope className="w-8 h-8 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Welcome to MediFlow</h1>
          <p className="text-slate-500 mt-1">Sign in to your account</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Sign In</CardTitle>
            <CardDescription>Enter your credentials to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <div className="relative mt-1">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="admin@hospital.com"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="password">Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="••••••••"
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  "Sign In"
                )}
              </Button>

              <div className="text-center">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-teal-600 hover:text-teal-700 font-medium hover:underline"
                >
                  Forgot password?
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center mt-6">
          <p className="text-sm text-slate-500">
            Don't have a hospital account?{" "}
            <Link 
              to="/hospital-registration" 
              className="text-teal-600 hover:text-teal-700 font-medium hover:underline"
            >
              Register Hospital
            </Link>
          </p>
        </div>

        {/* Password Policy Info */}
        <div className="mt-6 p-4 bg-blue-50 border border-blue-100 rounded-lg">
          <p className="text-xs font-semibold text-blue-800 mb-2">🔒 Password Requirements:</p>
          <ul className="text-xs text-blue-700 space-y-1">
            <li>• Minimum 8 characters</li>
            <li>• At least 1 uppercase letter</li>
            <li>• At least 1 lowercase letter</li>
            <li>• At least 1 number</li>
            <li>• At least 1 special character (@$!%*?&#)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
