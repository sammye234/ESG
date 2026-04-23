import { useState } from 'react';
import api from '../services/api';

export const useEnergy = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getEnergyFiles = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔍 Fetching energy files...');
      const response = await api.get('/energy/files');
      console.log('✅ Energy files loaded:', response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch energy files';
      console.error('❌ Error fetching energy files:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const processEnergyFile = async (fileId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('⚙️ Processing energy file:', fileId);
      const response = await api.post(`/energy/process/${fileId}`);
      console.log('✅ File processed:', response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to process file';
      console.error('❌ Error processing file:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getMetrics = async (fileId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('📊 Fetching metrics for file:', fileId);
      const response = await api.get(`/energy/metrics/${fileId}`);
      console.log('✅ Metrics loaded:', response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch metrics';
      console.error('❌ Error fetching metrics:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getDashboardSummary = async () => {
    setLoading(true);
    setError(null);
    try {
      console.log('📈 Fetching dashboard summary...');
      const response = await api.get('/energy/dashboard-summary');
      console.log('✅ Dashboard summary loaded:', response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch summary';
      console.error('❌ Error fetching summary:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const compareDatasets = async (fileIds) => {
    setLoading(true);
    setError(null);
    try {
      console.log('🔀 Comparing datasets:', fileIds);
      const response = await api.post('/energy/compare', { fileIds });
      console.log('✅ Comparison complete:', response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to compare datasets';
      console.error('❌ Error comparing datasets:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getTrends = async (fileId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('📉 Fetching trends for file:', fileId);
      const response = await api.get(`/energy/trends/${fileId}`);
      console.log('✅ Trends loaded:', response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch trends';
      console.error('❌ Error fetching trends:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const getRecommendations = async (fileId) => {
    setLoading(true);
    setError(null);
    try {
      console.log('💡 Fetching recommendations for file:', fileId);
      const response = await api.get(`/energy/recommendations/${fileId}`);
      console.log('✅ Recommendations loaded:', response.data);
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to fetch recommendations';
      console.error('❌ Error fetching recommendations:', errorMsg);
      setError(errorMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const exportData = async (fileId, format = 'json') => {
    try {
      console.log(`📥 Exporting data as ${format} for file:`, fileId);
      const response = await api.get(
        `/energy/export/${fileId}?format=${format}`,
        {
          responseType: format === 'csv' ? 'blob' : 'json'
        }
      );
      
      if (format === 'csv') {
        // Create download link for CSV
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `energy-data-${Date.now()}.csv`);
        document.body.appendChild(link);
        link.click();
        link.remove();
        console.log('✅ CSV download initiated');
      }
      
      return response.data;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Failed to export data';
      console.error('❌ Error exporting data:', errorMsg);
      setError(errorMsg);
      throw err;
    }
  };

  return {
    loading,
    error,
    getEnergyFiles,
    processEnergyFile,
    getMetrics,
    getDashboardSummary,
    compareDatasets,
    getTrends,
    getRecommendations,
    exportData
  };
};