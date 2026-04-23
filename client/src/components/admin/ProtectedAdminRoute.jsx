// src/components/admin/ProtectedAdminRoute.jsx
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext'; 
import { useEffect } from 'react';
import { toast } from 'react-toastify'; 

/**
 * Protects all admin routes
 * - Only allows users with role === 'hq_admin'
 * - Redirects others to dashboard
 */
const ProtectedAdminRoute = ({ children }) => {
  const { user, isLoading } = useAuth(); 

  // Show feedback when user is not authorized
  useEffect(() => {
    if (!isLoading && user && user.role !== 'hq_admin') {
      toast.warn("You don't have admin access. Redirecting...", {
        position: "top-right",
        autoClose: 4000,
      });
    }
  }, [user, isLoading]);

  // Show loading state while auth is checking
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  // Not logged in or not admin → redirect
  if (!user || user.role !== 'hq_admin') {
    return <Navigate to="/dashboard" replace />;
  }

  // Admin access granted → render children or Outlet
  return children ? children : <Outlet />;
};

export default ProtectedAdminRoute;