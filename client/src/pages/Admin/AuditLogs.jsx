// src/pages/Admin/AuditLogs.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { format } from 'date-fns';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const AuditLogs = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 20,
    total: 0,
    pages: 1
  });

  // Filters
  const [actionFilter, setActionFilter] = useState('');
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  useEffect(() => {
    fetchAuditLogs();
  }, [pagination.page, pagination.limit, actionFilter, fromDate, toDate]);

  const fetchAuditLogs = async () => {
    setLoading(true);
    try {
      const params = {
        page: pagination.page,
        limit: pagination.limit
      };

      if (actionFilter) params.action = actionFilter;
      if (fromDate) params.fromDate = fromDate;
      if (toDate) params.toDate = toDate;

      const res = await axios.get(`${API_BASE}/admin/audit-logs`, {
        params,
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });

      setLogs(res.data.data || []);
      setPagination(prev => ({
        ...prev,
        total: res.data.pagination.total,
        pages: res.data.pagination.pages
      }));
    } catch (err) {
      console.error('Failed to load audit logs:', err);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
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

  const getActionBadge = (action) => {
    const colors = {
      user_approved: 'bg-green-100 text-green-800',
      user_rejected: 'bg-red-100 text-red-800',
      user_role_changed: 'bg-blue-100 text-blue-800'
    };
    return (
      <span className={`px-2 py-1 rounded-full text-xs ${colors[action] || 'bg-gray-100 text-gray-800'}`}>
        {action.replace('_', ' ').toUpperCase()}
      </span>
    );
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Audit Logs</h1>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Action Type</label>
            <select
              value={actionFilter}
              onChange={handleFilterChange(setActionFilter)}
              className="w-full border rounded px-3 py-2"
            >
              <option value="">All Actions</option>
              <option value="user_approved">User Approved</option>
              <option value="user_rejected">User Rejected</option>
              <option value="user_role_changed">Role/BU Changed</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">From Date</label>
            <input
              type="date"
              value={fromDate}
              onChange={handleFilterChange(setFromDate)}
              className="w-full border rounded px-3 py-2"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">To Date</label>
            <input
              type="date"
              value={toDate}
              onChange={handleFilterChange(setToDate)}
              className="w-full border rounded px-3 py-2"
            />
          </div>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="text-center py-10">Loading audit logs...</div>
      ) : logs.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No audit logs found</div>
      ) : (
        <>
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date/Time</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Performed By</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Target User</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Details</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {logs.map(log => (
                  <tr key={log._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {format(new Date(log.createdAt), 'MMM dd, yyyy • HH:mm')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getActionBadge(log.action)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.performedBy?.username || log.performedBy?.email || '—'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {log.targetUser?.username || log.targetUser?.email || '—'}
                    </td>
                    <td className="px-6 py-4 text-sm">
                      {Object.entries(log.details || {}).map(([key, value]) => (
                        <div key={key}>
                          <strong>{key.replace(/([A-Z])/g, ' $1').trim()}:</strong> {value}
                        </div>
                      ))}
                      {Object.keys(log.details || {}).length === 0 && '—'}
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
    </div>
  );
};

export default AuditLogs;