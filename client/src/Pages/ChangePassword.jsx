import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Loader2, Lock, CheckCircle, Eye, EyeOff, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function ChangePassword({ isForced = false }) {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    oldPassword: "",
    password: "",
    confirmPassword: ""
  });
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [errors, setErrors] = useState([]);
  const [success, setSuccess] = useState(false);

  const validatePassword = (pwd) => {
    const validations = [];
    
    if (pwd.length < 8) {
      validations.push("At least 8 characters");
    }
    if (!/[a-z]/.test(pwd)) {
      validations.push("One lowercase letter");
    }
    if (!/[A-Z]/.test(pwd)) {
      validations.push("One uppercase letter");
    }
    if (!/\d/.test(pwd)) {
      validations.push("One number");
    }
    if (!/[@$!%*?&#]/.test(pwd)) {
      validations.push("One special character (@$!%*?&#)");
    }
    
    return validations;
  };

  const handlePasswordChange = (e) => {
    const pwd = e.target.value;
    setFormData(prev => ({ ...prev, password: pwd }));
    setErrors(validatePassword(pwd));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    const validationErrors = validatePassword(formData.password);
    if (validationErrors.length > 0) {
      setError("Password does not meet requirements");
      setLoading(false);
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      const response = await fetch('http://localhost:5000/api/auth/change-password', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          oldPassword: formData.oldPassword,
          password: formData.password
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to change password');
      }

      // Update token if new one is provided
      if (data.token) {
        localStorage.setItem('token', data.token);
      }

      setSuccess(true);
      
      // Redirect after 2 seconds
      setTimeout(() => {
        if (isForced) {
          navigate('/dashboard');
        } else {
          navigate('/settings');
        }
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-8 pb-8 text-center">
            <div className="w-20 h-20 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold text-slate-800 mb-3">Password Changed!</h2>
            <p className="text-slate-600 mb-6">
              Your password has been changed successfully. Redirecting...
            </p>
            <div className="flex items-center justify-center gap-2">
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-teal-600"></div>
              <span className="text-slate-500">Redirecting...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="w-6 h-6 text-teal-600" />
              <CardTitle>Change Password</CardTitle>
            </div>
            <CardDescription>
              {isForced 
                ? "You are required to change your password before continuing"
                : "Update your password to keep your account secure"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isForced && (
              <div className="mb-4 p-4 bg-amber-50 border border-amber-200 rounded-lg">
                <p className="text-sm text-amber-800">
                  <strong>Action Required:</strong> Your administrator has requested you to change your password.
                </p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="oldPassword">Current Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="oldPassword"
                    name="oldPassword"
                    type={showOldPassword ? "text" : "password"}
                    value={formData.oldPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, oldPassword: e.target.value }))}
                    placeholder="Enter current password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showOldPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div>
                <Label htmlFor="password">New Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handlePasswordChange}
                    placeholder="Enter new password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Requirements */}
              <div className="p-3 bg-slate-50 rounded-lg">
                <p className="text-xs font-medium text-slate-700 mb-2">Password must contain:</p>
                <ul className="space-y-1">
                  {['At least 8 characters', 'One lowercase letter', 'One uppercase letter', 'One number', 'One special character (@$!%*?&#)'].map((req, idx) => {
                    const isValid = formData.password && !errors.includes(req);
                    return (
                      <li key={idx} className={`text-xs flex items-center gap-2 ${isValid ? 'text-green-600' : 'text-slate-500'}`}>
                        <CheckCircle className={`w-3 h-3 ${isValid ? 'text-green-600' : 'text-slate-300'}`} />
                        {req}
                      </li>
                    );
                  })}
                </ul>
              </div>

              <div>
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <div className="relative mt-1">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                  <Input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData(prev => ({ ...prev, confirmPassword: e.target.value }))}
                    placeholder="Confirm new password"
                    className="pl-10 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <div className="p-3 bg-red-50 border border-red-100 rounded-lg text-red-600 text-sm">
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={loading || errors.length > 0}
                className="w-full bg-teal-600 hover:bg-teal-700"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Changing Password...
                  </>
                ) : (
                  "Change Password"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}