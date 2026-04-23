// client/src/components/FileAPITest.jsx


import React, { useState } from 'react';
import api from '../services/api';

const FileAPITest = () => {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadResult, setUploadResult] = useState(null);

  const testFetchFiles = async () => {
    try {
      setLoading(true);
      setResult(null);
      
      console.log('🧪 Testing GET /api/files...');
      const response = await api.get('/files');
      
      console.log('📊 Response:', response.data);
      
      setResult({
        success: true,
        status: response.status,
        data: response.data
      });
    } catch (err) {
      console.error('❌ Error:', err);
      setResult({
        success: false,
        status: err.response?.status,
        error: err.response?.data || err.message
      });
    } finally {
      setLoading(false);
    }
  };

  const testUploadFile = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    try {
      setLoading(true);
      setUploadResult(null);

      console.log('🧪 Testing file upload...');
      
      const formData = new FormData();
      formData.append('file', file);
      formData.append('businessUnit', 'GTL'); // Test with GTL

      const response = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      console.log('✅ Upload response:', response.data);

      setUploadResult({
        success: true,
        message: 'File uploaded successfully!',
        data: response.data
      });

      // Auto-refresh files
      await testFetchFiles();
    } catch (err) {
      console.error('❌ Upload error:', err);
      setUploadResult({
        success: false,
        error: err.response?.data?.message || err.message
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h3 className="text-xl font-bold mb-4">🧪 File API Test</h3>

      {/* Test Fetch */}
      <div className="mb-6">
        <button
          onClick={testFetchFiles}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? '⏳ Testing...' : '📡 Test GET /api/files'}
        </button>

        {result && (
          <div className={`mt-4 p-4 rounded ${
            result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h4 className="font-semibold mb-2">
              {result.success ? '✅ Success' : '❌ Failed'}
            </h4>
            <div className="text-sm">
              <div className="mb-2">
                <strong>Status:</strong> {result.status}
              </div>
              {result.success ? (
                <>
                  <div className="mb-2">
                    <strong>Files Count:</strong> {result.data.count || 0}
                  </div>
                  {result.data.files && result.data.files.length > 0 ? (
                    <div className="mt-4">
                      <strong>Files:</strong>
                      <ul className="mt-2 space-y-2">
                        {result.data.files.slice(0, 5).map((file, i) => (
                          <li key={i} className="p-2 bg-white rounded border">
                            <div><strong>Name:</strong> {file.originalName || file.name}</div>
                            <div><strong>BU:</strong> {file.businessUnit || 'NONE'}</div>
                            <div><strong>Type:</strong> {file.type}</div>
                          </li>
                        ))}
                      </ul>
                      {result.data.files.length > 5 && (
                        <p className="mt-2 text-gray-600">
                          ... and {result.data.files.length - 5} more
                        </p>
                      )}
                    </div>
                  ) : (
                    <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded">
                      <strong>⚠️ No files returned</strong>
                      <p className="mt-2">This means either:</p>
                      <ul className="list-disc list-inside mt-1">
                        <li>No files uploaded yet</li>
                        <li>Files filtered out by BU access</li>
                        <li>Files uploaded by different user</li>
                      </ul>
                    </div>
                  )}
                </>
              ) : (
                <pre className="bg-red-100 p-3 rounded mt-2 overflow-auto text-xs">
                  {JSON.stringify(result.error, null, 2)}
                </pre>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Test Upload */}
      <div className="mb-6 p-4 bg-gray-50 rounded">
        <h4 className="font-semibold mb-3">📤 Test File Upload</h4>
        <input
          type="file"
          accept=".csv,.xlsx,.xls"
          onChange={testUploadFile}
          disabled={loading}
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded file:border-0
            file:text-sm file:font-semibold
            file:bg-blue-50 file:text-blue-700
            hover:file:bg-blue-100
            disabled:opacity-50"
        />
        <p className="mt-2 text-sm text-gray-600">
          Will upload to Business Unit: <strong>GTL</strong>
        </p>

        {uploadResult && (
          <div className={`mt-4 p-4 rounded ${
            uploadResult.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'
          }`}>
            <h5 className="font-semibold mb-2">
              {uploadResult.success ? '✅ Upload Success' : '❌ Upload Failed'}
            </h5>
            <div className="text-sm">
              {uploadResult.success ? (
                <div>
                  <p>{uploadResult.message}</p>
                  <div className="mt-2 p-2 bg-white rounded">
                    <strong>File Details:</strong>
                    <div>Name: {uploadResult.data.file?.originalName}</div>
                    <div>BU: {uploadResult.data.file?.businessUnit}</div>
                    <div>Type: {uploadResult.data.file?.type}</div>
                  </div>
                </div>
              ) : (
                <div className="text-red-700">
                  {uploadResult.error}
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="p-4 bg-blue-50 border border-blue-200 rounded">
        <h4 className="font-semibold text-blue-800 mb-2">💡 How to Use</h4>
        <ol className="list-decimal list-inside space-y-1 text-sm text-blue-700">
          <li>Click "Test GET /api/files" to see what the API returns</li>
          <li>If it returns empty, try uploading a file</li>
          <li>Select a CSV/Excel file and it will auto-upload to GTL</li>
          <li>After upload, check if file appears in the response</li>
          <li>If it works here but not in File Management, issue is in useFiles hook</li>
        </ol>
      </div>
    </div>
  );
};

export default FileAPITest;

// ═══════════════════════════════════════════════════════════════════
// ADD TO AccessTest.jsx:
// ═══════════════════════════════════════════════════════════════════
/*

import FileAPITest from '../components/FileAPITest';

// Add after AccessChecker component:
<FileAPITest />

*/