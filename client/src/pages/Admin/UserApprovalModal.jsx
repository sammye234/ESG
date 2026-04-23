// src/components/admin/UserApprovalModal.jsx

import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserRoleSelect from '../../components/admin/UserRoleSelect';

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const UserApprovalModal = ({ user, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    role: 'bu_user',
    businessUnit: 'GTL'
  });
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;
  const handleRoleChange = (newData) => {
    if (['hq_admin', 'hq_manager'].includes(newData.role)) {
      setFormData({
        ...newData,
        businessUnit: ''   
      });
    } else {
      
      setFormData(newData);
    }
  };

  const handleSubmit = async () => {
    if (['bu_manager', 'bu_user'].includes(formData.role) && !formData.businessUnit) {
      toast.error('Business Unit is required for BU roles');
      return;
    }

    
    const submitData = { ...formData };
    if (['hq_admin', 'hq_manager'].includes(formData.role)) {
      delete submitData.businessUnit;  
    }

    setLoading(true);
    try {
      await axios.put(
        `${API_BASE}/admin/users/${user._id}/approve`,
        submitData,
        { headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` } }
      );
      toast.success('User approved successfully');
      onSuccess();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to approve user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-8 max-w-md w-full">
        <h2 className="text-xl font-bold mb-6">Approve User</h2>

        <div className="mb-6">
          <p className="text-sm text-gray-600">User</p>
          <p className="font-medium">{user.email || user.username}</p>
        </div>

        <UserRoleSelect
          value={formData}
          onChange={handleRoleChange}          
          showBU={['bu_manager', 'bu_user'].includes(formData.role)}  
          required={['bu_manager', 'bu_user'].includes(formData.role)}
        />

        <div className="flex justify-end gap-3 mt-8">
          <button
            onClick={onClose}
            className="px-5 py-2 border rounded hover:bg-gray-100"
            disabled={loading}
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="px-5 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
          >
            {loading ? 'Approving...' : 'Approve User'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default UserApprovalModal;