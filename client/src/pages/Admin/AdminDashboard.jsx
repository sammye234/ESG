// client/src/pages/Admin/AdminDashboard.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await axios.get('/api/admin/stats', {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        });
        setStats(res.data.stats);
      } catch (err) {
        console.error('Failed to load stats');
        toast.error('Failed to load dashboard stats', { icon: '❌' });
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div className="p-8">Loading dashboard...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-600">Total Users</h3>
          <p className="text-4xl font-bold mt-2">{stats?.totalUsers || 0}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-600">Pending Approvals</h3>
          <p className="text-4xl font-bold mt-2 text-orange-600">
            {stats?.pendingApprovals || 0}
          </p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-600">Recent Registrations</h3>
          <p className="text-2xl mt-2">
            {stats?.recentRegistrations?.length || 0} in last few days
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Quick Actions</h2>
          <div className="space-y-3">
            <Link to="/admin/users" className="block bg-blue-50 p-4 rounded hover:bg-blue-100">
              → View & Manage All Users
            </Link>
            <Link to="/admin/pending" className="block bg-orange-50 p-4 rounded hover:bg-orange-100">
              → Pending Approvals ({stats?.pendingApprovals || 0})
            </Link>
          </div>
        </div>

        {/* Recent registrations preview */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Recent Registrations</h2>
          {stats?.recentRegistrations?.length > 0 ? (
            <ul className="space-y-2">
              {stats.recentRegistrations.map(u => (
                <li key={u._id} className="text-sm">
                  {u.email || u.username} • {new Date(u.createdAt).toLocaleDateString()}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-gray-500">No recent registrations</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;