// // src/components/admin/UserEditModal.jsx
// import React, { useState, useEffect } from 'react';
// import axios from 'axios';
// import { toast } from 'react-toastify';
// import UserRoleSelect from './UserRoleSelect'; 

// const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

// const UserEditModal = ({ user, isOpen, onClose, onSuccess }) => {
//   const [formData, setFormData] = useState({
//     role: user?.role || 'bu_user',
//     businessUnit: user?.businessUnit || ''
//   });
//   const [loading, setLoading] = useState(false);

//   useEffect(() => {
//     if (user) {
//       setFormData({
//         role: user.role,
//         businessUnit: user.businessUnit || ''
//       });
//     }
//   }, [user]);

//   if (!isOpen) return null;

//   const handleSubmit = async () => {
//     // Basic validation
//     if (['bu_manager', 'bu_user'].includes(formData.role) && !formData.businessUnit) {
//       toast.error('Business Unit is required for BU roles');
//       return;
//     }

//     setLoading(true);
//     try {
//       await axios.put(
//         `${API_BASE}/admin/users/${user._id}`,
//         formData,
//         {
//           headers: { Authorization: `Bearer ${localStorage.getItem('accessToken')}` }
//         }
//       );
//       toast.success('User updated successfully');
//       onSuccess();
//     } catch (err) {
//       toast.error(err.response?.data?.message || 'Failed to update user');
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
//       <div className="bg-white rounded-lg p-8 max-w-md w-full">
//         <h2 className="text-xl font-bold mb-6">Edit User</h2>

//         <div className="mb-6">
//           <p className="text-sm text-gray-600 mb-1">Email / Username</p>
//           <p className="font-medium">{user.email || user.username}</p>
//         </div>

//         {/* Role & Business Unit – */}
//         <UserRoleSelect
//           value={formData}
//           onChange={setFormData}
//           showBU={true}
//           required={true}
//         />

//         <div className="flex justify-end gap-3 mt-8">
//           <button
//             onClick={onClose}
//             className="px-5 py-2 border rounded hover:bg-gray-100"
//             disabled={loading}
//           >
//             Cancel
//           </button>
//           <button
//             onClick={handleSubmit}
//             disabled={loading}
//             className="px-5 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 disabled:opacity-50"
//           >
//             {loading ? 'Saving...' : 'Save Changes'}
//           </button>
//         </div>
//       </div>
//     </div>
//   );
// };

// export default UserEditModal;
// src/components/admin/UserEditModal.jsx
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import UserRoleSelect from './UserRoleSelect'; 

const API_BASE = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const UserEditModal = ({ user, isOpen, onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    role: 'bu_user',
    businessUnit: ''
  });
  const [loading, setLoading] = useState(false);

  // Sync form data when user prop changes
  useEffect(() => {
    if (user) {
      setFormData({
        role: user.role || 'bu_user',
        businessUnit: user.businessUnit || ''
      });
    }
  }, [user]);

  if (!isOpen || !user) return null;

  const handleSubmit = async () => {
    // Client-side validation
    if (['bu_manager', 'bu_user'].includes(formData.role) && !formData.businessUnit) {
      toast.error('Business Unit is required for BU Manager / BU User roles');
      return;
    }

    setLoading(true);

    try {
      const response = await axios.put(
        `${API_BASE}/admin/users/${user._id}`,
        formData,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('accessToken')}`
          }
        }
      );

      toast.success('User updated successfully!');
      onSuccess();
      onClose(); 
    } catch (err) {
      console.error('Update error:', err);
      toast.error(
        err.response?.data?.message ||
        'Failed to update user. Please check your permissions or try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Edit User</h2>

          {/* User Info */}
          <div className="mb-6 bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-600 mb-1">Email / Username</p>
            <p className="font-medium text-gray-900">
              {user.email || user.username || '—'}
            </p>
          </div>

          {/* Role & Business Unit Selector */}
          <UserRoleSelect
            value={formData}
            onChange={setFormData}
            showBU={true}
            required={true}
          />

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 mt-10">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="px-5 py-2.5 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2.5 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 transition-colors"
            >
              {loading ? (
                <span className="flex items-center">
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Saving...
                </span>
              ) : (
                'Save Changes'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserEditModal;