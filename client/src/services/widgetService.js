// client/src/services/widgetService.js
import api from './api';

export const widgetService = {
  // Get all widgets
  getAllWidgets: async () => {
    try {
      const response = await api.get('/widgets');
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Create new widget
  createWidget: async (widgetData) => {
    try {
      const response = await api.post('/widgets', widgetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update widget
  updateWidget: async (id, widgetData) => {
    try {
      const response = await api.put(`/widgets/${id}`, widgetData);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Delete widget
  deleteWidget: async (id) => {
    try {
      const response = await api.delete(`/widgets/${id}`);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Update widget position
  updateWidgetPosition: async (id, position) => {
    try {
      const response = await api.put(`/widgets/${id}/position`, position);
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Calculate emissions
  calculateEmissions: async (csvData) => {
    try {
      const response = await api.post('/widgets/calculate-emissions', { csvData });
      return response.data;
    } catch (error) {
      throw error.response?.data || error;
    }
  },

  // Local storage fallback methods
  getLocalWidgets: () => {
    const widgets = localStorage.getItem('esg-widgets');
    return widgets ? JSON.parse(widgets) : [
      { i: 'scope1', x: 0, y: 0, w: 3, h: 2, title: 'Scope 1 Emissions', value: 0, unit: 't CO₂e', color: '#EF4444' },
      { i: 'scope2', x: 3, y: 0, w: 3, h: 2, title: 'Scope 2 Emissions', value: 0, unit: 't CO₂e', color: '#3B82F6' },
      { i: 'scope3', x: 6, y: 0, w: 3, h: 2, title: 'Scope 3 Emissions', value: 0, unit: 't CO₂e', color: '#10B981' },
      { i: 'total', x: 9, y: 0, w: 3, h: 2, title: 'Total Emissions', value: 0, unit: 't CO₂e', color: '#8B5CF6' },
     // { i: 'carbon-scope1', x: 0, y: 2, w: 3, h: 2, title: 'Carbon Emission', value: 0, unit: 't CO₂e', color: '#DC2626' },
     // { i: 'carbon-scope2', x: 3, y: 2, w: 3, h: 2, title: 'Carbon Emission', value: 0, unit: 't CO₂e', color: '#2563EB' },
     // { i: 'carbon-scope3', x: 6, y: 2, w: 3, h: 2, title: 'Carbon Emission', value: 0, unit: 't CO₂e', color: '#059669' },
     // { i: 'carbon-total', x: 9, y: 2, w: 3, h: 2, title: 'Total Carbon', value: 0, unit: 't CO₂e', color: '#7C3AED' },
    ];
  },

  saveLocalWidgets: (widgets) => {
    localStorage.setItem('esg-widgets', JSON.stringify(widgets));
  }
};

export default widgetService;