// client/src/services/kpiService.js
import api from './api';
import { parseFormula } from '../utils/formulaParser';

export const kpiService = {
  // Get all KPIs
  getAllKPIs: async () => {
    try {
      const response = await api.get('/kpi');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new KPI
  createKPI: async (kpiData) => {
    try {
      const response = await api.post('/kpi', kpiData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update KPI
  updateKPI: async (id, kpiData) => {
    try {
      const response = await api.put(`/kpi/${id}`, kpiData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete KPI
  deleteKPI: async (id) => {
    try {
      const response = await api.delete(`/kpi/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Calculate KPI locally
  calculateKPI: (formula, selectedFiles, customValues) => {
    try {
      const result = parseFormula(formula, selectedFiles, customValues);
      return { success: true, result };
    } catch (error) {
      return { success: false, error: error.message };
    }
  },

  // Calculate KPI via API
  calculateKPIAPI: async (kpiData) => {
    try {
      const response = await api.post('/kpi/calculate', kpiData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Local storage fallback methods
  getLocalKPIs: () => {
    const kpis = localStorage.getItem('esg-kpis');
    return kpis ? JSON.parse(kpis) : [];
  },

  saveLocalKPIs: (kpis) => {
    localStorage.setItem('esg-kpis', JSON.stringify(kpis));
  }
};

export default kpiService;