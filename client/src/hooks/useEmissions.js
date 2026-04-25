// // client/src/hooks/useEmissions.js
// import { useState } from 'react';
// import api from '../services/api';

// export const useEmissions = () => {
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

//   const getEmissionsFiles = async () => {
//     setLoading(true);
//     try {
//       const response = await api.get('/emissions/files');
//       return response.data;
//     } catch (err) {
//       setError(err.message);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const processEmissionsFile = async (fileId) => {
//     setLoading(true);
//     try {
//       const response = await api.post(`/emissions/process/${fileId}`);
//       return response.data;
//     } catch (err) {
//       setError(err.message);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   const getMetrics = async (fileId) => {
//     setLoading(true);
//     try {
//       const response = await api.get(`/emissions/metrics/${fileId}`);
//       return response.data;
//     } catch (err) {
//       setError(err.message);
//       throw err;
//     } finally {
//       setLoading(false);
//     }
//   };

//   // ... use energy er moto more models can be added

//   return {
//     loading,
//     error,
//     getEmissionsFiles,
//     processEmissionsFile,
//     getMetrics,
//     // ...
//   };
// };

// client/src/hooks/useEmissions.js
import { useState, useCallback, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import api from '../services/api'; 

export const useEmissions = (initialFileId = null) => { 

  const [selectedFileId, setSelectedFileId] = useState(initialFileId);
  const [emissionsFiles, setEmissionsFiles] = useState([]);       
  const [metrics, setMetrics] = useState(null);                  
  const [processedData, setProcessedData] = useState(null);       
  const [loading, setLoading] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState(null);


  const fetchEmissionsFiles = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const res = await api.get('/emissions/files');
      
      if (res.data.success) {
        setEmissionsFiles(res.data.files || []);
        //toast.success(`Loaded ${res.data.count} emissions files`);
      } else {
        throw new Error(res.data.message || 'Failed to load files');
      }
    } catch (err) {
      console.error('[useEmissions] fetchEmissionsFiles error:', err);
      const msg = err.response?.data?.message || err.message || 'Could not load emissions files';
      setError(msg);
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  
  const fetchMetrics = useCallback(async (fileId) => {
    if (!fileId) return;

    try {
      setLoading(true);
      setError(null);

      const res = await api.get(`/emissions/metrics/${fileId}`);

      if (res.data.success) {
        setMetrics(res.data.data);
        setSelectedFileId(fileId);
      
        if (res.data.data?.monthlyData) {
          setProcessedData(res.data.data);
        }
      } else {
        throw new Error(res.data.message || 'Failed to load metrics');
      }
    } catch (err) {
      console.error('[useEmissions] fetchMetrics error:', err);
      const msg = err.response?.data?.message || 'Could not load metrics';
      setError(msg);
      toast.error(msg);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const processFile = useCallback(async (fileId) => {
    if (!fileId) return;

    try {
      setProcessing(true);
      setError(null);
      toast.loading('Processing emissions data...', { id: 'process' });

      const res = await api.post(`/emissions/process/${fileId}`);

      if (res.data.success) {
        setProcessedData(res.data.data);
        toast.success('Emissions data processed successfully!', { id: 'process' });
        
        
        await fetchMetrics(fileId);
      } else {
        throw new Error(res.data.message || 'Processing failed');
      }
    } catch (err) {
      console.error('[useEmissions] processFile error:', err);
      const msg = err.response?.data?.message || err.message || 'Processing failed';
      setError(msg);
      toast.error(msg, { id: 'process' });
    } finally {
      setProcessing(false);
    }
  }, [fetchMetrics]);

  useEffect(() => {
    fetchEmissionsFiles();
  }, [fetchEmissionsFiles]);

  useEffect(() => {
    if (initialFileId && !metrics && !processedData) {
      fetchMetrics(initialFileId);
    }
  }, );

  
  return {
  
    emissionsFiles,
    selectedFileId,
    metrics,
    processedData,          
    
    loading,
    processing,
    error,
    fetchEmissionsFiles,
    processFile,
    fetchMetrics,
    setSelectedFileId,
    refresh: fetchEmissionsFiles,
    isProcessed: !!processedData || !!metrics,
  };
};