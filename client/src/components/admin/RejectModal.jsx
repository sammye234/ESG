// src/components/admin/RejectModal.jsx
import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const RejectModal = ({ user, isOpen, onClose, onSuccess }) => {
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await axios.put(
        `${API_BASE}/admin/users/${user._id}/reject`,
        { reason },
        {
          headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
        }
      );
      toast.success('User rejected successfully');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reject user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-xl font-bold mb-6">Reject User</h2>

        <div className="mb-6">
          <p className="text-sm text-gray-600 mb-1">Email / Username</p>
          <p className="font-medium">{user.email || user.username}</p>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Rejection Reason (optional)
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Provide a reason for rejection..."
            rows={4}
            className="w-full border rounded px-3 py-2"
          />
        </div>

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 border rounded hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? 'Rejecting...' : 'Reject User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RejectModal;