// client/src/services/fileService.js
import api from './api';

export const fileService = {
  // Get all files for current user
  getAllFiles: async () => {
    try {
      const response = await api.get('/files');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get file by ID
  getFileById: async (id) => {
    try {
      const response = await api.get(`/files/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new folder
  createFolder: async (folderData) => {
    try {
      const response = await api.post('/files/folder', folderData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new file
  createFile: async (fileData) => {
    try {
      const response = await api.post('/files/file', fileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update file
  updateFile: async (id, fileData) => {
    try {
      const response = await api.put(`/files/${id}`, fileData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete file
  deleteFile: async (id) => {
    try {
      const response = await api.delete(`/files/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Get folder contents
  getFolderContents: async (id) => {
    try {
      const response = await api.get(`/files/folder/${id}/contents`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Upload CSV file
  uploadCSV: async (file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      
      const response = await api.post('/upload/csv', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Parse CSV data
  parseCSV: async (csvData) => {
    try {
      const response = await api.post('/upload/parse', { csvData });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Local storage fallback methods (for offline/development)
  getLocalFiles: () => {
    const files = localStorage.getItem('esg-files');
    return files ? JSON.parse(files) : [];
  },

  saveLocalFiles: (files) => {
    localStorage.setItem('esg-files', JSON.stringify(files));
  },

  // Flatten file tree (helper function)
  flattenFiles: (items, result = []) => {
    items.forEach(item => {
      if (item.type === 'file') {
        result.push(item);
      }
      if (item.children) {
        fileService.flattenFiles(item.children, result);
      }
    });
    return result;
  }
};

export default fileService;