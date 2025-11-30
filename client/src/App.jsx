import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Import your pages
import Home from './Pages/Home';
import Login from './Pages/Login';
import ForgotPassword from './Pages/ForgotPassword';
import ResetPassword from './Pages/ResetPassword';
import ChangePassword from './Pages/ChangePassword';
import HospitalRegistration from './Pages/HospitalRegistration';
import Dashboard from './Pages/Dashboard';
import Patients from './Pages/Patients';
import Appointments from './Pages/Appointments';
import Prescriptions from './Pages/Prescriptions';
import Staff from './Pages/Staff';
import Settings from './Pages/Settings';
import Layout from './Layout';

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Layout currentPageName="Home"><Home /></Layout>} />
          <Route path="/login" element={<Layout currentPageName="Login"><Login /></Layout>} />
          <Route path="/forgot-password" element={<Layout currentPageName="ForgotPassword"><ForgotPassword /></Layout>} />
          <Route path="/reset-password/:resetToken" element={<Layout currentPageName="ResetPassword"><ResetPassword /></Layout>} />
          <Route path="/hospital-registration" element={<Layout currentPageName="HospitalRegistration"><HospitalRegistration /></Layout>} />
          
          {/* Protected Routes */}
          <Route path="/dashboard" element={<Layout currentPageName="Dashboard"><Dashboard /></Layout>} />
          <Route path="/patients" element={<Layout currentPageName="Patients"><Patients /></Layout>} />
          <Route path="/appointments" element={<Layout currentPageName="Appointments"><Appointments /></Layout>} />
          <Route path="/prescriptions" element={<Layout currentPageName="Prescriptions"><Prescriptions /></Layout>} />
          <Route path="/staff" element={<Layout currentPageName="Staff"><Staff /></Layout>} />
          <Route path="/settings" element={<Layout currentPageName="Settings"><Settings /></Layout>} />
          <Route path="/change-password" element={<Layout currentPageName="ChangePassword"><ChangePassword /></Layout>} />
          
          {/* Catch all - redirect to home */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </QueryClientProvider>
  );
}

export default App;