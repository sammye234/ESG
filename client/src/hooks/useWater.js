// // client/src/hooks/useWater.js
// import { useState, useCallback } from 'react';
// import api from '../services/api';

// export const useWater = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const getWaterFiles = useCallback(async () => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await api.get('/water/files');
//       return response.data;
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message;
//       setError(errorMsg);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const processWaterFile = useCallback(async (fileId) => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await api.post(`/water/process/${fileId}`);
//       return response.data;
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message;
//       setError(errorMsg);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const getMetrics = useCallback(async (fileId) => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await api.get(`/water/metrics/${fileId}`);
//       return response.data;
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message;
//       setError(errorMsg);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   const exportData = useCallback(async (fileId, format = 'csv') => {
//     try {
//       setLoading(true);
//       setError(null);
//       const response = await api.get(`/water/export/${fileId}`, {
//         params: { format }
//       });
//       return response.data;
//     } catch (err) {
//       const errorMsg = err.response?.data?.error || err.message;
//       setError(errorMsg);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   }, []);

//   return {
//     loading,
//     error,
//     getWaterFiles,
//     processWaterFile,
//     getMetrics,
//     exportData
//   };
// };
// client/src/hooks/useWater.js
import { useState, useCallback } from 'react';
import api from '../services/api';

export const useWater = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getWaterFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('💧 Fetching water files...');
      const response = await api.get('/water/files');
      console.log('✅ Water files loaded:', response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error('❌ Error fetching water files:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const processWaterFile = useCallback(async (fileId) => {
    try {
      setLoading(true);
      setError(null);
      console.log('⚙️ Processing water file:', fileId);
      const response = await api.post(`/water/process/${fileId}`);
      console.log('✅ Water file processed:', response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error('❌ Error processing water file:', errorMsg);
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
      console.log('📊 Fetching water metrics for file:', fileId);
      const response = await api.get(`/water/metrics/${fileId}`);
      console.log('✅ Water metrics loaded:', response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error('❌ Error fetching water metrics:', errorMsg);
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
      console.log(`📥 Exporting water data as ${format} for file:`, fileId);
      const response = await api.get(`/water/export/${fileId}`, {
        params: { format },
        responseType: format === 'csv' ? 'blob' : 'json'
      });
      
      if (format === 'csv') {
        
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `water-data-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        console.log('✅ CSV download initiated');
      }
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message;
      console.error('❌ Error exporting water data:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  return {
    loading,
    error,
    getWaterFiles,
    processWaterFile,
    getMetrics,
    exportData
  };
};

export default useWater;