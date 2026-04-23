// client/src/pages/AccessTest.js
// Temporary page to test HQ Manager access
// Add to App.js routes temporarily

import React from 'react';
import AccessChecker from '../components/AccessChecker';
import { useAuth } from '../context/AuthContext';
import FileAPITest from '../components/FileAPITest';

const AccessTest = () => {
  const { user, logout } = useAuth();

  return (
    <div className="min-h-screen bg-gray-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-800">
            Access Verification Test
          </h1>
          <button
            onClick={logout}
            className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
          >
            Logout
          </button>
        </div>

        {/* Quick Info */}
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded">
          <h3 className="font-semibold text-blue-800 mb-2">ℹ️ How to Use</h3>
          <ol className="list-decimal list-inside space-y-1 text-blue-700">
            <li>Login as HQ Manager (after admin approval)</li>
            <li>Check the information below</li>
            <li>Verify "Accessible Business Units" shows: HQ, GTL, 4AL, SESL</li>
            <li>If correct, try uploading a file in File Management</li>
            <li>Remove this page after testing</li>
          </ol>
        </div>

        {/* Current Auth State */}
        <div className="mb-6 p-4 bg-gray-50 border border-gray-200 rounded">
          <h3 className="font-semibold text-gray-800 mb-3">
            Current Auth Context State
          </h3>
          <pre className="bg-gray-800 text-green-400 p-4 rounded overflow-auto text-sm">
            {JSON.stringify({
              id: user?._id,
              email: user?.email,
              username: user?.username,
              role: user?.role,
              isActive: user?.isActive,
              businessUnit: user?.businessUnit
            }, null, 2)}
          </pre>
        </div>

        {/* Access Checker Component */}
        <AccessChecker />
        <FileAPITest />

        {/* Next Steps */}
        <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded">
          <h3 className="font-semibold text-green-800 mb-2">
            ✅ If Everything Looks Good
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-green-700">
            <li>Go to File Management page</li>
            <li>Try uploading a CSV/Excel file</li>
            <li>Select a business unit (GTL, 4AL, or SESL)</li>
            <li>File should upload without 403 error</li>
            <li>File should appear in the file list</li>
            <li>Navigate to Energy/Water/Waste dashboard</li>
            <li>Select the uploaded file</li>
            <li>Data should process and display</li>
          </ol>
        </div>

        {/* Troubleshooting */}
        <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
          <h3 className="font-semibold text-yellow-800 mb-2">
            🔧 If Issues Persist
          </h3>
          <ul className="space-y-2 text-yellow-700">
            <li>
              <strong>403 Error on upload:</strong> Server routes not updated. 
              Check if `applyBuScope` middleware is before `enforceBuOwnership`
            </li>
            <li>
              <strong>Accessible BUs is empty:</strong> User model `getAccessibleBUs()` 
              method missing or buggy
            </li>
            <li>
              <strong>Still pending:</strong> Admin needs to actually click "Approve" 
              and assign role
            </li>
            <li>
              <strong>Can't see files:</strong> Check `useFiles` hook - might be 
              blocking based on role/active status
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AccessTest;

//http://localhost:3000/access-test