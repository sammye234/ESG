// // client/src/hooks/useFiles.js 


// import { useState, useEffect, useCallback } from 'react';
// import { useAuth } from '../context/AuthContext';
// import api from '../services/api';

// const useFiles = (folderId = null) => {
//   const { user, isAuthenticated, loading: authLoading } = useAuth();
//   const [files, setFiles] = useState([]);
//   const [folders, setFolders] = useState([]);
//   const [allFiles, setAllFiles] = useState([]);
//   const [loading, setLoading] = useState(false);
//   const [error, setError] = useState(null);

  
//   const fetchFiles = useCallback(async () => {
//     // Wait for auth to load
//     if (authLoading) {
//       console.log('⏳ [useFiles] Waiting for auth to load...');
//       return;
//     }

//     // Block if not authenticated
//     if (!isAuthenticated || !user) {
//       console.log('❌ [useFiles] Not authenticated');
//       setFiles([]);
//       setFolders([]);
//       setAllFiles([]);
//       return;
//     }

    
//     if (user.role === 'pending' || user.role === 'rejected') {
//       console.log('❌ [useFiles] User pending/rejected');
//       setFiles([]);
//       setFolders([]);
//       setAllFiles([]);
//       return;
//     }

//     if (!user.isActive) {
//       console.log('❌ [useFiles] User not active');
//       setFiles([]);
//       setFolders([]);
//       setAllFiles([]);
//       return;
//     }

//     console.log('✅ [useFiles] Fetching files for:', {
//       email: user.email,
//       role: user.role,
//       isActive: user.isActive
//     });

//     try {
//       setLoading(true);
//       setError(null);

//       const endpoint = folderId ? `/files/folder/${folderId}` : '/files';
//       console.log('📡 [useFiles] Calling:', endpoint);

//       const response = await api.get(endpoint);
      
//       console.log('📊 [useFiles] Response:', {
//         success: response.data.success,
//         count: response.data.count,
//         files: response.data.files?.length
//       });

//       if (response.data.success) {
//         const fetchedFiles = response.data.files || [];
        
//         // Separate files and folders
//         const filesList = fetchedFiles.filter(f => f.type !== 'folder');
//         const foldersList = fetchedFiles.filter(f => f.type === 'folder');

//         console.log('📁 [useFiles] Processed:', {
//           files: filesList.length,
//           folders: foldersList.length
//         });

//         setFiles(filesList);
//         setFolders(foldersList);
//         setAllFiles(fetchedFiles);
//       } else {
//         console.warn('⚠️ [useFiles] API returned success: false');
//         setFiles([]);
//         setFolders([]);
//         setAllFiles([]);
//       }
//     } catch (err) {
//       console.error('❌ [useFiles] Error fetching files:', err);
//       console.error('Error details:', {
//         status: err.response?.status,
//         message: err.response?.data?.message || err.message
//       });
//       setError(err.response?.data?.message || err.message);
//       setFiles([]);
//       setFolders([]);
//       setAllFiles([]);
//     } finally {
//       setLoading(false);
//     }
//   }, [isAuthenticated, authLoading, user, folderId]);

//   // Fetch files when dependencies change
//   useEffect(() => {
//     console.log('🔄 [useFiles] Effect triggered');
//     fetchFiles();
//   }, [fetchFiles]);

//   // Upload file function
//   const uploadFile = async (file, currentFolderId = null, businessUnit = null) => {
//     try {
//       console.log('📤 [useFiles] Uploading file:', {
//         name: file.name,
//         folderId: currentFolderId,
//         businessUnit
//       });

//       const formData = new FormData();
//       formData.append('file', file);
      
//       if (currentFolderId) {
//         formData.append('folderId', currentFolderId);
//       }
      
//       //  HQ users MUST specify which BU they're uploading for
//       if (businessUnit) {
//         formData.append('businessUnit', businessUnit);
//       } else if (user.role === 'hq_admin' || user.role === 'hq_manager') {
//         console.warn('⚠️ [useFiles] HQ user uploading without BU specified');
//         // Default to HQ if not specified
//         formData.append('businessUnit', 'HQ');
//       }

//       const response = await api.post('/files/upload', formData, {
//         headers: {
//           'Content-Type': 'multipart/form-data',
//         },
//       });

//       console.log('✅ [useFiles] Upload successful:', response.data);

//       // Refresh file list
//       await fetchFiles();

//       return response.data;
//     } catch (err) {
//       console.error('❌ [useFiles] Upload error:', err);
//       throw err;
//     }
//   };

//   // Create folder function
//   const createFolder = async (folderName, currentFolderId = null, businessUnit = null) => {
//     try {
//       console.log('📁 [useFiles] Creating folder:', {
//         name: folderName,
//         parentId: currentFolderId,
//         businessUnit
//       });

//       const payload = {
//         folderName,
//         parentId: currentFolderId,
//       };

//       // Add businessUnit if specified
//       if (businessUnit) {
//         payload.businessUnit = businessUnit;
//       } else if (user.role === 'hq_admin' || user.role === 'hq_manager') {
//         payload.businessUnit = 'HQ';
//       }

//       const response = await api.post('/files/folder', payload);

//       console.log('✅ [useFiles] Folder created:', response.data);

//       // Refresh file list
//       await fetchFiles();

//       return response.data;
//     } catch (err) {
//       console.error('❌ [useFiles] Create folder error:', err);
//       throw err;
//     }
//   };

//   // Delete file/folder function
//   const deleteFile = async (fileId) => {
//     try {
//       console.log('🗑️ [useFiles] Deleting file:', fileId);

//       const response = await api.delete(`/files/${fileId}`);

//       console.log('✅ [useFiles] Delete successful');

//       // Refresh file list
//       await fetchFiles();

//       return response.data;
//     } catch (err) {
//       console.error('❌ [useFiles] Delete error:', err);
//       throw err;
//     }
//   };
//   const downloadFile = async (fileId, fileName) => {
//     try {
//       const response = await api.get(`/files/${fileId}/download`, {
//         responseType: 'blob'
//       });
      
//       const url = window.URL.createObjectURL(new Blob([response.data]));
//       const link = document.createElement('a');
//       link.href = url;
//       link.setAttribute('download', fileName);
//       document.body.appendChild(link);
//       link.click();
//       link.remove();
//       window.URL.revokeObjectURL(url);
      
//       return { success: true };
//     } catch (error) {
//       console.error('Download error:', error);
//       return { success: false, error: error.message };
//     }
//   };

//   return {
//     files,
//     folders,
//     allFiles,
//     loading,
//     error,
//     uploadFile,
//     createFolder,
//     deleteFile,
//     fetchFiles,
//     refreshFiles: fetchFiles,
//     downloadFile,
//   };
// };

// export default useFiles;

// client/src/hooks/useFiles.js 

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';

const useFiles = (folderId = null) => {
  const { user, isAuthenticated, loading: authLoading } = useAuth();
  const [files, setFiles] = useState([]);
  const [folders, setFolders] = useState([]);
  const [allFiles, setAllFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  
  const fetchFiles = useCallback(async () => {

    if (authLoading) {
      console.log('⏳ [useFiles] Waiting for auth to load...');
      return;
    }
    if (!isAuthenticated || !user) {
      console.log('❌ [useFiles] Not authenticated');
      setFiles([]);
      setFolders([]);
      setAllFiles([]);
      return;
    }

    
    if (user.role === 'pending' || user.role === 'rejected') {
      console.log('❌ [useFiles] User pending/rejected');
      setFiles([]);
      setFolders([]);
      setAllFiles([]);
      return;
    }

    if (!user.isActive) {
      console.log('❌ [useFiles] User not active');
      setFiles([]);
      setFolders([]);
      setAllFiles([]);
      return;
    }

    console.log('✅ [useFiles] Fetching files for:', {
      email: user.email,
      role: user.role,
      isActive: user.isActive
    });

    try {
      setLoading(true);
      setError(null);

      const endpoint = folderId ? `/files/folder/${folderId}` : '/files';
      console.log('📡 [useFiles] Calling:', endpoint);

      const response = await api.get(endpoint);
      
      console.log('📊 [useFiles] Response:', {
        success: response.data.success,
        count: response.data.count,
        files: response.data.files?.length
      });

      if (response.data.success) {
        const fetchedFiles = response.data.files || [];
        
        const filesList = fetchedFiles.filter(f => f.type !== 'folder');
        const foldersList = fetchedFiles.filter(f => f.type === 'folder');

        console.log('📁 [useFiles] Processed:', {
          files: filesList.length,
          folders: foldersList.length
        });

        setFiles(filesList);
        setFolders(foldersList);
        setAllFiles(fetchedFiles);
      } else {
        console.warn('⚠️ [useFiles] API returned success: false');
        setFiles([]);
        setFolders([]);
        setAllFiles([]);
      }
    } catch (err) {
      console.error('❌ [useFiles] Error fetching files:', err);
      console.error('Error details:', {
        status: err.response?.status,
        message: err.response?.data?.message || err.message
      });
      setError(err.response?.data?.message || err.message);
      setFiles([]);
      setFolders([]);
      setAllFiles([]);
    } finally {
      setLoading(false);
    }
  }, [isAuthenticated, authLoading, user, folderId]);

  useEffect(() => {
    console.log('🔄 [useFiles] Effect triggered');
    fetchFiles();
  }, [fetchFiles]);

  const uploadFile = async (file, currentFolderId = null, businessUnit = null) => {
    try {
      console.log('📤 [useFiles] Uploading file:', {
        name: file.name,
        folderId: currentFolderId,
        businessUnit
      });

      const formData = new FormData();
      formData.append('file', file);
      
      if (currentFolderId) {
        formData.append('folderId', currentFolderId);
      }
      if (businessUnit) {
        formData.append('businessUnit', businessUnit);
      } else if (user.role === 'hq_admin' || user.role === 'hq_manager') {
        console.warn('⚠️ [useFiles] HQ user uploading without BU specified');
        
        formData.append('businessUnit', 'HQ');
      }

      const response = await api.post('/files/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('✅ [useFiles] Upload successful:', response.data);

      
      await fetchFiles();

      return response.data;
    } catch (err) {
      console.error('❌ [useFiles] Upload error:', err);
      throw err;
    }
  };

  
  const createFolder = async (folderName, currentFolderId = null, businessUnit = null) => {
    try {
      console.log('📁 [useFiles] Creating folder:', {
        name: folderName,
        parentId: currentFolderId,
        businessUnit
      });

      const payload = {
        folderName,
        parentId: currentFolderId,
      };

      
      if (businessUnit) {
        payload.businessUnit = businessUnit;
      } else if (user.role === 'hq_admin' || user.role === 'hq_manager') {
        payload.businessUnit = 'HQ';
      }

      const response = await api.post('/files/folder', payload);

      console.log('✅ [useFiles] Folder created:', response.data);

      
      await fetchFiles();

      return response.data;
    } catch (err) {
      console.error('❌ [useFiles] Create folder error:', err);
      throw err;
    }
  };

  
  const deleteFile = async (fileId) => {
    try {
      console.log('🗑️ [useFiles] Deleting file:', fileId);

      const response = await api.delete(`/files/${fileId}`);

      console.log('✅ [useFiles] Delete successful');

      
      await fetchFiles();

      return { success: true, data: response.data };
    } catch (err) {
      console.error('❌ [useFiles] Delete error:', err);
      return { success: false, error: err.message };
    }
  };

  
  const downloadFile = async (fileId, fileName) => {
    try {
      console.log('⬇️ [useFiles] Downloading file:', fileId, fileName);

      const response = await api.get(`/files/${fileId}/download`, {
        responseType: 'blob'
      });
      
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      
      console.log('✅ [useFiles] Download successful');
      return { success: true };
    } catch (error) {
      console.error('❌ [useFiles] Download error:', error);
      return { success: false, error: error.message };
    }
  };


  const getFileById = async (fileId) => {
    try {
      console.log('📄 [useFiles] Fetching file by ID:', fileId);

      const response = await api.get(`/files/${fileId}`);
      
      console.log('✅ [useFiles] File fetched:', response.data);
      return { success: true, data: response.data };
    } catch (error) {
      console.error('❌ [useFiles] Get file error:', error);
      return { success: false, error: error.message };
    }
  };

  return {
    files,
    folders,
    allFiles,
    loading,
    error,
    uploadFile,
    createFolder,
    deleteFile,
    fetchFiles,
    refreshFiles: fetchFiles,
    downloadFile,
    getFileById, 
  };
};

export default useFiles;