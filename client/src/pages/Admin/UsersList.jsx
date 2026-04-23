// src/pages/Admin/UsersList.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserEditModal from '../../components/admin/UserEditModal';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const UsersList = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 15,
    total: 0,
    pages: 1
  });

  // Filters & Search
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');
  const [buFilter, setBuFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Modal
  const [selectedUser, setSelectedUser] = useState(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pagination.page, pagination.limit, search, roleFilter, buFilter, statusFilter]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (search.trim()) params.search = search.trim();
      if (roleFilter) params.role = roleFilter;
      if (buFilter) params.businessUnit = buFilter;
      if (statusFilter) params.status = statusFilter;

      const res = await axios.get(`${API_BASE}/admin/users`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });

      setUsers(res.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.pagination.total,
        pages: res.data.pagination.pages
      }));
    } catch (err) {
      console.error('Failed to load users:', err);
      toast.error('Failed to load users list');
    } finally {
      setLoading(false);
    }
  };

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 })); // reset to page 1
  };

  const handleFilterChange = (setter) => (e) => {
    setter(e.target.value);
    setPagination(prev => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage) => {
    if (newPage >= 1 && newPage <= pagination.pages) {
      setPagination(prev => ({ ...prev, page: newPage }));
    }
  };

  const openEditModal = (user) => {
    setSelectedUser(user);
    setEditModalOpen(true);
  };

  const handleEditSuccess = () => {
    setEditModalOpen(false);
    fetchUsers(); // refresh list
    toast.success('User updated successfully');
  };

  const getStatusBadge = (user) => {
    if (user.role === 'pending') return <span className="px-2 py-1 bg-yellow-100 text-yellow-800 rounded-full text-xs">Pending</span>;
    if (user.role === 'rejected') return <span className="px-2 py-1 bg-red-100 text-red-800 rounded-full text-xs">Rejected</span>;
    if (!user.isActive) return <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">Inactive</span>;
    return <span className="px-2 py-1 bg-green-100 text-green-800 rounded-full text-xs">Active</span>;
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">All Users</h1>
        <div className="text-sm text-gray-600">
          Total: {pagination.total} users
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <input
              type="text"
              placeholder="Search name or email..."
              value={search}
              onChange={handleSearchChange}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <select
              value={roleFilter}
              onChange={handleFilterChange(setRoleFilter)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">All Roles</option>
              <option value="hq_admin">HQ Admin</option>
              <option value="hq_manager">HQ Manager</option>
              <option value="bu_manager">BU Manager</option>
              <option value="bu_user">BU User</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>

          <div>
            <select
              value={buFilter}
              onChange={handleFilterChange(setBuFilter)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">All Business Units</option>
              <option value="HQ">HQ</option>
              <option value="GTL">GTL</option>
              <option value="4AL">4AL</option>
              <option value="SESL">SESL</option>
            </select>
          </div>

          <div>
            <select
              value={statusFilter}
              onChange={handleFilterChange(setStatusFilter)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">All Status</option>
              <option value="active">Active</option>
              <option value="pending">Pending</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10">Loading users...</div>
      ) : users.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No users found</div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name/Email</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Business Unit</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                  <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(user => (
                  <tr key={user._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {user.username || '—'}
                      </div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.role?.replace('_', ' ').toUpperCase() || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {user.businessUnit || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(user)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                      <button
                        onClick={() => openEditModal(user)}
                        className="text-indigo-600 hover:text-indigo-900"
                        title="Edit user"
                      >
                        Edit
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="text-sm text-gray-700">
              Showing page {pagination.page} of {pagination.pages}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Previous
              </button>
              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-4 py-2 border rounded disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </>
      )}

      {/* Edit Modal */}
      {selectedUser && (
        <UserEditModal
          user={selectedUser}
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
};

export default UsersList;