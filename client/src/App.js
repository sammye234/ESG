// client/src/App.js
import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate,  Navigate } from 'react-router-dom';
//import { ToastContainer } from 'react-toastify';
import { toast, Toaster } from "react-hot-toast";
import 'react-toastify/dist/ReactToastify.css';

import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

// Public Pages
import LandingPage from './pages/LandingPage';
import SignIn from './pages/SignIn';
import CreateAccount from './pages/CreateAccount';

// User Pages
import Dashboard from './pages/Dashboard';
import FileManagement from './pages/FileManagement';
import CSVEditor from './pages/CSVEditor';
import KPICalculator from './pages/KPICalculator';
import WaterDashboard from './pages/WaterDashboard';
import EnergyDashboard from './pages/EnergyDashboard';
import EmissionsDashboard from './pages/EmissionsDashboard';
import WasteDashboard from './pages/WasteDashboard';
import IntegratedESGDashboard from './pages/IntegratedESGDashboard';
import ESGDashboardLayout from './pages/ESGDashboardLayout';

// Admin Pages
import AdminDashboard from './pages/Admin/AdminDashboard';
import UsersList from './pages/Admin/UsersList';
import PendingApprovals from './pages/Admin/PendingApprovals';
import AuditLogs from './pages/Admin/AuditLogs';
import AccessTest from './pages/AccessTest';

// Protected Route Wrapper
const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user, isAuthenticated, loading } = useAuth();
  console.log('[ProtectedRoute] Current user state:', {
    id: user?._id,
    role: user?.role,
    isActive: user?.isActive,
    isAuthenticated,
    loading
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-emerald-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />;
  }

  if (user?.role === 'pending' || user?.isActive === false) {
    console.log('[ProtectedRoute] Showing pending screen because:', {
      role: user?.role,
      isActive: user?.isActive
    });
    return <PendingApprovalScreen />;
  }

  // Check admin requirement
  if (requireAdmin && user?.role !== 'hq_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

// Pending Approval Screen Component
const PendingApprovalScreen = () => {
  const { logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
      <div className="bg-white p-8 rounded-xl shadow-lg max-w-md text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg className="w-10 h-10 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
        </div>
        <h2 className="text-2xl font-bold text-gray-800 mb-4">Account Pending Approval</h2>
        <p className="text-gray-600 mb-6">
          Your account is waiting for admin approval. You'll receive access once an administrator reviews your registration.
        </p>
        <button
          onClick={logout}
          className="px-6 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Logout
        </button>
      </div>
    </div>
  );
};

// Main App Content
function AppContent() {
  return (
    <>
      <Routes>
        {/* Public Routes */}
        <Route path="/" element={<SignIn />} />
        <Route path="/signin" element={<SignIn />} />
        <Route path="/signup" element={<CreateAccount />} />

        {/* Protected User Routes */}
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/files" element={<ProtectedRoute><FileManagement /></ProtectedRoute>} />
        <Route path="/csv-editor" element={<ProtectedRoute><CSVEditor /></ProtectedRoute>} />
        <Route path="/kpi-calculator" element={<ProtectedRoute><KPICalculator /></ProtectedRoute>} />
        
        {/* ESG Module Dashboards */}
        <Route path="/integrated-esg-dashboard" element={<ProtectedRoute><IntegratedESGDashboard /></ProtectedRoute>} />
        <Route path="/water-dashboard" element={<ProtectedRoute><WaterDashboard /></ProtectedRoute>} />
        <Route path="/energy-dashboard" element={<ProtectedRoute><EnergyDashboard /></ProtectedRoute>} />
        <Route path="/emissions-dashboard" element={<ProtectedRoute><EmissionsDashboard /></ProtectedRoute>} />
        <Route path="/waste-dashboard" element={<ProtectedRoute><WasteDashboard /></ProtectedRoute>} />
        <Route path="/esg-dashboard-layout" element={<ProtectedRoute><ESGDashboardLayout /></ProtectedRoute>} />

        {/* Protected Admin Routes */}
        <Route path="/admin" element={<ProtectedRoute requireAdmin><AdminDashboard /></ProtectedRoute>} />
        <Route path="/admin/users" element={<ProtectedRoute requireAdmin><UsersList /></ProtectedRoute>} />
        <Route path="/admin/pending" element={<ProtectedRoute requireAdmin><PendingApprovals /></ProtectedRoute>} />
        <Route path="/admin/audit-logs" element={<ProtectedRoute requireAdmin><AuditLogs /></ProtectedRoute>} />
        <Route path="/access-test" element={<ProtectedRoute><AccessTest /></ProtectedRoute>} />

        {/* Catch all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#ffffff',
            color: '#000000',
            borderRadius: '12px',
            padding: '16px 20px',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
            maxWidth: '420px',
            fontSize: '16px',
            fontWeight: '500',
          },
          success: {
            icon: '✅',
            duration: 2500,
            iconTheme: {
              primary: '#10b981',
              secondary: '#ffffff',
            },
          },
          error: {
            icon: '❌',
            duration: 4000,
            iconTheme: {
              primary: '#ef4444',
              secondary: '#ffffff',
            },

          },
          loading: {
            icon: '⏳',
            duration: Infinity,
          },
        }}
      />
    </>
  );
}

// Root App
function App() {
  return (
    <Router>
      <AuthProvider>
        <DataProvider>
          <AppContent />
        </DataProvider>
      </AuthProvider>
    </Router>
  );
}
export default App;