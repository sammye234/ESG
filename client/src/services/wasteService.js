// client/src/services/wasteService.js
import api from './api';

const formatError = (error) => {
  
  if (error.response) {
    // Server responded with error
    return {
      message: error.response.data?.message || 'Server error occurred',
      status: error.response.status,
      data: error.response.data
    };
  } else if (error.request) {
    // Request made but no response
    return {
      message: 'No response from server. Please check your connection.',
      status: 0
    };
  } else {
    // Error in request setup
    return {
      message: error.message || 'Unknown error occurred',
      status: -1
    };
  }
};



const validateFile = (file) => {
  
  const maxSize = 10 * 1024 * 1024; // 10MB
  const allowedTypes = [
    'text/csv',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ];

  if (!file) {
    throw new Error('No file provided');
  }

  if (file.size > maxSize) {
    throw new Error('File size exceeds 10MB limit');
  }

  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Only CSV and Excel files are allowed');
  }

  return true;

};

const wasteService = {
  uploadWasteData: async (file) => {
    try {
      validateFile(file);
      const formData = new FormData();
      formData.append('file', file);
      // No companyType sent - backend auto-detects

      const response = await api.post('/waste/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      return response.data;
    } catch (error) {
      throw formatError(error);
    }
  },

  getMonthlyData: async (year, month) => {
    try {
      const response = await api.get(`/waste/monthly/${year}/${month}`);
      return response.data;
    } catch (error) {
      throw formatError(error);
    }
  },

  getYearlyData: async (year) => {
    try {
      const response = await api.get(`/waste/yearly/${year}`);
      return response.data;
    } catch (error) {
      throw formatError(error);
    }
  },

  getComparison: async (startYear, endYear) => {
    try {
      const response = await api.get('/waste/comparison', {
        params: { startYear, endYear }
      });
      return response.data;
    } catch (error) {
      throw formatError(error);
    }
  },

  getMetrics: async () => {
    try {
      const response = await api.get('/waste/metrics');
      return response.data;
    } catch (error) {
      throw formatError(error);
    }
  },

  // ... keep delete/update if needed
};

export default wasteService;