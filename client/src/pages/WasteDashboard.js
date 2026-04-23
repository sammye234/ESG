
// client/src/pages/WasteDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Home, Download, Trash2, Loader, Building2, Info } from 'lucide-react';
import toast from 'react-hot-toast';
import WasteKPICards from '../components/waste/WasteKPICards';
import WasteTrendChart from '../components/waste/WasteTrendChart';
import WasteCompositionPie from '../components/waste/WasteCompositionPie';
import RecycleBreakdownBar from '../components/waste/RecycleBreakdownBar';
import WasteCategoryCards from '../components/waste/WasteCategoryCards';
import { WasteSankeyChart, RecyclingGauge } from '../components/waste/RecyclingGauge';
import { useWaste } from '../hooks/useWaste';

const styles = `
  .waste-dashboard-container {
    max-width: 1400px;
    margin: 0 auto;
    padding: 20px;
    background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
    min-height: 100vh;
  }
  .waste-header {
    background: white;
    padding: 24px;
    border-radius: 12px;
    margin-bottom: 20px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    display: flex;
    justify-content: space-between;
    align-items: center;
    flex-wrap: wrap;
    gap: 16px;
  }
  .waste-header h1 {
    font-size: 28px;
    color: #1f2937;
    margin: 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .header-subtitle {
    color: #6B7280;
    margin-top: 8px;
    font-size: 14px;
  }
  .header-actions {
    display: flex;
    gap: 12px;
    align-items: center;
    flex-wrap: wrap;
  }
  .btn-primary, .btn-secondary {
    padding: 12px 24px;
    border-radius: 8px;
    border: none;
    font-weight: 600;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 8px;
    transition: all 0.3s;
    font-size: 14px;
  }
  .btn-primary {
    background: #3B82F6;
    color: white;
  }
  .btn-primary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
  }
  .btn-secondary {
    background: #10B981;
    color: white;
  }
  .btn-secondary:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(16, 185, 129, 0.3);
  }
  .section-header {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
    padding: 20px 24px;
    border-radius: 12px;
    margin: 32px 0 20px;
    box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
    position: relative;
  }
  .section-header h2 {
    font-size: 24px;
    margin: 0 0 4px 0;
    display: flex;
    align-items: center;
    gap: 12px;
  }
  .charts-grid-2 {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 20px;
    margin-bottom: 20px;
  }
  .chart-card {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  }
  .chart-card-full {
    background: white;
    padding: 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    margin-bottom: 20px;
  }
  .info-banner {
    background: linear-gradient(135deg, #10B981 0%, #059669 100%);
    color: white;
    padding: 20px 24px;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    display: flex;
    align-items: start;
    gap: 16px;
    margin-bottom: 20px;
  }
  .section-divider {
    height: 4px;
    background: linear-gradient(90deg, transparent 0%, #667eea 20%, #764ba2 50%, #667eea 80%, transparent 100%);
    margin: 48px 0;
    border-radius: 2px;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }
`;

const WasteDashboard = ({ onBack }) => {
  const navigate = useNavigate();
  const { loading, getWasteFiles, processWasteFile, getMetrics } = useWaste();

  const [wasteFiles, setWasteFiles] = useState([]);
  const [selectedFileId, setSelectedFileId] = useState('');
  const [wasteData, setWasteData] = useState(null);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [selectedBU, setSelectedBU] = useState('all');
  const [processingFile, setProcessingFile] = useState(false);
  const [error, setError] = useState(null);
  const handleBackToDashboard = () => {
    console.log('🔙 Going back to dashboard');
    navigate('/dashboard');
  };

  useEffect(() => {
    loadWasteFiles();
  }, []);

  const loadWasteFiles = async () => {
    try {
      console.log('🗑️ Loading waste files...');
      const response = await getWasteFiles();
      console.log('📁 Files response:', response);
      
      if (response.success) {
        setWasteFiles(response.files);
        console.log(`✅ Loaded ${response.files.length} waste files`);
        
        if (response.files.length > 0 && !selectedFileId) {
          setSelectedFileId(response.files[0]._id);
        }
      }
    } catch (err) {
      console.error('❌ Error loading waste files:', err);
      toast.error('Failed to load waste files', { icon: '❌' });
    }
  };

  useEffect(() => {
    if (selectedFileId) {
      handleFileSelection(selectedFileId);
    }
  }, [selectedFileId]);

  const handleFileSelection = async (fileId) => {
    setProcessingFile(true);
    setError(null);
    
    try {
      console.log('🗑️ Processing file:', fileId);
      
      const processResponse = await processWasteFile(fileId);
      console.log('⚙️ Process response:', processResponse);
      
      if (!processResponse.success) {
        throw new Error('Processing failed: ' + (processResponse.error || 'Unknown error'));
      }

      const metricsResponse = await getMetrics(fileId);
      console.log('📊 Metrics response:', metricsResponse);
      
      if (metricsResponse.success) {
        console.log('🔍 Raw response data:', metricsResponse.data);
        console.log('🔍 Factory Data:', metricsResponse.data.factoryData);
        console.log('🔍 Factory Data type:', typeof metricsResponse.data.factoryData);
        console.log('🔍 Factory Data keys:', metricsResponse.data.factoryData ? Object.keys(metricsResponse.data.factoryData) : 'none');
        
        setWasteData(metricsResponse.data);
        const buList = metricsResponse.data.factoryData 
          ? Object.keys(metricsResponse.data.factoryData).filter(key => !key.startsWith('$'))
          : [];
        
        setBusinessUnits(buList);
        setSelectedBU('all');
        toast.success('Waste data loaded successfully', { icon: '♻️' });
      } else {
        throw new Error('Failed to get metrics');
      }
    } catch (err) {
      console.error('❌ Error processing waste file:', err);
      toast.error(err.message || 'Failed to process waste data', { icon: '❌' });
    } finally {
      setProcessingFile(false);
    }
  };

  const getDisplayData = () => {
    if (!wasteData) return null;

    if (selectedBU === 'all') {
      return {
        metrics: wasteData.metrics,
        monthlyData: wasteData.monthlyData || []
      };
    } else {
      const buData = wasteData.factoryData?.[selectedBU];
      if (!buData) return null;
      return {
        metrics: buData.metrics,
        monthlyData: buData.monthlyData || []
      };
    }
  };

  const displayData = getDisplayData();

  console.log('🎨 Rendering with:', {
    selectedFileId,
    selectedBU,
    hasData: !!wasteData,
    monthlyCount: displayData?.monthlyData?.length,
    hasMetrics: !!displayData?.metrics,
    metricsValue: displayData?.metrics
  });

  return (
    <>
      <style>{styles}</style>
      <div className="waste-dashboard-container">
        <div className="waste-header">
          <div>
            <h1>🗑️ Waste Management Dashboard</h1>
            <p className="header-subtitle">Comprehensive waste analysis across all facilities</p>
          </div>
          <div className="header-actions">
            <button className="btn-secondary" onClick={handleBackToDashboard}>
              <Home className="w-5 h-5" /> Back to Dashboard
            </button>
            <button className="btn-primary">
              <Download className="w-5 h-5" /> Export Report
            </button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <div className="flex items-center gap-4">
            <Trash2 className="w-6 h-6 text-red-500" />
            <label className="text-sm font-medium text-gray-700">Select Waste Data File:</label>
            <select
              value={selectedFileId}
              onChange={(e) => setSelectedFileId(e.target.value)}
              className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={loading || processingFile}
            >
              <option value="">Choose a file...</option>
              {wasteFiles.map(file => (
                <option key={file._id} value={file._id}>
                  {file.originalName} ({file.rowCount} rows)
                </option>
              ))}
            </select>
            {(loading || processingFile) && <Loader className="w-5 h-5 text-blue-500 animate-spin" />}
          </div>

          {wasteFiles.length === 0 && !loading && (
            <p className="text-sm text-orange-600 mt-3">
              ⚠️ No waste data files found. Upload a file first.
            </p>
          )}

          {error && (
            <div className="mt-3 bg-red-50 border border-red-200 rounded-lg p-3">
              <p className="text-sm text-red-600">❌ Error: {error}</p>
            </div>
          )}
        </div>

        {businessUnits.length > 0 && (
          <div className="bg-white rounded-lg shadow p-6 mb-6">
            <div className="flex items-center gap-4">
              <Building2 className="w-6 h-6 text-blue-500" />
              <label className="text-sm font-medium text-gray-700">Select Business Unit:</label>
              <div className="flex gap-3 flex-wrap">
                <button
                  onClick={() => setSelectedBU('all')}
                  className={`px-5 py-2 rounded-lg font-semibold transition ${
                    selectedBU === 'all' 
                      ? 'bg-blue-500 text-white shadow-lg' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Combined
                </button>
                {businessUnits.map(bu => (
                  <button
                    key={bu}
                    onClick={() => setSelectedBU(bu)}
                    className={`px-5 py-2 rounded-lg font-semibold transition ${
                      selectedBU === bu 
                        ? 'bg-blue-500 text-white shadow-lg' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {bu}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {!selectedFileId ? (
          <div className="bg-gradient-to-r from-red-50 to-orange-50 rounded-xl p-12 text-center border-2 border-dashed border-orange-300">
            <Trash2 className="w-16 h-16 text-orange-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-800 mb-2">No File Selected</h3>
            <p className="text-orange-600">Choose a waste data file from the dropdown to view analytics</p>
          </div>
        ) : processingFile ? (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <Loader className="w-12 h-12 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-gray-600 font-medium">Processing waste data...</p>
          </div>
        ) : displayData ? (
          <>
            <WasteKPICards data={displayData} />

            <div className="charts-grid-2">
              <div className="chart-card">
                <WasteTrendChart yearlyData={{ monthly: displayData.monthlyData }} selectedYear={2025} />
              </div>
              <div className="chart-card">
                <WasteCompositionPie data={displayData} />
              </div>
            </div>

            <div className="chart-card-full">
              <RecycleBreakdownBar yearlyData={{ monthly: displayData.monthlyData }} />
            </div>

            <WasteCategoryCards data={displayData} />

            <div className="charts-grid-2">
              <div className="chart-card">
                <WasteSankeyChart wasteData={displayData} />
              </div>
              <div className="chart-card">
                <RecyclingGauge data={displayData} />
              </div>
            </div>

            <div className="info-banner">
              <div className="info-icon">♻️</div>
              <div className="info-content">
                <h4>Waste Management Performance Summary</h4>
                <p>
                  <strong>Target:</strong> Achieve 75% waste diversion rate by 2026
                  (Currently at {displayData.metrics.recyclingRate?.toFixed(1) || '0.0'}%)
                </p>
              </div>
            </div>

            <div className="section-divider"></div>

            <div className="section-header">
              <h2>📊 Yearly Waste Management Analysis</h2>
            </div>
          </>
        ) : (
          <div className="text-center py-12 bg-white rounded-lg shadow">
            <p className="text-gray-600 font-medium">No data available for selected file/BU</p>
          </div>
        )}
      </div>
    </>
  );
};

export default WasteDashboard;