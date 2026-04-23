// client/src/layouts/AdminLayout.jsx
import React from 'react';
import { Link, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const AdminLayout = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <header className="bg-blue-800 text-white p-4 shadow">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className="text-xl font-bold">Admin Panel</h1>
          <div className="flex items-center gap-4">
            <span>{user?.email || user?.username}</span>
            <button
              onClick={logout}
              className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded text-sm"
            >
              Logout
            </button>
          </div>
        </div>
      </header>

      {/* Sidebar + Main Content */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white shadow h-screen p-6">
          <nav className="space-y-2">
            <Link
              to="/admin"
              className="block px-4 py-2 rounded hover:bg-blue-50 text-gray-800"
            >
              Dashboard
            </Link>
            <Link
              to="/admin/users"
              className="block px-4 py-2 rounded hover:bg-blue-50 text-gray-800"
            >
              All Users
            </Link>
            <Link
              to="/admin/pending"
              className="block px-4 py-2 rounded hover:bg-blue-50 text-gray-800"
            >
              Pending Approvals
            </Link>
            {/* Add more sidebar links later */}
            <Link to="/admin/audit-logs" className="block px-4 py-2 rounded hover:bg-blue-50">Audit Logs</Link>
          </nav>
         
            
          
        </aside>

        {/* Main content area */}
        <main className="flex-1 p-8">
          <Outlet /> {/* This renders the child admin pages */}
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;