// src/pages/Admin/PendingApprovals.jsx 
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserApprovalModal from './UserApprovalModal'; 
import RejectModal from '../../components/admin/RejectModal';
import { useAuth } from '../../context/AuthContext';
import { useData } from '../../context/DataContext';
const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const PendingApprovals = () => {
  const { refreshUser } = useAuth();
  const { refreshData } = useData();
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  // Approve Modal
  const [approveModalOpen, setApproveModalOpen] = useState(false);
  const [selectedUserForApprove, setSelectedUserForApprove] = useState(null);

  // Reject Modal
  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [selectedUserForReject, setSelectedUserForReject] = useState(null);

  useEffect(() => {
    fetchPendingUsers();
  }, []);

  const fetchPendingUsers = async () => {
    setLoading(true);
    try {
      const res = await axios.get(`${API_BASE}/admin/pending`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
      });
      setPendingUsers(res.data.users || []);
    } catch (err) {
      console.error('Failed to load pending users:', err);
      toast.error('Failed to load pending approvals');
    } finally {
      setLoading(false);
    }
  };

  const handleApproveClick = (user) => {
    setSelectedUserForApprove(user);
    setApproveModalOpen(true);
  };

  const handleRejectClick = (user) => {
    setSelectedUserForReject(user);
    setRejectModalOpen(true);
  };

  const handleActionSuccess = async () => {
    console.log('[PendingApprovals] Action success – calling refresh');
    setApproveModalOpen(false);
    setRejectModalOpen(false);
    fetchPendingUsers();
    await refreshUser();
    refreshData();
    //console.log('[PendingApprovals] Refresh called');
  };
  //   try {
  //     const { authService } = require('../services/authService'); 
  //     const updatedUser = await authService.getCurrentUser();
  
  //   } catch (err) {
  //     console.error('Failed to refresh user after approval');
  //   }
  // };

  if (loading) return <div className="p-8 text-center">Loading pending approvals...</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Pending Approvals ({pendingUsers.length})</h1>

      {pendingUsers.length === 0 ? (
        <div className="text-center py-10 text-gray-500">No pending approvals</div>
      ) : (
        <div className="overflow-x-auto bg-white rounded-lg shadow">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name/Email</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Registered</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {pendingUsers.map(user => (
                <tr key={user._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">
                      {user.username || '—'}
                    </div>
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium">
                    <button
                      onClick={() => handleApproveClick(user)}
                      className="text-green-600 hover:text-green-900 mr-4"
                    >
                      Approve
                    </button>
                    <button
                      onClick={() => handleRejectClick(user)}
                      className="text-red-600 hover:text-red-900"
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Approve Modal */}
      {selectedUserForApprove && (
        <UserApprovalModal
          user={selectedUserForApprove}
          isOpen={approveModalOpen}
          onClose={() => setApproveModalOpen(false)}
          onSuccess={handleActionSuccess}
        />
      )}

      {/* Reject Modal */}
      {selectedUserForReject && (
        <RejectModal
          user={selectedUserForReject}
          isOpen={rejectModalOpen}
          onClose={() => setRejectModalOpen(false)}
          onSuccess={handleActionSuccess}
        />
      )}
    </div>
  );
};

export default PendingApprovals;