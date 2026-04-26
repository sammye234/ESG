import React, { useState, useEffect, useRef } from 'react';
import { toast } from 'react-hot-toast';
import { Upload, FileText, Trash2, Eye, Download, X, Search, Table, FileSpreadsheet, File } from 'lucide-react';
import useFiles from '../hooks/useFiles';
import { Header } from '../components/common';
import { useNavigate } from 'react-router-dom';

const FILE_TYPE_CONFIG = {
  csv:  { icon: FileText,        color: 'text-emerald-600', bg: 'bg-emerald-50',  badge: 'bg-emerald-100 text-emerald-700' },
  xlsx: { icon: FileSpreadsheet, color: 'text-blue-600',    bg: 'bg-blue-50',     badge: 'bg-blue-100 text-blue-700'     },
  xls:  { icon: FileSpreadsheet, color: 'text-blue-600',    bg: 'bg-blue-50',     badge: 'bg-blue-100 text-blue-700'     },
};

const getFileConfig = (type) => FILE_TYPE_CONFIG[type?.toLowerCase()] || { icon: File, color: 'text-gray-500', bg: 'bg-gray-50', badge: 'bg-gray-100 text-gray-600' };

const formatBytes = (bytes) => {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};

const formatDate = (date) => new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });

const DeleteConfirmModal = ({ file, onConfirm, onCancel }) => (
  <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
    <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
      <div className="flex items-center gap-4 mb-4">
        <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center flex-shrink-0">
          <Trash2 className="w-6 h-6 text-red-600" />
        </div>
        <div>
          <h3 className="text-base font-semibold text-gray-900">Delete file</h3>
          <p className="text-sm text-gray-500 mt-0.5">This action cannot be undone</p>
        </div>
      </div>
      <p className="text-sm text-gray-600 mb-6 bg-gray-50 rounded-lg px-3 py-2 font-medium truncate">
        {file?.originalName}
      </p>
      <div className="flex gap-3">
        <button onClick={onCancel} className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium text-gray-700 hover:bg-gray-50 transition">
          Cancel
        </button>
        <button onClick={onConfirm} className="flex-1 px-4 py-2.5 bg-red-600 rounded-xl text-sm font-medium text-white hover:bg-red-700 transition">
          Delete
        </button>
      </div>
    </div>
  </div>
);

const FileViewerModal = ({ file, onClose }) => {
  const [activeSheet, setActiveSheet] = useState(0);

  const getCurrentSheet = () => {
    if (!file) return { data: [], headers: [], name: 'Data' };
    if (file.sheets?.length > 0) {
      const s = file.sheets[activeSheet];
      return { data: Array.isArray(s?.data) ? s.data : [], headers: s?.headers || [], name: s?.name || `Sheet ${activeSheet + 1}` };
    }
    return { data: Array.isArray(file.data) ? file.data : [], headers: file.metadata?.headers || [], name: 'Data' };
  };

  const sheet = getCurrentSheet();
  const hasMultipleSheets = file?.sheets?.length > 1;
  const preview = sheet.data.slice(0, 20);

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <div className="flex items-center gap-3 min-w-0">
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center flex-shrink-0 ${getFileConfig(file?.type).bg}`}>
              {React.createElement(getFileConfig(file?.type).icon, { className: `w-5 h-5 ${getFileConfig(file?.type).color}` })}
            </div>
            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-gray-900 truncate">{file?.originalName}</h3>
              <p className="text-xs text-gray-400">{sheet.data.length} rows · {sheet.headers.length} columns</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-gray-100 transition text-gray-400">
            <X className="w-4 h-4" />
          </button>
        </div>

        {hasMultipleSheets && (
          <div className="flex gap-1 px-6 pt-3 bg-gray-50 border-b border-gray-100 overflow-x-auto">
            {file.sheets.map((s, idx) => (
              <button
                key={idx}
                onClick={() => setActiveSheet(idx)}
                className={`flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-t-lg whitespace-nowrap transition ${
                  activeSheet === idx ? 'bg-white text-emerald-700 border border-b-white border-gray-200 shadow-sm' : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Table className="w-3 h-3" />
                {s.name}
                <span className="bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded text-[10px]">{s.data?.length || 0}</span>
              </button>
            ))}
          </div>
        )}

        <div className="flex-1 overflow-auto p-4">
          {sheet.headers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-40 text-gray-400">
              <Table className="w-10 h-10 mb-2 opacity-30" />
              <p className="text-sm">No data available</p>
            </div>
          ) : (
            <div className="border border-gray-200 rounded-xl overflow-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-200">
                    <th className="px-3 py-2.5 text-left text-gray-400 font-medium w-10">#</th>
                    {sheet.headers.map((h, i) => (
                      <th key={i} className="px-3 py-2.5 text-left text-gray-600 font-semibold whitespace-nowrap">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {preview.map((row, i) => (
                    <tr key={i} className="border-b border-gray-100 hover:bg-emerald-50/50 transition">
                      <td className="px-3 py-2 text-gray-300 font-mono">{i + 1}</td>
                      {Object.values(row).map((cell, j) => (
                        <td key={j} className="px-3 py-2 text-gray-600 whitespace-nowrap max-w-[200px] truncate">{cell ?? '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {sheet.data.length > 20 && (
            <p className="text-center text-xs text-gray-400 mt-3">
              Showing 20 of {sheet.data.length} rows
            </p>
          )}
        </div>

        <div className="px-6 py-4 border-t border-gray-100 flex justify-end">
          <button onClick={onClose} className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-xl hover:bg-gray-700 transition">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

const FileManagement = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  const { files, loading, uploadFile, deleteFile, downloadFile, getFileById, fetchFiles } = useFiles();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewingFile, setViewingFile] = useState(null);
  const [deletingFile, setDeletingFile] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);

  useEffect(() => { fetchFiles(); }, [fetchFiles]);

  const processUpload = async (file) => {
    const validTypes = ['.csv', '.xlsx', '.xls'];
    const ext = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
    if (!validTypes.includes(ext)) {
      toast.error('Please upload CSV or Excel files only');
      return;
    }
    setUploading(true);
    const result = await uploadFile(file);
    setUploading(false);
    if (result.success) {
      toast.success(`"${file.name}" uploaded successfully`);
      await fetchFiles();
    } else {
      toast.error(`Upload failed: ${result.error || 'Unknown error'}`);
    }
  };

  const handleFileInput = async (e) => {
    const file = e.target.files?.[0];
    if (file) await processUpload(file);
    e.target.value = '';
  };

  const handleDrop = async (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file) await processUpload(file);
  };

  const handleView = async (fileId) => {
    const result = await getFileById(fileId);
    if (result.success) {
      setViewingFile(result.data);
    } else {
      toast.error('Failed to load file preview');
    }
  };

  const handleDownload = async (fileId, fileName) => {
    const result = await downloadFile(fileId, fileName);
    if (result.success) {
      toast.success('Download started');
    } else {
      toast.error(`Download failed: ${result.error}`);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingFile) return;
    const result = await deleteFile(deletingFile._id);
    setDeletingFile(null);
    if (result.success) {
      toast.success('File deleted');
      await fetchFiles();
    } else {
      toast.error(`Delete failed: ${result.error}`);
    }
  };

  const filtered = files.filter(f => f.originalName?.toLowerCase().includes(searchTerm.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="File Management"
        subtitle="Upload, view, and manage your ESG data files"
        showMenu={false}
        actions={[{
          label: 'Back to Dashboard',
          icon: X,
          className: 'px-4 py-2 bg-white border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 transition flex items-center gap-2 text-sm font-medium',
          onClick: () => navigate('/dashboard')
        }]}
      />

      <main className="max-w-6xl mx-auto px-6 py-8 space-y-6">
        <div
          onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => !uploading && fileInputRef.current?.click()}
          className={`relative border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer transition-all ${
            dragOver ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200 bg-white hover:border-emerald-300 hover:bg-emerald-50/30'
          }`}
        >
          <input ref={fileInputRef} type="file" accept=".csv,.xlsx,.xls" onChange={handleFileInput} className="hidden" />
          {uploading ? (
            <div className="flex flex-col items-center gap-3">
              <div className="w-10 h-10 border-3 border-emerald-500 border-t-transparent rounded-full animate-spin" style={{ borderWidth: 3 }} />
              <p className="text-sm font-medium text-emerald-700">Uploading file...</p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center transition ${dragOver ? 'bg-emerald-500' : 'bg-gray-100'}`}>
                <Upload className={`w-6 h-6 ${dragOver ? 'text-white' : 'text-gray-400'}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-gray-700">Drop files here or <span className="text-emerald-600">browse</span></p>
                <p className="text-xs text-gray-400 mt-1">CSV, XLSX, XLS files supported</p>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
            <div>
              <h2 className="text-sm font-semibold text-gray-900">All Files</h2>
              <p className="text-xs text-gray-400 mt-0.5">{files.length} file{files.length !== 1 ? 's' : ''} total</p>
            </div>
            <div className="relative">
              <Search className="w-4 h-4 text-gray-300 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search files..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9 pr-4 py-2 text-sm border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-transparent w-56"
              />
            </div>
          </div>

          {loading ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin mb-3" />
              <p className="text-sm">Loading files...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-gray-400">
              <div className="w-16 h-16 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
                <FileText className="w-8 h-8 text-gray-300" />
              </div>
              <p className="text-sm font-medium text-gray-500">{searchTerm ? 'No files match your search' : 'No files yet'}</p>
              <p className="text-xs text-gray-400 mt-1">{searchTerm ? 'Try a different search term' : 'Upload your first data file to get started'}</p>
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="bg-gray-50/60">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Sheets</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Rows</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Size</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">Uploaded</th>
                  <th className="px-6 py-3 text-right text-xs font-semibold text-gray-400 uppercase tracking-wider">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filtered.map((file) => {
                  const cfg = getFileConfig(file.type);
                  const Icon = cfg.icon;
                  return (
                    <tr key={file._id} className="hover:bg-gray-50/60 transition group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${cfg.bg}`}>
                            <Icon className={`w-4 h-4 ${cfg.color}`} />
                          </div>
                          <span className="text-sm font-medium text-gray-800 truncate max-w-[220px]">{file.originalName}</span>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className={`text-xs font-medium px-2 py-1 rounded-full uppercase ${cfg.badge}`}>
                          {file.type}
                        </span>
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {file.sheets?.length || file.metadata?.totalSheets || 1}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {file.metadata?.rows ?? '—'}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-500">
                        {formatBytes(file.size)}
                      </td>
                      <td className="px-4 py-4 text-sm text-gray-400">
                        {formatDate(file.createdAt)}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => handleView(file._id)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-blue-600 hover:bg-blue-50 transition"
                            title="Preview"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleDownload(file._id, file.originalName)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 transition"
                            title="Download"
                          >
                            <Download className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingFile(file)}
                            className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:text-red-600 hover:bg-red-50 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </main>

      {viewingFile && <FileViewerModal file={viewingFile} onClose={() => setViewingFile(null)} />}
      {deletingFile && (
        <DeleteConfirmModal
          file={deletingFile}
          onConfirm={handleDeleteConfirm}
          onCancel={() => setDeletingFile(null)}
        />
      )}
    </div>
  );
};

export default FileManagement;