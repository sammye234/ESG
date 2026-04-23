// src/pages/FileManagement.js
import React, { useState, useEffect } from 'react';
import { toast } from "react-hot-toast";
import { 
  Upload, FileText, Trash2, Eye, Download, X, Search, Table, ChevronRight 
} from 'lucide-react';
import useFiles from '../hooks/useFiles';
import { Header } from '../components/common';
import { useNavigate } from 'react-router-dom';

const FileManagement = () => {
  const navigate = useNavigate();

  const {
    files,
    loading,
    uploadFile,
    deleteFile,
    downloadFile,
    getFileById,
    fetchFiles
  } = useFiles();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewingFile, setViewingFile] = useState(null);
  const [activeSheet, setActiveSheet] = useState(0);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleFileUpload = async (event) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const validTypes = ['.csv', '.xlsx', '.xls'];
    const fileExt = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();

    if (!validTypes.includes(fileExt)) {
      toast.error('Please upload CSV or Excel files only', {
        icon: '❌',
        duration: 4000
      });
      return;
    }

    setUploading(true);
    const result = await uploadFile(file);
    setUploading(false);

    if (result.success) {
      toast.success(`File "${file.name}" uploaded successfully!`, {
        icon: '✅',
        duration: 5000
      });
      event.target.value = ''; 
      await fetchFiles(); 
    } else {
      toast.error(`Upload failed: ${result.error || 'Unknown error'}`, {
        icon: '❌',
        duration: 6000
      });
    }
  };

  const handleViewFile = async (fileId) => {
    try {
      const result = await getFileById(fileId);
      if (result.success) {
        setViewingFile(result.data);
        setActiveSheet(0);
        toast.success('File loaded successfully', { icon: '👁️', duration: 3000 });
      } else {
        toast.error(`Failed to load file: ${result.error}`, { icon: '❌' });
      }
    } catch (err) {
      toast.error('Error viewing file', { icon: '❌' });
    }
  };

  // const handleDelete = async (fileId) => {
  //   if (!window.confirm('Are you sure you want to delete this file?')) return;

  //   const result = await deleteFile(fileId);
  //   if (result.success) {
  //     toast.success('File deleted successfully', { icon: '🗑️', duration: 4000 });
  //     await fetchFiles(); 
  //   } else {
  //     toast.error(`Delete failed: ${result.error}`, { icon: '❌' });
  //   }
  // };
  const handleDelete = (fileId, fileName) => {
    toast.custom(
      (t) => (
        <div
          className={`${
            t.visible ? 'animate-enter' : 'animate-leave'
          } max-w-md w-full bg-white shadow-xl rounded-xl pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden`}
        >
          {/* Header / Message area */}
          <div className="p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0 pt-0.5">
                <div className="h-10 w-10 rounded-full bg-red-100 flex items-center justify-center">
                  <Trash2 className="h-6 w-6 text-red-600" />
                </div>
              </div>

              <div className="ml-3 flex-1">
                <p className="text-base font-semibold text-gray-900">
                  Delete file
                </p>
                <p className="mt-1 text-sm text-gray-600">
                  Are you sure you want to delete{" "}
                  <span className="font-medium">"{fileName}"</span>?
                  <br />
                  This action cannot be undone.
                </p>
              </div>
            </div>
          </div>

          
          <div className="bg-gray-50 px-4 py-3 flex justify-end gap-3 border-t border-gray-200">
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={() => toast.dismiss(t.id)}
            >
              Cancel
            </button>
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
              onClick={async () => {
                toast.dismiss(t.id); 

                const loadingToast = toast.loading("Deleting file...");

                try {
                  const result = await deleteFile(fileId);
                  toast.dismiss(loadingToast);

                  if (result.success) {
                    toast.success("File deleted successfully", {
                      icon: "🗑️",
                      duration: 4000,
                    });
                    await fetchFiles();
                  } else {
                    toast.error(`Delete failed: ${result.error || "Unknown error"}`);
                  }
                } catch (err) {
                  toast.dismiss(loadingToast);
                  toast.error("Something went wrong during deletion");
                }
              }}
            >
              Delete
            </button>
          </div>
        </div>
      ),
      {
        duration: Infinity,        
        position: "top-center",      
        
      }
    );
  };

  const handleDownload = async (fileId, fileName) => {
    const result = await downloadFile(fileId, fileName);
    if (result.success) {
      toast.success('Download started', { icon: '⬇️', duration: 3000 });
    } else {
      toast.error(`Download failed: ${result.error}`, { icon: '❌' });
    }
  };

  const filteredFiles = files.filter(file =>
    file.originalName?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getCurrentSheetData = () => {
    if (!viewingFile) return { data: [], headers: [], name: 'Data' };
    
    if (viewingFile.sheets && viewingFile.sheets.length > 0) {
      const currentSheet = viewingFile.sheets[activeSheet];
      return {
        data: Array.isArray(currentSheet?.data) ? currentSheet.data : [],
        headers: currentSheet?.headers || [],
        name: currentSheet?.name || `Sheet ${activeSheet + 1}`
      };
    }
    
    return {
      data: Array.isArray(viewingFile.data) ? viewingFile.data : [],
      headers: viewingFile.metadata?.headers || [],
      name: 'Data'
    };
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      <Header
        title="File Management"
        subtitle="Upload, view, and manage your ESG data files"
        showMenu={false}
        actions={[
          {
            label: 'Back to Dashboard',
            icon: X,
            className: 'px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2',
            onClick: handleBackToDashboard
          }
        ]}
      />

      <main className="p-6 max-w-7xl mx-auto">
        {/* Upload Section */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <Upload className="w-6 h-6 text-blue-500" />
                Upload New File
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Supported formats: CSV, XLSX, XLS
              </p>
            </div>
            <label className="cursor-pointer">
              <input
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileUpload}
                className="hidden"
                disabled={uploading}
              />
              <div className={`px-6 py-3 rounded-lg font-medium transition flex items-center gap-2 ${
                uploading 
                  ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  : 'bg-blue-500 text-white hover:bg-blue-600'
              }`}>
                {uploading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Uploading...
                  </>
                ) : (
                  <>
                    <Upload className="w-5 h-5" />
                    Choose File
                  </>
                )}
              </div>
            </label>
          </div>

          
          <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-lg p-4 border-l-4 border-blue-500 text-sm text-gray-700">
            <p className="font-medium mb-2">📋 Tip</p>
            <p>Use clear, descriptive file names (e.g. "2024_energy_consumption.csv")</p>
          </div>
        </div>

        {/* Search */}
        <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>
          </div>
        </div>

        {/* Files List */}
        {loading ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading files...</p>
          </div>
        ) : filteredFiles.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12 text-center">
            <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-600 text-lg mb-2">
              {searchTerm ? 'No files match your search' : 'No files uploaded yet'}
            </p>
            <p className="text-gray-500 text-sm">
              Upload your first data file to get started
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      File Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Sheets
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Rows
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Uploaded
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {filteredFiles.map((file) => (
                    <tr key={file._id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <FileText className="w-5 h-5 text-gray-400" />
                          <span className="font-medium text-gray-900">
                            {file.originalName}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {file.sheets?.length || file.metadata?.totalSheets || 1} sheet(s)
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {file.data?.length || 0} rows
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {new Date(file.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewFile(file._id)}
                            className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition"
                            title="View"
                          >
                            <Eye className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDownload(file._id, file.originalName)}
                            className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition"
                            title="Download"
                          >
                            <Download className="w-5 h-5" />
                          </button>
                          <button
                            onClick={() => handleDelete(file._id, file.originalName)}
                            className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                            title="Delete"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>

      {/* File Viewer Modal */}
      {viewingFile && (() => {
        const currentSheet = getCurrentSheetData();
        const hasMultipleSheets = viewingFile.sheets && viewingFile.sheets.length > 1;

        return (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl shadow-2xl max-w-6xl w-full max-h-[90vh] overflow-hidden flex flex-col">
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-green-50">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                    <FileText className="w-6 h-6 text-blue-500" />
                    {viewingFile.originalName}
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {currentSheet.data?.length || 0} rows • {hasMultipleSheets ? `${viewingFile.sheets.length} sheets` : '1 sheet'}
                  </p>
                </div>
                <button
                  onClick={() => setViewingFile(null)}
                  className="p-2 hover:bg-white rounded-lg transition"
                >
                  <X className="w-6 h-6 text-gray-500" />
                </button>
              </div>

              {hasMultipleSheets && (
                <div className="px-6 pt-4 bg-gray-50 border-b border-gray-200">
                  <div className="flex gap-2 overflow-x-auto pb-2">
                    {viewingFile.sheets.map((sheet, idx) => (
                      <button
                        key={idx}
                        onClick={() => setActiveSheet(idx)}
                        className={`px-4 py-2 rounded-t-lg font-medium text-sm whitespace-nowrap transition flex items-center gap-2 ${
                          activeSheet === idx
                            ? 'bg-white text-blue-600 border-t-2 border-l border-r border-blue-500 shadow-sm'
                            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                        }`}
                      >
                        <Table className="w-4 h-4" />
                        {sheet.name || `Sheet ${idx + 1}`}
                        <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                          {sheet.data?.length || 0} rows
                        </span>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="flex-1 overflow-auto p-6 bg-gray-50">
                <div className="mb-4 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="px-4 py-2 bg-blue-100 text-blue-700 rounded-lg font-medium flex items-center gap-2">
                      <Table className="w-4 h-4" />
                      {currentSheet.name}
                    </div>
                    <span className="text-sm text-gray-600">
                      {currentSheet.data?.length || 0} rows × {currentSheet.headers?.length || 0} columns
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 overflow-auto shadow-sm">
                  <table className="w-full text-sm">
                    <thead className="bg-gradient-to-r from-blue-50 to-green-50 border-b-2 border-blue-200">
                      <tr>
                        {currentSheet.headers?.map((header, idx) => (
                          <th key={idx} className="px-4 py-3 text-left font-semibold text-gray-700 whitespace-nowrap">
                            {header}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {currentSheet.data?.slice(0, 20).map((row, idx) => (
                        <tr key={idx} className="border-b border-gray-100 hover:bg-blue-50 transition">
                          {Object.values(row).map((cell, cellIdx) => (
                            <td key={cellIdx} className="px-4 py-2 text-gray-600 whitespace-nowrap">
                              {cell ?? ''}
                            </td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {currentSheet.data?.length > 20 && (
                  <p className="text-sm text-gray-500 mt-3 text-center bg-yellow-50 py-2 rounded-lg">
                    📊 Showing first 20 of {currentSheet.data.length} rows
                  </p>
                )}
              </div>

              <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
                <button
                  onClick={() => setViewingFile(null)}
                  className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition font-medium"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};

export default FileManagement;