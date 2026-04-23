// // client/src/context/DataContext.js
// import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
// import api from '../services/api';
// import { useAuth } from './AuthContext';

// export const DataContext = createContext(null);

// export const DataProvider = ({ children }) => {
//   const { isAuthenticated, user, loading: authLoading } = useAuth();

//   const [files, setFiles] = useState([]);
//   const [widgets, setWidgets] = useState([]);
//   const [kpis, setKpis] = useState([]);
//   const [csvData, setCsvData] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

  
//   const isFetchingRef = useRef(false);
//   const fetchAllData = useCallback(async () => {
//     if (isFetchingRef.current || loading) {
//       console.log('[fetchAllData] Skipped - already fetching');
//       return;
//     }

//     isFetchingRef.current = true;
//     setLoading(true);
//     setError(null);

//     console.log('[fetchAllData] Started');

//     try {
//       console.log('[fetchAllData] Starting /files');
//       const filesPromise = api.get('/files').catch(err => {
//         console.error('[fetchAllData] /files failed:', err);
//         return { data: { files: [] } };
//       });

//       console.log('[fetchAllData] Starting /widgets');
//       const widgetsPromise = api.get('/widgets').catch(err => {
//         console.error('[fetchAllData] /widgets failed:', err);
//         return { data: { widgets: [] } };
//       });

//       console.log('[fetchAllData] Starting /kpi');
//       const kpiPromise = api.get('/kpi').catch(err => {
//         console.error('[fetchAllData] /kpi failed:', err);
//         return { data: { kpis: [] } };
//       });

//       const [filesRes, widgetsRes, kpisRes] = await Promise.all([
//         filesPromise,
//         widgetsPromise,
//         kpiPromise
//       ]);

//       console.log('[fetchAllData] All done – setting states');

//       setFiles(filesRes.data.files || filesRes.data || []);
//       setWidgets(widgetsRes.data.widgets || widgetsRes.data || []);
//       setKpis(kpisRes.data.kpis || kpisRes.data || []);
//     } catch (err) {
//       console.error('fetchAllData overall failed:', err);
//       setError(`Failed to load data: ${err.message}`);
//     } finally {
//       console.log('[fetchAllData] Finally – loading false');
//       setLoading(false);
//       isFetchingRef.current = false;
//     }
//   }, [isAuthenticated, authLoading]);

//   // const fetchAllData = useCallback(async () => {
//   //   if (isFetchingRef.current || loading) {
//   //     console.log('[fetchAllData] Skipped - already fetching');
//   //     return;
//   //   }

//   //   isFetchingRef.current = true;
//   //   setLoading(true);
//   //   setError(null);

//   //   console.log('[fetchAllData] Started – auth status:', {
//   //     isAuth: isAuthenticated,
//   //     authLoading,
//   //     isActive: user?.isActive,
//   //     role: user?.role
//   //   });

//   //   try {
      
//   //     const timeout = new Promise((_, reject) =>
//   //       setTimeout(() => reject(new Error("Request timeout (15s)")), 15000)
//   //     );

//   //     const [filesRes, widgetsRes, kpisRes] = await Promise.race([
//   //       Promise.all([
//   //         api.get('/files').catch(() => ({ data: { files: [] } })),
//   //         api.get('/widgets').catch(() => ({ data: { widgets: [] } })),
//   //         api.get('/kpi').catch(() => ({ data: { kpis: [] } }))
//   //       ]),
//   //       timeout
//   //     ]);
//   //     setFiles(filesRes.data.files || filesRes.data || []);
//   //     setWidgets(widgetsRes.data.widgets || widgetsRes.data || []);
//   //     setKpis(kpisRes.data.kpis || kpisRes.data || []);
//   //   } catch (err) {
//   //     console.error('fetchAllData failed:', err);
//   //     setError(`Failed to load data: ${err.message}`);
//   //   } finally {
//   //     setLoading(false);
//   //     isFetchingRef.current = false;
//   //   }
//   // }, [isAuthenticated, authLoading]);

//     useEffect(() => {
//       if (!isAuthenticated || authLoading) {
//         setFiles([]);
//         setWidgets([]);
//         setKpis([]);
//         setCsvData(null);
//         setError(null);
//         return;
//       }

//       // Conditional check without depending on user object reference
//       if (user && user.isActive && user.role !== 'pending') {
//         fetchAllData();
//       }
//     }, [isAuthenticated, authLoading, fetchAllData]);

//   // CRUD operations 
//   const createFile = async (fileData) => {
//     try {
//       const response = await api.post('/files', fileData);
//       await fetchAllData();
//       return { success: true, file: response.data.file };
//     } catch (err) {
//       return { success: false, error: err.response?.data?.message || 'Failed to create file' };
//     }
//   };

//   const updateFile = async (id, fileData) => {
//     try {
//       const response = await api.put(`/files/${id}`, fileData);
//       await fetchAllData();
//       return { success: true, file: response.data.file };
//     } catch (err) {
//       return { success: false, error: err.response?.data?.message || 'Failed to update file' };
//     }
//   };

//   const deleteFile = async (id) => {
//     try {
//       await api.delete(`/files/${id}`);
//       await fetchAllData();
//       return { success: true };
//     } catch (err) {
//       return { success: false, error: err.response?.data?.message || 'Failed to delete file' };
//     }
//   };

//   const createFolder = async (folderData) => {
//     try {
//       const response = await api.post('/files/folder', folderData);
//       await fetchAllData();
//       return { success: true, folder: response.data.folder };
//     } catch (err) {
//       return { success: false, error: err.response?.data?.message || 'Failed to create folder' };
//     }
//   };

//   const uploadCSV = async (file, folderId = null) => {
//     try {
//       const formData = new FormData();
//       formData.append('file', file);
//       if (folderId) formData.append('folderId', folderId);

//       const response = await api.post('/files/upload', formData, {
//         headers: { 'Content-Type': 'multipart/form-data' }
//       });

//       await fetchAllData();
//       return { success: true, file: response.data.file };
//     } catch (err) {
//       return { success: false, error: err.response?.data?.message || 'Failed to upload file' };
//     }
//   };
//   const fetchUploadedFiles = useCallback(async () => {
//     try {
//       const response = await api.get('/files');
//       setFiles(response.data.files || []);
//       console.log('[DataContext] Files fetched:', response.data.files?.length);
//     } catch (error) {
//       console.error('Error fetching files:', error);
//     }
//   }, []);



//   const createWidget = async (widgetData) => {
//     try {
//       const response = await api.post('/widgets', widgetData);
//       await fetchAllData();
//       return { success: true, widget: response.data.widget };
//     } catch (err) {
//       return { success: false, error: err.response?.data?.message || 'Failed to create widget' };
//     }
//   };

//   const updateWidget = async (id, widgetData) => {
//     try {
//       const response = await api.put(`/widgets/${id}`, widgetData);
//       await fetchAllData();
//       return { success: true, widget: response.data.widget };
//     } catch (err) {
//       return { success: false, error: err.response?.data?.message || 'Failed to update widget' };
//     }
//   };

//   const deleteWidget = async (id) => {
//     try {
//       await api.delete(`/widgets/${id}`);
//       await fetchAllData();
//       return { success: true };
//     } catch (err) {
//       return { success: false, error: err.response?.data?.message || 'Failed to delete widget' };
//     }
//   };

//   const updateWidgetLayout = async (layout) => {
//     try {
//       const response = await api.put('/widgets/layout', { layout });
//       await fetchAllData();
//       return { success: true };
//     } catch (err) {
//       return { success: false, error: err.response?.data?.message || 'Failed to update layout' };
//     }
//   };

//   const createKPI = async (kpiData) => {
//     try {
//       const response = await api.post('/kpi', kpiData);
//       await fetchAllData();
//       return { success: true, kpi: response.data.kpi };
//     } catch (err) {
//       return { success: false, error: err.response?.data?.message || 'Failed to create KPI' };
//     }
//   };

//   const deleteKPI = async (id) => {
//     try {
//       await api.delete(`/kpi/${id}`);
//       await fetchAllData();
//       return { success: true };
//     } catch (err) {
//       return { success: false, error: err.response?.data?.message || 'Failed to delete KPI' };
//     }
//   };

//   const calculateKPI = async (formula, fileIds, customValues) => {
//     try {
//       const response = await api.post('/kpi/calculate', {
//         formula,
//         fileIds,
//         customValues
//       });
//       return { success: true, result: response.data.result };
//     } catch (err) {
//       return { success: false, error: err.response?.data?.message || 'Calculation failed' };
//     }
//   };

//   const refreshData = () => {
//     if (isAuthenticated && !authLoading && user?.isActive && user?.role !== 'pending') {
//       fetchAllData();
//     }
//   };

//   const value = {
//     files,
//     widgets,
//     kpis,
//     csvData,
//     loading,
//     error,
//     createFile,
//     updateFile,
//     deleteFile,
//     createFolder,
//     uploadCSV,
//     fetchUploadedFiles,
//     createWidget,
//     updateWidget,
//     deleteWidget,
//     updateWidgetLayout,
//     createKPI,
//     deleteKPI,
//     calculateKPI,
//     refreshData
//   };

//   return (
//     <DataContext.Provider value={value}>
//       {children}
//     </DataContext.Provider>
//   );
// };

// export const useData = () => {
//   const context = useContext(DataContext);
//   if (!context) {
//     throw new Error('useData must be used within a DataProvider');
//   }
//   return context;
// };

// client/src/context/DataContext.js
import React, { createContext, useState, useEffect, useContext, useCallback, useRef } from 'react';
import api from '../services/api';
import { useAuth } from './AuthContext';

export const DataContext = createContext(null);

export const DataProvider = ({ children }) => {
  const { isAuthenticated, user, loading: authLoading } = useAuth();

  const [files, setFiles] = useState([]);
  const [widgets, setWidgets] = useState([]);
  const [kpis, setKpis] = useState([]);
  const [csvData, setCsvData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Track if we've done initial fetch
  const hasInitializedRef = useRef(false);
  const isFetchingRef = useRef(false);
  const fetchTimeoutRef = useRef(null);

  // Memoized values to prevent unnecessary re-renders
  const isUserActive = user?.isActive === true;
  const userRole = user?.role;
  const userId = user?._id || user?.id;

  const fetchAllData = useCallback(async () => {
    // Prevent concurrent fetches
    if (isFetchingRef.current) {
      console.log('[DataContext] ⏭️ Skipped - already fetching');
      return;
    }

    // Don't fetch if not authenticated or user not active
    if (!isAuthenticated || authLoading || !isUserActive || userRole === 'pending') {
      console.log('[DataContext] ⏭️ Skipped - not ready:', {
        isAuthenticated,
        authLoading,
        isUserActive,
        userRole
      });
      return;
    }

    isFetchingRef.current = true;
    setLoading(true);
    setError(null);

    console.log('[DataContext] 🔄 Fetching all data...');

    try {
      // Add timeout protection
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s timeout

      const [filesRes, widgetsRes, kpisRes] = await Promise.all([
        api.get('/files', { signal: controller.signal }).catch(err => {
          console.error('[DataContext] ❌ /files failed:', err.message);
          return { data: { files: [] } };
        }),
        api.get('/widgets', { signal: controller.signal }).catch(err => {
          console.error('[DataContext] ❌ /widgets failed:', err.message);
          return { data: { widgets: [] } };
        }),
        api.get('/kpi', { signal: controller.signal }).catch(err => {
          console.error('[DataContext] ❌ /kpi failed:', err.message);
          return { data: { kpis: [] } };
        })
      ]);

      clearTimeout(timeoutId);

      console.log('[DataContext] ✅ Data fetched successfully:', {
        files: filesRes.data.files?.length || 0,
        widgets: widgetsRes.data.widgets?.length || 0,
        kpis: kpisRes.data.kpis?.length || 0
      });

      setFiles(filesRes.data.files || []);
      setWidgets(widgetsRes.data.widgets || []);
      setKpis(kpisRes.data.kpis || []);
      
      hasInitializedRef.current = true;
      
    } catch (err) {
      if (err.name === 'AbortError') {
        console.error('[DataContext] ⏱️ Request timeout');
        setError('Request timeout - please try again');
      } else {
        console.error('[DataContext] ❌ Fetch error:', err);
        setError(`Failed to load data: ${err.message}`);
      }
    } finally {
      setLoading(false);
      isFetchingRef.current = false;
      console.log('[DataContext] ✨ Fetch cycle complete');
    }
  }, [isAuthenticated, authLoading, isUserActive, userRole]); // Only depend on primitive values

  // Initial data fetch - runs once when user becomes active
  useEffect(() => {
    // Clear state if not authenticated
    if (!isAuthenticated || authLoading) {
      console.log('[DataContext] 🧹 Clearing state - not authenticated');
      setFiles([]);
      setWidgets([]);
      setKpis([]);
      setCsvData(null);
      setError(null);
      hasInitializedRef.current = false;
      return;
    }

    // Only fetch if user is active and we haven't initialized yet
    if (isUserActive && userRole !== 'pending' && !hasInitializedRef.current) {
      console.log('[DataContext] 🚀 Initial fetch triggered for user:', userId);
      
      // Debounce the fetch
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
      
      fetchTimeoutRef.current = setTimeout(() => {
        fetchAllData();
      }, 300); // 300ms debounce
    }

    return () => {
      if (fetchTimeoutRef.current) {
        clearTimeout(fetchTimeoutRef.current);
      }
    };
  }, [isAuthenticated, authLoading, isUserActive, userRole, userId, fetchAllData]);

  // CRUD operations with automatic refresh
  const createFile = async (fileData) => {
    try {
      const response = await api.post('/files', fileData);
      // Manual state update instead of full refetch
      setFiles(prev => [...prev, response.data.file]);
      return { success: true, file: response.data.file };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to create file' };
    }
  };

  const updateFile = async (id, fileData) => {
    try {
      const response = await api.put(`/files/${id}`, fileData);
      // Manual state update
      setFiles(prev => prev.map(f => f._id === id ? response.data.file : f));
      return { success: true, file: response.data.file };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update file' };
    }
  };

  const deleteFile = async (id) => {
    try {
      await api.delete(`/files/${id}`);
      // Manual state update
      setFiles(prev => prev.filter(f => f._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to delete file' };
    }
  };

  const createFolder = async (folderData) => {
    try {
      const response = await api.post('/files/folder', folderData);
      setFiles(prev => [...prev, response.data.folder]);
      return { success: true, folder: response.data.folder };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to create folder' };
    }
  };

  const uploadCSV = async (file, folderId = null) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (folderId) formData.append('folderId', folderId);

      const response = await api.post('/files/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setFiles(prev => [...prev, response.data.file]);
      return { success: true, file: response.data.file };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to upload file' };
    }
  };

  const fetchUploadedFiles = useCallback(async () => {
    if (isFetchingRef.current) {
      console.log('[fetchUploadedFiles] ⏭️ Skipped - already fetching');
      return;
    }

    try {
      isFetchingRef.current = true;
      const response = await api.get('/files');
      setFiles(response.data.files || []);
      console.log('[fetchUploadedFiles] ✅ Files fetched:', response.data.files?.length);
    } catch (error) {
      console.error('[fetchUploadedFiles] ❌ Error:', error);
    } finally {
      isFetchingRef.current = false;
    }
  }, []);

  // Widget CRUD
  const createWidget = async (widgetData) => {
    try {
      const response = await api.post('/widgets', widgetData);
      setWidgets(prev => [...prev, response.data.widget]);
      return { success: true, widget: response.data.widget };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to create widget' };
    }
  };

  const updateWidget = async (id, widgetData) => {
    try {
      const response = await api.put(`/widgets/${id}`, widgetData);
      setWidgets(prev => prev.map(w => (w._id === id || w.id === id) ? response.data.widget : w));
      return { success: true, widget: response.data.widget };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update widget' };
    }
  };

  const deleteWidget = async (id) => {
    try {
      await api.delete(`/widgets/${id}`);
      setWidgets(prev => prev.filter(w => w._id !== id && w.id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to delete widget' };
    }
  };

  const updateWidgetLayout = async (layout) => {
    try {
      await api.put('/widgets/layout', { layout });
      // Optimistic update
      setWidgets(prev => {
        return prev.map(widget => {
          const layoutItem = layout.find(l => l.i === widget.i);
          return layoutItem ? { ...widget, ...layoutItem } : widget;
        });
      });
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to update layout' };
    }
  };

  // KPI CRUD
  const createKPI = async (kpiData) => {
    try {
      const response = await api.post('/kpi', kpiData);
      setKpis(prev => [...prev, response.data.kpi]);
      return { success: true, kpi: response.data.kpi };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to create KPI' };
    }
  };

  const deleteKPI = async (id) => {
    try {
      await api.delete(`/kpi/${id}`);
      setKpis(prev => prev.filter(k => k._id !== id));
      return { success: true };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Failed to delete KPI' };
    }
  };

  const calculateKPI = async (formula, fileIds, customValues) => {
    try {
      const response = await api.post('/kpi/calculate', {
        formula,
        fileIds,
        customValues
      });
      return { success: true, result: response.data.result };
    } catch (err) {
      return { success: false, error: err.response?.data?.message || 'Calculation failed' };
    }
  };

  // Manual refresh - only call when explicitly needed
  const refreshData = useCallback(() => {
    console.log('[refreshData] 🔄 Manual refresh requested');
    if (isAuthenticated && !authLoading && isUserActive && userRole !== 'pending') {
      fetchAllData();
    }
  }, [isAuthenticated, authLoading, isUserActive, userRole, fetchAllData]);

  const value = {
    files,
    widgets,
    kpis,
    csvData,
    loading,
    error,
    createFile,
    updateFile,
    deleteFile,
    createFolder,
    uploadCSV,
    fetchUploadedFiles,
    createWidget,
    updateWidget,
    deleteWidget,
    updateWidgetLayout,
    createKPI,
    deleteKPI,
    calculateKPI,
    refreshData
  };

  return (
    <DataContext.Provider value={value}>
      {children}
    </DataContext.Provider>
  );
};

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error('useData must be used within a DataProvider');
  }
  return context;
};