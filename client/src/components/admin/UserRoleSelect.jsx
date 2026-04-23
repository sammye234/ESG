// src/components/admin/UserRoleSelect.jsx
import React from 'react';

const UserRoleSelect = ({ value, onChange, showBU = true, required = true }) => {
  return (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Role {required && <span className="text-red-500">*</span>}
        </label>
        <select
          name="role"
          value={value.role}
          onChange={(e) => onChange({ ...value, role: e.target.value })}
          className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          required={required}
        >
          <option value="hq_admin">HQ Admin</option>
          <option value="hq_manager">HQ Manager</option>
          <option value="bu_manager">BU Manager</option>
          <option value="bu_user">BU User</option>
        </select>
      </div>

      {showBU && ['bu_manager', 'bu_user'].includes(value.role) && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Business Unit {required && <span className="text-red-500">*</span>}
          </label>
          <select
            name="businessUnit"
            value={value.businessUnit}
            onChange={(e) => onChange({ ...value, businessUnit: e.target.value })}
            className="w-full border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            required={required}
          >
            <option value="">Select Business Unit</option>
            <option value="GTL">GTL</option>
            <option value="4AL">4AL</option>
            <option value="SESL">SESL</option>
          </select>
        </div>
      )}
    </div>
  );
};

export default UserRoleSelect;