// client/src/hooks/useWidgets.js
import { useContext, useCallback } from 'react';
import { DataContext } from '../context/DataContext';

export const useWidgets = () => {
  const context = useContext(DataContext);
  
  if (!context) {
    throw new Error('useWidgets must be used within a DataProvider');
  }

  const {
    widgets,
    loading,
    error,
    createWidget,
    updateWidget,
    deleteWidget,
    updateWidgetLayout,
    csvData,
    refreshData
  } = context;

  // Calculate emissions from CSV data
  const calculateEmissions = useCallback((data) => {
    if (!data || data.length === 0) return null;

    let scope1Total = 0;
    let scope2Total = 0;
    let scope3Total = 0;

    data.forEach((row) => {
      Object.keys(row).forEach((key) => {
        const keyLower = key.toLowerCase().replace(/[^a-z0-9]/g, '');
        const value = parseFloat(row[key]) || 0;

        // Check for explicit scope columns
        if (keyLower.includes('ghgscope1') || keyLower.includes('scope1')) {
          scope1Total += value;
        } else if (keyLower.includes('ghgscope2') || keyLower.includes('scope2')) {
          scope2Total += value;
        } else if (keyLower.includes('ghgscope3') || keyLower.includes('scope3')) {
          scope3Total += value;
        } else {
          // SCOPE 1: Direct emissions
          if (
            keyLower.includes('diesel') ||
            keyLower.includes('petrol') ||
            keyLower.includes('gasoline') ||
            keyLower.includes('naturalgas') ||
            keyLower.includes('ng') ||
            keyLower.includes('lpg')
          ) {
            scope1Total += value;
          }
          // SCOPE 2: Purchased electricity/energy
          else if (
            keyLower.includes('electricity') ||
            keyLower.includes('reb') ||
            keyLower.includes('grid')
          ) {
            scope2Total += value;
          }
          // SCOPE 3: Other indirect
          else if (
            keyLower.includes('waste') ||
            keyLower.includes('transport') ||
            keyLower.includes('chemical')
          ) {
            scope3Total += value;
          }
        }
      });
    });

    return {
      scope1: scope1Total / 1000, // Convert to tons
      scope2: scope2Total / 1000,
      scope3: scope3Total / 1000,
      total: (scope1Total + scope2Total + scope3Total) / 1000
    };
  }, []);

  // Update widget values based on CSV data
  const updateWidgetsFromCSV = useCallback(
    async (data) => {
      const emissions = calculateEmissions(data);
      if (!emissions) return;

      const updates = [
        { id: 'scope1', value: Math.round(emissions.scope1) },
        { id: 'scope2', value: Math.round(emissions.scope2) },
        { id: 'scope3', value: Math.round(emissions.scope3) },
        { id: 'total', value: emissions.total.toFixed(2) }
      ];

      for (const update of updates) {
        const widget = widgets.find(w => w.i === update.id);
        if (widget) {
          await updateWidget(widget.id, { value: update.value });
        }
      }
    },
    [widgets, calculateEmissions, updateWidget]
  );

  // Handle widget layout changes
  const handleLayoutChange = useCallback(
    async (layout) => {
      await updateWidgetLayout(layout);
    },
    [updateWidgetLayout]
  );

  // Handle widget color change
  const handleColorChange = useCallback(
    async (id, color) => {
      await updateWidget(id, { color });
    },
    [updateWidget]
  );

  // Handle widget rename
  const handleRename = useCallback(
    async (id, title) => {
      await updateWidget(id, { title });
    },
    [updateWidget]
  );

  return {
    widgets,
    loading,
    error,
    createWidget,
    updateWidget,
    deleteWidget,
    updateWidgetLayout,
    calculateEmissions,
    updateWidgetsFromCSV,
    handleLayoutChange,
    handleColorChange,
    handleRename,
    csvData,
    refreshData
  };
};

export default useWidgets;