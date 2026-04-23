// // client/src/hooks/useWaste.js
// import { useState, useCallback } from 'react';
// import api from '../services/api';

// export const useWaste = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const getWasteFiles = useCallback(async () => {
//     try {
//       setLoading(true);
//       const res = await api.get('/waste/files');
//       return res.data;
//     } catch (err) {
//       setError(err.response?.data?.error || err.message);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const processWasteFile = useCallback(async (fileId) => {
//     try {
//       setLoading(true);
//       const res = await api.post(`/waste/process/${fileId}`);
//       return res.data;
//     } catch (err) {
//       setError(err.response?.data?.error || err.message);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const getMetrics = useCallback(async (fileId) => {
//     try {
//       setLoading(true);
//       const res = await api.get(`/waste/metrics/${fileId}`);
//       return res.data;
//     } catch (err) {
//       setError(err.response?.data?.error || err.message);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   return { loading, error, getWasteFiles, processWasteFile, getMetrics };
// };
// client/src/hooks/useWaste.js
import { useState, useCallback } from 'react';
import api from '../services/api';

export const useWaste = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getWasteFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('🗑️ Fetching waste files...');
      const response = await api.get('/waste/files');
      console.log('✅ Waste files loaded:', response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error('❌ Error fetching waste files:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const processWasteFile = useCallback(async (fileId) => {
    try {
      setLoading(true);
      setError(null);
      console.log('⚙️ Processing waste file:', fileId);
      const response = await api.post(`/waste/process/${fileId}`);
      console.log('✅ Waste file processed:', response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error('❌ Error processing waste file:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getMetrics = useCallback(async (fileId) => {
    try {
      setLoading(true);
      setError(null);
      console.log('📊 Fetching waste metrics for file:', fileId);
      const response = await api.get(`/waste/metrics/${fileId}`);
      console.log('✅ Waste metrics loaded:', response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error('❌ Error fetching waste metrics:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const getDashboardSummary = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('📈 Fetching waste dashboard summary...');
      const response = await api.get('/waste/dashboard-summary');
      console.log('✅ Waste dashboard summary loaded:', response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error('❌ Error fetching waste summary:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const exportData = useCallback(async (fileId, format = 'csv') => {
    try {
      setLoading(true);
      setError(null);
      console.log(`📥 Exporting waste data as ${format} for file:`, fileId);
      const response = await api.get(`/waste/export/${fileId}`, {
        params: { format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        // Create download link
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `waste-data-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        console.log('✅ CSV download initiated');
      }
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error('❌ Error exporting waste data:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getWasteFiles,
    processWasteFile,
    getMetrics,
    getDashboardSummary,
    exportData
  };
};

export default useWaste;