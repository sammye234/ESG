// client/src/pages/WaterDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  LineChart, Line, BarChart, Bar, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, 
  ResponsiveContainer, PieChart, Pie, Cell 
} from 'recharts';
import { 
  Home, Download, Droplets, TrendingUp, 
  Info, Building2, Loader 
} from 'lucide-react';
import toast from 'react-hot-toast';
import { Header } from '../components/common';
import { WaterSankeyChart } from '../components/charts';
import { useWater } from '../hooks/useWater';

const WaterDashboard = ({ onBack }) => {
  const navigate = useNavigate();
  const { 
    loading, 
    getWaterFiles, 
    processWaterFile, 
    getMetrics 
  } = useWater();

  const [waterFiles, setWaterFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [waterData, setWaterData] = useState(null);
  const [metrics, setMetrics] = useState(null);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [selectedBU, setSelectedBU] = useState('all');
  const [processingFile, setProcessingFile] = useState(false);
  const handleBackToDashboard = () => {
    console.log('🔙 Going back to dashboard');
    navigate('/dashboard');
  };

  useEffect(() => {
    loadWaterFiles();
  }, []);

  const loadWaterFiles = async () => {
    try {
      const response = await getWaterFiles();
      if (response.success) {
        setWaterFiles(response.files);
      }
    } catch (err) {
      console.error('Error loading files:', err);
      toast.error('Failed to load water files', { icon: '❌' });
    }
  };

  useEffect(() => {
    if (selectedFile) {
      handleFileSelection(selectedFile);
    }
  }, [selectedFile]);

  const handleFileSelection = async (fileId) => {
    setProcessingFile(true);
    try {
      const processResponse = await processWaterFile(fileId);
      
      if (processResponse.success) {
        const metricsResponse = await getMetrics(fileId);
        
        if (metricsResponse.success) {
          setWaterData(metricsResponse.data);
          setMetrics(metricsResponse.data.metrics);
          
          const buList = metricsResponse.data.factoryData 
            ? Object.keys(metricsResponse.data.factoryData)
            : [];
          setBusinessUnits(buList);
          setSelectedBU('all');
          toast.success('Water data loaded successfully', { icon: '💧' });
        } else {
          toast.error('Failed to get water metrics', { icon: '❌' });
        }
      } else {
        toast.error('File processing failed', { icon: '❌' });
      }
    } catch (err) {
      console.error('Error processing file:', err);
      toast.error('Error processing water file', { icon: '❌' });
    } finally {
      setProcessingFile(false);
    }
  };

  const getDisplayData = () => {
    if (!waterData) return { monthlyData: [], metrics: null };
    
    if (selectedBU === 'all') {
      return {
        monthlyData: waterData.monthlyData || [],
        metrics: waterData.metrics
      };
    } else {
      const buData = waterData.factoryData?.[selectedBU];
      return {
        monthlyData: buData?.monthlyData || [],
        metrics: buData?.metrics || null
      };
    }
  };

  const { monthlyData: displayMonthly, metrics: displayMetrics } = getDisplayData();

  // Chart data based on selected BU
  const consumptionTrendData = displayMonthly.map(d => ({
    month: d.month,
    consumption: d.consumption.total,
    source: d.source.total
  }));

  const sourceBreakdownData = displayMonthly.map(d => ({
    month: d.month,
    'Ground Water': d.source.groundWater,
    'Rainwater': d.source.rainwater,
    'Recycled': d.source.recycled
  }));

  const consumptionBreakdownData = displayMonthly.map(d => ({
    month: d.month,
    'Boiler Water': d.consumption.boilerWater,
    'Domestic': d.consumption.domestic,
    'WTP Backwash': d.consumption.wtpBackwash,
    'Non-Contact Cooling': d.consumption.nonContactCooling,
    'Wet Process': d.consumption.wetProcess,
    'Utility': d.consumption.utility
  }));

  const sourcePieData = displayMetrics ? [
    { name: 'Ground Water', value: displayMetrics.totalGroundWater || 0, color: '#3b82f6' },
    { name: 'Rainwater', value: displayMetrics.totalRainwater || 0, color: '#10b981' },
    { name: 'Recycled', value: displayMetrics.totalRecycled || 0, color: '#8b5cf6' }
  ].filter(d => d.value > 0) : [];

  const headerActions = [
    {
      label: 'Back to Dashboard',
      icon: Home,
      className: 'px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2',
      onClick: handleBackToDashboard
    },
    {
      label: 'Export Report',
      icon: Download,
      className: 'px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center gap-2',
      onClick: () => alert('Export functionality coming soon!')
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50">
      <Header
        title="Water Consumption Dashboard"
        subtitle="Comprehensive water usage analysis across all facilities"
        showMenu={false}
        actions={headerActions}
      />

      <main className="p-6 max-w-7xl mx-auto">
        {/* File Selection */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <Droplets className="w-6 h-6 text-blue-500" />
            <label className="text-sm font-medium text-gray-700">
              Select Water Data File:
            </label>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
              disabled={loading || processingFile}
            >
              <option value="">Choose a file...</option>
              {waterFiles.map(file => (
                <option key={file._id} value={file._id}>
                  {file.name} ({file.rowCount} rows)
                </option>
              ))}
            </select>
            {processingFile && (
              <Loader className="w-5 h-5 text-blue-500 animate-spin" />
            )}
          </div>

          {waterFiles.length === 0 && !loading && (
            <p className="text-sm text-orange-600 mt-3">
              No water data files found. Upload a file first via the main upload section.
            </p>
          )}
        </div>

        {/* Business Unit Selector */}
        {businessUnits.length > 0 && (
          <div className="bg-white rounded-lg shadow p-4 mb-6">
            <div className="flex items-center gap-4">
              <Building2 className="w-6 h-6 text-blue-500" />
              <label className="text-sm font-medium text-gray-700">
                Select Business Unit:
              </label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setSelectedBU('all')}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
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
                    className={`px-4 py-2 rounded-lg font-medium transition ${
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

        {!selectedFile ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-12 text-center">
            <Droplets className="w-16 h-16 text-blue-500 mx-auto mb-4" />
            <p className="text-blue-800 text-lg">
              Select a water data file to view dashboard metrics
            </p>
          </div>
        ) : processingFile ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-12 text-center">
            <Loader className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-blue-800 text-lg">
              Processing water data...
            </p>
          </div>
        ) : displayMetrics ? (
          <>
            {/* KPI Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Droplets className="w-8 h-8 opacity-80" />
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium opacity-90 mb-2">Total Source</h3>
                <div className="text-4xl font-bold mb-1">
                  {displayMetrics.totalSource?.toLocaleString(undefined, {maximumFractionDigits: 0}) || '0'}
                </div>
                <div className="text-sm opacity-75">m³</div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Droplets className="w-8 h-8 opacity-80" />
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium opacity-90 mb-2">Ground Water</h3>
                <div className="text-4xl font-bold mb-1">
                  {displayMetrics.totalGroundWater?.toLocaleString(undefined, {maximumFractionDigits: 0}) || '0'}
                </div>
                <div className="text-sm opacity-75">m³</div>
              </div>

              <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Droplets className="w-8 h-8 opacity-80" />
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium opacity-90 mb-2">Total Consumption</h3>
                <div className="text-4xl font-bold mb-1">
                  {displayMetrics.totalConsumption?.toLocaleString(undefined, {maximumFractionDigits: 0}) || '0'}
                </div>
                <div className="text-sm opacity-75">m³</div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl shadow-xl p-6 text-white">
                <div className="flex items-center justify-between mb-3">
                  <Droplets className="w-8 h-8 opacity-80" />
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-medium opacity-90 mb-2">Recycled Water</h3>
                <div className="text-4xl font-bold mb-1">
                  {displayMetrics.totalRecycled?.toLocaleString(undefined, {maximumFractionDigits: 0}) || '0'}
                </div>
                <div className="text-sm opacity-75">m³</div>
              </div>
            </div>

            {/* Rest of your existing charts and sections – unchanged except using displayMonthly / displayMetrics */}
            {/* Secondary Metrics */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600 mb-1">Boiler Water</p>
                <p className="text-2xl font-bold text-red-600">
                  {displayMetrics.totalBoilerWater?.toLocaleString(undefined, {maximumFractionDigits: 0})} m³
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600 mb-1">Domestic Use</p>
                <p className="text-2xl font-bold text-green-600">
                  {displayMetrics.totalDomestic?.toLocaleString(undefined, {maximumFractionDigits: 0})} m³
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600 mb-1">WTP Backwash</p>
                <p className="text-2xl font-bold text-cyan-600">
                  {displayMetrics.totalWTPBackwash?.toLocaleString(undefined, {maximumFractionDigits: 0})} m³
                </p>
              </div>
              <div className="bg-white rounded-lg shadow p-4">
                <p className="text-xs text-gray-600 mb-1">Non-Contact Cooling</p>
                <p className="text-2xl font-bold text-blue-600">
                  {displayMetrics.totalNonContactCooling?.toLocaleString(undefined, {maximumFractionDigits: 0})} m³
                </p>
              </div>
            </div>

            {/* Peak Usage Info */}
            {displayMetrics.maxConsumption?.value > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Peak Consumption Month</p>
                      <p className="font-bold text-gray-900">
                        {displayMetrics.maxConsumption.month}: {displayMetrics.maxConsumption.value.toLocaleString()} m³
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lowest Consumption Month</p>
                      <p className="font-bold text-gray-900">
                        {displayMetrics.minConsumption.month}: {displayMetrics.minConsumption.value.toLocaleString()} m³
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Charts Grid – unchanged except data source */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Monthly Water Flow Trend {selectedBU !== 'all' && `- ${selectedBU}`}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={consumptionTrendData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Area type="monotone" dataKey="source" stroke="#3b82f6" fill="#3b82f6" fillOpacity={0.3} name="Source (m³)" />
                    <Area type="monotone" dataKey="consumption" stroke="#10b981" fill="#10b981" fillOpacity={0.3} name="Consumption (m³)" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Water Source Distribution {selectedBU !== 'all' && `- ${selectedBU}`}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={sourcePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={true}
                      label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sourcePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Monthly Source Breakdown {selectedBU !== 'all' && `- ${selectedBU}`}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={sourceBreakdownData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Ground Water" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="Rainwater" stackId="a" fill="#10b981" />
                    <Bar dataKey="Recycled" stackId="a" fill="#8b5cf6" />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Monthly Consumption Breakdown {selectedBU !== 'all' && `- ${selectedBU}`}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={consumptionBreakdownData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" angle={-45} textAnchor="end" height={80} tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Boiler Water" stackId="a" fill="#ef4444" />
                    <Bar dataKey="Domestic" stackId="a" fill="#f59e0b" />
                    <Bar dataKey="WTP Backwash" stackId="a" fill="#06b6d4" />
                    <Bar dataKey="Non-Contact Cooling" stackId="a" fill="#8b5cf6" />
                    <Bar dataKey="Wet Process" stackId="a" fill="#3b82f6" />
                    <Bar dataKey="Utility" stackId="a" fill="#10b981" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Water Flow Sankey Diagram {selectedBU !== 'all' && `- ${selectedBU}`}
              </h3>
              <WaterSankeyChart waterData={displayMetrics} />
            </div>

            <div className="bg-gradient-to-r from-gray-50 to-gray-100 rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Water Balance Summary
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                  <p className="text-sm text-gray-600 mb-1">Total Input</p>
                  <p className="text-2xl font-bold text-blue-600">
                    {displayMetrics.totalSource?.toLocaleString()} m³
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-green-500">
                  <p className="text-sm text-gray-600 mb-1">Total Consumption</p>
                  <p className="text-2xl font-bold text-green-600">
                    {displayMetrics.totalConsumption?.toLocaleString()} m³
                  </p>
                </div>
                <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                  <p className="text-sm text-gray-600 mb-1">Total Output</p>
                  <p className="text-2xl font-bold text-orange-600">
                    {(displayMetrics.totalProcessLoss + displayMetrics.totalTreatment + displayMetrics.totalDischarge).toLocaleString()} m³
                  </p>
                </div>
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
};

export default WaterDashboard;