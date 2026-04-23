// client/src/components/AccessChecker.jsx
// Use this component to verify HQ Manager access

import React, { useState, useEffect } from 'react';
import api from '../services/api';

const AccessChecker = () => {
  const [accessInfo, setAccessInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    checkAccess();
  }, []);

  const checkAccess = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get('/auth/check-access');
      setAccessInfo(response.data.user);
    } catch (err) {
      setError(err.response?.data?.message || err.message);
      console.error('Access check error:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6 bg-white rounded-lg shadow">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Error</h3>
        <p className="text-red-600">{error}</p>
        <button
          onClick={checkAccess}
          className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!accessInfo) {
    return null;
  }

  const isHQRole = ['hq_admin', 'hq_manager'].includes(accessInfo.role);
  const isBURole = ['bu_manager', 'bu_user'].includes(accessInfo.role);

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">
          🔐 Access Verification
        </h2>
        <p className="text-gray-600">
          Current user access and permissions
        </p>
      </div>

      {/* User Info */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h3 className="font-semibold text-gray-800 mb-3">👤 User Information</h3>
        <div className="space-y-2">
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium">{accessInfo.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Username:</span>
            <span className="font-medium">{accessInfo.username}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Role:</span>
            <span className={`font-medium px-2 py-1 rounded ${
              isHQRole ? 'bg-purple-100 text-purple-800' : 'bg-blue-100 text-blue-800'
            }`}>
              {accessInfo.role}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Active:</span>
            <span className={`font-medium ${
              accessInfo.isActive ? 'text-green-600' : 'text-red-600'
            }`}>
              {accessInfo.isActive ? '✅ Yes' : '❌ No'}
            </span>
          </div>
          {accessInfo.businessUnit && (
            <div className="flex justify-between">
              <span className="text-gray-600">Business Unit:</span>
              <span className="font-medium">
                {accessInfo.businessUnit.code} - {accessInfo.businessUnit.name}
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Accessible BUs */}
      <div className="mb-6 p-4 bg-blue-50 rounded">
        <h3 className="font-semibold text-gray-800 mb-3">🏢 Accessible Business Units</h3>
        <div className="flex flex-wrap gap-2">
          {accessInfo.accessibleBUs.map(bu => (
            <span
              key={bu}
              className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm font-medium"
            >
              {bu}
            </span>
          ))}
        </div>
        {accessInfo.accessibleBUs.length === 0 && (
          <p className="text-red-600">⚠️ No accessible business units!</p>
        )}
      </div>

      {/* Permissions */}
      <div className="mb-6 p-4 bg-green-50 rounded">
        <h3 className="font-semibold text-gray-800 mb-3">🔑 Permissions</h3>
        <div className="space-y-2">
          {Object.entries(accessInfo.permissions).map(([key, value]) => (
            <div key={key} className="flex items-center justify-between">
              <span className="text-gray-700 capitalize">
                {key.replace(/([A-Z])/g, ' $1').trim()}:
              </span>
              <span className={value ? 'text-green-600' : 'text-gray-400'}>
                {value ? '✅' : '❌'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Expected Behavior */}
      <div className={`p-4 rounded ${
        isHQRole ? 'bg-purple-50 border border-purple-200' : 'bg-blue-50 border border-blue-200'
      }`}>
        <h3 className="font-semibold text-gray-800 mb-3">
          🎯 Expected Behavior
        </h3>
        {isHQRole ? (
          <ul className="space-y-2 text-gray-700">
            <li>✅ Can view files from ALL business units</li>
            <li>✅ Can upload files to ANY business unit</li>
            <li>✅ Can see combined data in dashboards</li>
            <li>✅ Accessible BUs should show: HQ, GTL, 4AL, SESL</li>
          </ul>
        ) : isBURole ? (
          <ul className="space-y-2 text-gray-700">
            <li>✅ Can only view files from: {accessInfo.businessUnit?.code}</li>
            <li>✅ Can only upload files to: {accessInfo.businessUnit?.code}</li>
            <li>✅ Dashboards show only your BU data</li>
            <li>❌ Cannot access other BU files</li>
          </ul>
        ) : (
          <p className="text-gray-600">Role type not recognized</p>
        )}
      </div>

      {/* Warnings */}
      {isHQRole && accessInfo.accessibleBUs.length < 4 && (
        <div className="mt-4 p-4 bg-yellow-50 border border-yellow-300 rounded">
          <h4 className="font-semibold text-yellow-800 mb-2">⚠️ Warning</h4>
          <p className="text-yellow-700">
            HQ role detected but not all business units are accessible!
            <br />
            Expected: HQ, GTL, 4AL, SESL
            <br />
            Got: {accessInfo.accessibleBUs.join(', ') || 'None'}
          </p>
        </div>
      )}

      {!accessInfo.isActive && (
        <div className="mt-4 p-4 bg-red-50 border border-red-300 rounded">
          <h4 className="font-semibold text-red-800 mb-2">❌ Account Inactive</h4>
          <p className="text-red-700">
            Your account is not active. Please contact an administrator.
          </p>
        </div>
      )}

      {/* Refresh Button */}
      <button
        onClick={checkAccess}
        className="mt-6 w-full px-4 py-2 bg-gray-800 text-white rounded hover:bg-gray-900 transition"
      >
        🔄 Refresh Access Info
      </button>
    </div>
  );
};

export default AccessChecker;
