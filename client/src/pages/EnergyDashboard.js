//client/src/pages/EnergyDashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEnergy } from '../hooks/useEnergy';
import toast from 'react-hot-toast';
import { 
  BarChart, Bar, AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { Home, Download, Zap, TrendingUp, Loader, Building2, Info } from 'lucide-react';

const EnergyDashboard = ({ onBack }) => {
  const navigate = useNavigate();
  const { 
    loading, 
    error, 
    getEnergyFiles, 
    processEnergyFile, 
    getMetrics,
    exportData 
  } = useEnergy();

  const [energyFiles, setEnergyFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [energyData, setEnergyData] = useState(null);
  const [ setMetrics] = useState(null);
  const [businessUnits, setBusinessUnits] = useState([]);
  const [selectedBU, setSelectedBU] = useState('all');
  const [processingFile, setProcessingFile] = useState(false);
  const handleBackToDashboard = () => {
    console.log('🔙 Going back to dashboard');
    navigate('/dashboard');
  };

  useEffect(() => {
    loadEnergyFiles();
  }, );

  const loadEnergyFiles = async () => {
    try {
      const response = await getEnergyFiles();
      if (response.success) {
        setEnergyFiles(response.files);
      }
    } catch (err) {
      console.error('❌ Error loading files:', err);
      toast.error('Failed to load energy files', { icon: '❌' });
    }
  };

  useEffect(() => {
    if (selectedFile) {
      handleFileSelection(selectedFile);
    }
  }, );

  const handleFileSelection = async (fileId) => {
    setProcessingFile(true);
    try {
      const processResponse = await processEnergyFile(fileId);
      
      if (processResponse.success) {
        const metricsResponse = await getMetrics(fileId);
        
        if (metricsResponse.success) {
          setEnergyData(metricsResponse.data);
          setMetrics(metricsResponse.data.metrics);
          
          const buList = metricsResponse.data.factoryData 
            ? Object.keys(metricsResponse.data.factoryData)
            : [];
          setBusinessUnits(buList);
          setSelectedBU('all');
          toast.success('Energy data processed successfully', { icon: '⚡' });
        } else {
          toast.error('Failed to get metrics', { icon: '❌' });
        }
      } else {
        toast.error('File processing failed', { icon: '❌' });
      }
    } catch (err) {
      console.error('❌ Error processing file:', err);
      toast.error('Error processing energy file', { icon: '❌' });
    } finally {
      setProcessingFile(false);
    }
  };

  const handleExport = async () => {
    if (!selectedFile) {
      toast.error('Please select a file first', { icon: '❌' });
      return;
    }
    try {
      await exportData(selectedFile, 'csv');
      toast.success('Data exported successfully', { icon: '⬇️' });
    } catch (err) {
      console.error('❌ Error exporting:', err);
      toast.error('Failed to export data', { icon: '❌' });
    }
  };

  const getDisplayData = () => {
    if (!energyData) return [];
    
    if (selectedBU === 'all') {
      return energyData.monthlyData || [];
    } else {
      const buData = energyData.factoryData?.[selectedBU];
      return buData?.monthlyData || [];
    }
  };

  const getDisplayMetrics = () => {
    if (!energyData) return null;
    
    if (selectedBU === 'all') {
      return energyData.metrics;
    } else {
      return energyData.factoryData?.[selectedBU]?.metrics;
    }
  };

  const displayData = getDisplayData();
  const displayMetrics = getDisplayMetrics();

  // Chart data
  const energyMixData = displayData.map(month => ({
    month: month.month,
    'Solar (KWh)': month['Solar (KWh)'] || 0,
    'REB (KWh)': month['REB (KWh)'] || 0,
    'Diesel (Ltr)': month['Diesel (Ltr)'] || 0,
    'GasBoiler (m³)': month['GasBoiler (m3)'] || 0,
    'GasGenerator (m³)': month['GasGenerator (m3)'] || 0
  }));

  const trendData = displayData.map(month => ({
    month: month.month,
    'Total Energy': month.totalEnergy,
    'Renewable': month.renewableEnergy,
    'Fossil Fuel': month.fossilFuel
  }));

  //const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444'];

  // 1. Energy Source Pie Chart Data
  const energySourcePieData = displayMetrics ? [
    { name: 'Solar', value: displayMetrics.electricityRenewable, color: '#10b981' },
    { name: 'REB (Grid)', value: displayMetrics.electricityGrid, color: '#3b82f6' },
    { name: 'Diesel', value: displayMetrics.diesel, color: '#8b5cf6' },
    { name: 'Natural Gas', value: displayMetrics.naturalGas, color: '#f59e0b' }
  ].filter(d => d.value > 0) : [];

  // 4. Cost Estimation - Use actual ProductionCost from dataset
  const calculateCosts = () => {
    if (!displayData || displayData.length === 0) return 0;
    
    // Sum up ProductionCost from monthly data
    const totalCost = displayData.reduce((sum, month) => {
      // Check if ProductionCost exists in the data
      const cost = parseFloat(month.ProductionCost || month['ProductionCost (USD)'] || 0);
      return sum + cost;
    }, 0);
    
    return totalCost;
  };

  // 5. Carbon Emissions (simplified calculation)
  const calculateEmissions = () => {
    if (!displayMetrics) return 0;
    const rebEmissions = displayMetrics.electricityGrid * 0.62; // EF of REB is 0.62 tco2 per MWh
    const dieselEmissions = displayMetrics.diesel * 2.68; // EF of diesel in kg CO₂ per liter
    const gasEmissions = displayMetrics.naturalGas * 1.92; // EF of NG in kg CO₂ per m³
    return (rebEmissions + dieselEmissions + gasEmissions) / 1000; // Convert to tons
  };
  //
  // check reb Ef properly do we need to convert units? 
  //if not then only conver diesel and NG to tons
  //

  // 6. Energy Intensity 
  const calculateIntensity = () => {
    if (!displayData || displayData.length === 0) return 0;
    
    // Sum up production weight or pieces
    const totalProduction = displayData.reduce((sum, month) => {
      const weight = parseFloat(month['ProductionWeight (Kg)'] || month.ProductionWeight || 0);
      const pieces = parseFloat(month['Production (Pcs)'] || month.Production || 0);
      
      // Use weight if available, otherwise use pieces
      return sum + (weight > 0 ? weight : pieces);
    }, 0);
    
    if (totalProduction === 0) return 0;
    
    // Energy per unit (MWh per kg or per piece)
    return displayMetrics.totalEnergy / totalProduction;
  };

  // 7. Top 3 Energy Consumers
  const getTopConsumers = () => {
    if (!energyData?.factoryData) return [];
    return Object.entries(energyData.factoryData)
      .map(([bu, data]) => ({
        bu,
        total: data.metrics.totalEnergy
      }))
      .sort((a, b) => b.total - a.total)
      .slice(0, 3);
  };

  const topConsumers = getTopConsumers();

  // 10. Download Report Function
  const handleDownloadReport = () => {
    if (!displayMetrics || !displayData) {
      alert('No data to export');
      return;
    }

    // Create CSV content
    let csvContent = "Energy Dashboard Report\n\n";
    csvContent += `Generated: ${new Date().toLocaleString()}\n`;
    csvContent += `Business Unit: ${selectedBU === 'all' ? 'All Combined' : selectedBU}\n\n`;
    
    csvContent += "=== SUMMARY METRICS ===\n";
    csvContent += `Total Energy,${displayMetrics.totalEnergy} MWh\n`;
    csvContent += `Grid Electricity (REB),${displayMetrics.electricityGrid} MWh\n`;
    csvContent += `Solar Energy,${displayMetrics.electricityRenewable} MWh\n`;
    csvContent += `Natural Gas,${displayMetrics.naturalGas} m³\n`;
    csvContent += `Diesel,${displayMetrics.diesel} Ltr\n`;
    csvContent += `Renewable %,${displayMetrics.renewablePercent}%\n`;
    csvContent += `Estimated Cost,${calculateCosts().toLocaleString(undefined, {maximumFractionDigits: 2})}\n`;
    csvContent += `Carbon Emissions,${calculateEmissions().toFixed(2)} tons CO₂e\n\n`;
    
    csvContent += "=== MONTHLY DATA ===\n";
    csvContent += "Month,Solar (KWh),REB (KWh),Diesel (Ltr),GasBoiler (m³),GasGenerator (m³),Total Energy (MWh)\n";
    displayData.forEach(month => {
      csvContent += `${month.month},${month['Solar (KWh)']},${month['REB (KWh)']},${month['Diesel (Ltr)']},${month['GasBoiler (m3)']},${month['GasGenerator (m3)']},${month.totalEnergy.toFixed(2)}\n`;
    });

    // Create download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `energy-report-${selectedBU}-${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-lg">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Zap className="w-8 h-8" />
                Energy Dashboard
              </h1>
              <p className="text-yellow-100 mt-1">
                Monitor energy consumption and renewable energy usage across business units
              </p>
            </div>
            <div className="flex gap-3">
              <button
                onClick={handleBackToDashboard}
                className="px-4 py-2 bg-white text-gray-700 rounded-lg hover:bg-gray-100 transition flex items-center gap-2"
              >
                <Home className="w-4 h-4" />
                Back to Dashboard
              </button>
              <button
                onClick={handleExport}
                disabled={!selectedFile}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Export CSV
              </button>
              <button
                onClick={handleDownloadReport}
                disabled={!selectedFile || !displayMetrics}
                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition flex items-center gap-2 disabled:opacity-50"
              >
                <Download className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>
        </div>
      </div>

      <main className="p-6 max-w-7xl mx-auto">
        {/* File Selection */}
        <div className="bg-white rounded-lg shadow p-4 mb-6">
          <div className="flex items-center gap-4">
            <Zap className="w-6 h-6 text-yellow-500" />
            <label className="text-sm font-medium text-gray-700">
              Select Energy Data File:
            </label>
            <select
              value={selectedFile}
              onChange={(e) => setSelectedFile(e.target.value)}
              className="flex-1 max-w-md px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 outline-none"
              disabled={loading || processingFile}
            >
              <option value="">Choose a file...</option>
              {energyFiles.map(file => (
                <option key={file._id} value={file._id}>
                  ⚡ {file.name} ({file.rowCount} rows)
                </option>
              ))}
            </select>
            {processingFile && (
              <Loader className="w-5 h-5 text-blue-500 animate-spin" />
            )}
          </div>

          {energyFiles.length === 0 && !loading && (
            <p className="text-sm text-orange-600 mt-3">
              ⚠️ No energy data files found. Upload a CSV/Excel file first.
            </p>
          )}

          {error && (
            <p className="text-sm text-red-600 mt-3">
              ❌ Error: {error}
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
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-12 text-center">
            <Zap className="w-16 h-16 text-yellow-500 mx-auto mb-4" />
            <p className="text-yellow-800 text-lg">
              ⚡ Select an energy data file to view dashboard metrics
            </p>
          </div>
        ) : processingFile ? (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-12 text-center">
            <Loader className="w-16 h-16 text-blue-500 mx-auto mb-4 animate-spin" />
            <p className="text-blue-800 text-lg">
              Processing energy data...
            </p>
          </div>
        ) : displayMetrics ? (
          <>
            {/* Beautiful KPI Cards - Water Dashboard Style */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
              <div className="bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">Total Energy</h3>
                  <Zap className="w-6 h-6 opacity-75" />
                </div>
                <div className="text-4xl font-bold mb-1">
                  {parseFloat(displayMetrics.totalEnergy).toLocaleString()}
                </div>
                <div className="text-xs opacity-75">MWh</div>
                <div className="mt-3 pt-3 border-t border-yellow-300">
                  <div className="text-xs opacity-90">
                    Avg/Month: {parseFloat(displayMetrics.avgMonthly).toLocaleString()} MWh
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">Grid Electricity (REB)</h3>
                  <TrendingUp className="w-6 h-6 opacity-75" />
                </div>
                <div className="text-4xl font-bold mb-1">
                  {parseFloat(displayMetrics.electricityGrid).toLocaleString()}
                </div>
                <div className="text-xs opacity-75">MWh</div>
                <div className="mt-3 pt-3 border-t border-blue-400">
                  <div className="text-xs opacity-90">
                    {((parseFloat(displayMetrics.electricityGrid) / parseFloat(displayMetrics.totalEnergy)) * 100).toFixed(1)}% of total
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">Solar Energy</h3>
                  <svg className="w-6 h-6 opacity-75" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M10 2a1 1 0 011 1v1.323l3.954 1.582 1.599-.8a1 1 0 01.894 1.79l-1.233.616 1.738 5.42a1 1 0 01-.285 1.05A3.989 3.989 0 0115 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.715-5.349L11 6.477V16h2a1 1 0 110 2H7a1 1 0 110-2h2V6.477L6.237 7.582l1.715 5.349a1 1 0 01-.285 1.05A3.989 3.989 0 015 15a3.989 3.989 0 01-2.667-1.019 1 1 0 01-.285-1.05l1.738-5.42-1.233-.617a1 1 0 01.894-1.788l1.599.799L9 4.323V3a1 1 0 011-1z"/>
                  </svg>
                </div>
                <div className="text-4xl font-bold mb-1">
                  {parseFloat(displayMetrics.electricityRenewable).toLocaleString()}
                </div>
                <div className="text-xs opacity-75">MWh</div>
                <div className="mt-3 pt-3 border-t border-green-400">
                  <div className="text-xs opacity-90">
                    {displayMetrics.renewablePercent}% renewable
                  </div>
                </div>
              </div>

              <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-lg shadow-lg p-6 text-white">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium opacity-90">Natural Gas Total</h3>
                  <svg className="w-6 h-6 opacity-75" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12.395 2.553a1 1 0 00-1.45-.385c-.345.23-.614.558-.822.88-.214.33-.403.713-.57 1.116-.334.804-.614 1.768-.84 2.734a31.365 31.365 0 00-.613 3.58 2.64 2.64 0 01-.945-1.067c-.328-.68-.398-1.534-.398-2.654A1 1 0 005.05 6.05 6.981 6.981 0 003 11a7 7 0 1011.95-4.95c-.592-.591-.98-.985-1.348-1.467-.363-.476-.724-1.063-1.207-2.03zM12.12 15.12A3 3 0 017 13s.879.5 2.5.5c0-1 .5-4 1.25-4.5.5 1 .786 1.293 1.371 1.879A2.99 2.99 0 0113 13a2.99 2.99 0 01-.879 2.121z" clipRule="evenodd"/>
                  </svg>
                </div>
                <div className="text-4xl font-bold mb-1">
                  {parseFloat(displayMetrics.naturalGas).toLocaleString()}
                </div>
                <div className="text-xs opacity-75">m³</div>
                <div className="mt-3 pt-3 border-t border-orange-400">
                  <div className="text-xs opacity-90">
                    Peak: {displayMetrics.peakMonth?.month || 'N/A'}
                  </div>
                </div>
              </div>
            </div>

            {/* Peak Usage Info */}
            {displayMetrics.peakMonth?.value > 0 && (
              <div className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-500 rounded-lg p-4 mb-6">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div className="flex-1 grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-600">Peak Energy Month</p>
                      <p className="font-bold text-gray-900">
                        {displayMetrics.peakMonth.month}: {displayMetrics.peakMonth.value.toLocaleString()} MWh
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-600">Lowest Energy Month</p>
                      <p className="font-bold text-gray-900">
                        {displayMetrics.lowestMonth.month}: {displayMetrics.lowestMonth.value.toLocaleString()} MWh
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* 4. Cost & 5. Emissions & 6. Intensity Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white rounded-lg shadow p-5 border-l-4 border-green-500">
                <p className="text-xs text-gray-600 mb-1">💰 Total Production Cost</p>
                <p className="text-3xl font-bold text-green-600">
                  ${calculateCosts().toLocaleString(undefined, {maximumFractionDigits: 0})}
                </p>
                <p className="text-xs text-gray-500 mt-2">Actual production cost from dataset</p>
              </div>

              <div className="bg-white rounded-lg shadow p-5 border-l-4 border-red-500">
                <p className="text-xs text-gray-600 mb-1">🌍 Carbon Emissions</p>
                <p className="text-3xl font-bold text-red-600">
                  {calculateEmissions().toFixed(2)} tons
                </p>
                <p className="text-xs text-gray-500 mt-2">CO₂e equivalent this period</p>
              </div>

              <div className="bg-white rounded-lg shadow p-5 border-l-4 border-purple-500">
                <p className="text-xs text-gray-600 mb-1">📊 Energy Intensity</p>
                <p className="text-3xl font-bold text-purple-600">
                  {calculateIntensity().toFixed(4)}
                </p>
                <p className="text-xs text-gray-500 mt-2">MWh per kg/piece produced</p>
              </div>
            </div>

            {/* 2. Renewable Energy Progress Bar */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-bold text-gray-800">🌱 Renewable Energy Progress</h3>
                <span className="text-2xl font-bold text-green-600">{displayMetrics.renewablePercent}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-6 overflow-hidden">
                <div 
                  className="bg-gradient-to-r from-green-400 to-green-600 h-6 rounded-full transition-all duration-500 flex items-center justify-end pr-3"
                  style={{ width: `${Math.min(displayMetrics.renewablePercent, 100)}%` }}
                >
                  <span className="text-white text-xs font-bold">
                    {displayMetrics.electricityRenewable.toLocaleString()} MWh
                  </span>
                </div>
              </div>
              <div className="flex justify-between mt-2 text-sm text-gray-600">
                <span>Current: {displayMetrics.renewablePercent}%</span>
                <span>Target: 30%</span>
                <span>Goal: 50% by 2030</span>
              </div>
            </div>

            {/* 7. Top 3 Energy Consumers */}
            {topConsumers.length > 0 && selectedBU === 'all' && (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">🏆 Top Energy Consumers</h3>
                <div className="space-y-3">
                  {topConsumers.map((consumer, idx) => (
                    <div key={consumer.bu} className="flex items-center gap-4">
                      <div className={`flex-shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold text-white ${
                        idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-600'
                      }`}>
                        {idx + 1}
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <span className="font-semibold text-gray-900">{consumer.bu}</span>
                          <span className="text-lg font-bold text-blue-600">
                            {consumer.total.toLocaleString()} MWh
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div 
                            className={`h-2 rounded-full ${
                              idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-600'
                            }`}
                            style={{ 
                              width: `${(consumer.total / topConsumers[0].total) * 100}%` 
                            }}
                          />
                        </div>
                      </div>
                      <div className="text-sm text-gray-600">
                        {((consumer.total / displayMetrics.totalEnergy) * 100).toFixed(1)}%
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* 1. Energy Source Pie Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Energy Source Distribution
                  {selectedBU !== 'all' && <span className="text-blue-600"> - {selectedBU}</span>}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={energySourcePieData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => {
                        // Only show label if percentage is significant (> 1%)
                        if (percent < 0.01) return '';
                        return `${name}: ${(percent * 100).toFixed(1)}%`;
                      }}
                      outerRadius={90}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {energySourcePieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value) => `${value.toLocaleString()} MWh`}
                      contentStyle={{ 
                        backgroundColor: 'white', 
                        border: '2px solid #e5e7eb',
                        borderRadius: '8px',
                        padding: '10px'
                      }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36}
                      formatter={(value, entry) => {
                        const total = energySourcePieData.reduce((sum, item) => sum + item.value, 0);
                        const percent = ((entry.payload.value / total) * 100).toFixed(1);
                        return `${value}: ${percent}%`;
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              {/* Energy Mix Bar Chart */}
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Monthly Energy Mix
                  {selectedBU !== 'all' && <span className="text-blue-600"> - {selectedBU}</span>}
                </h3>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={energyMixData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="month" 
                      tick={{ fontSize: 11 }}
                      angle={-45}
                      textAnchor="end"
                      height={80}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="Solar (KWh)" fill="#10b981" name="Solar (KWh)" />
                    <Bar dataKey="REB (KWh)" fill="#3b82f6" name="REB (KWh)" />
                    <Bar dataKey="GasBoiler (m³)" fill="#f97316" name="GasBoiler (m³)" />
                    <Bar dataKey="GasGenerator (m³)" fill="#ef4444" name="GasGenerator (m³)" />
                    <Bar dataKey="Diesel (Ltr)" fill="#8b5cf6" name="Diesel (Ltr)" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Energy Trend moved below to full width */}
            <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">
                Energy Consumption Trend
                {selectedBU !== 'all' && <span className="text-blue-600"> - {selectedBU}</span>}
              </h3>
              <ResponsiveContainer width="100%" height={350}>
                <AreaChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="month" 
                    angle={-45} 
                    textAnchor="end" 
                    height={80}
                    tick={{ fontSize: 11 }}
                  />
                  <YAxis tick={{ fontSize: 11 }} />
                  <Tooltip />
                  <Legend />
                  <Area 
                    type="monotone" 
                    dataKey="Total Energy" 
                    stroke="#f59e0b" 
                    fill="#f59e0b"
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Renewable" 
                    stroke="#10b981" 
                    fill="#10b981"
                    fillOpacity={0.3}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="Fossil Fuel" 
                    stroke="#ef4444" 
                    fill="#ef4444"
                    fillOpacity={0.3}
                  />
                </AreaChart>
              </ResponsiveContainer>
              
              {/* Explanation Box */}
              <div className="mt-6 bg-gradient-to-r from-blue-50 via-green-50 to-orange-50 rounded-lg p-5 border-l-4 border-blue-500">
                <div className="flex items-start gap-3">
                  <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-gray-900 mb-3">📊 Understanding the Energy Trend Chart</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div className="bg-white/70 p-3 rounded-lg border-l-4 border-yellow-500">
                        <p className="font-bold text-yellow-700 mb-1">⚡ Total Energy</p>
                        <p className="text-gray-700">
                          Combined energy from all sources: Solar + REB (Grid) + Diesel + Natural Gas
                        </p>
                      </div>
                      <div className="bg-white/70 p-3 rounded-lg border-l-4 border-green-500">
                        <p className="font-bold text-green-700 mb-1">🌱 Renewable</p>
                        <p className="text-gray-700">
                          Clean energy from Solar only. Zero carbon emissions, environmentally friendly.
                        </p>
                      </div>
                      <div className="bg-white/70 p-3 rounded-lg border-l-4 border-red-500">
                        <p className="font-bold text-red-700 mb-1">🏭 Fossil Fuel</p>
                        <p className="text-gray-700">
                          Carbon-emitting sources: REB (Grid) + Diesel + Natural Gas. Contributes to CO₂ emissions.
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 pt-3 border-t border-gray-200">
                      <p className="text-xs text-gray-600">
                        <strong>💡 Sustainability Goal:</strong> Increase the green (Renewable) area and decrease the red (Fossil Fuel) area to reduce carbon footprint.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Detailed Monthly Table - Separate for each BU */}
            {businessUnits.length > 0 && selectedBU === 'all' ? (
              businessUnits.map(bu => {
                const buMonthlyData = energyData.factoryData?.[bu]?.monthlyData || [];
                return (
                  <div key={bu} className="bg-white rounded-lg shadow-lg p-6 mb-6">
                    <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                      <Building2 className="w-5 h-5 text-blue-500" />
                      Business Unit: {bu} - Monthly Energy Breakdown
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Solar (KWh)</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">REB (KWh)</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Diesel (Ltr)</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">GasBoiler (m³)</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">GasGenerator (m³)</th>
                            <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Energy (MWh)</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {buMonthlyData.map((month, idx) => (
                            <tr key={idx} className="hover:bg-gray-50">
                              <td className="px-4 py-3 text-sm font-medium text-gray-900">{month.month}</td>
                              <td className="px-4 py-3 text-sm text-right text-gray-700">{(month['Solar (KWh)'] || 0).toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm text-right text-gray-700">{(month['REB (KWh)'] || 0).toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm text-right text-gray-700">{(month['Diesel (Ltr)'] || 0).toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm text-right text-gray-700">{(month['GasBoiler (m3)'] || 0).toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm text-right text-gray-700">{(month['GasGenerator (m3)'] || 0).toLocaleString()}</td>
                              <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">{month.totalEnergy.toFixed(2)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-gray-800 mb-4">
                  Monthly Energy Breakdown
                  {selectedBU !== 'all' && <span className="text-blue-600"> - Business Unit: {selectedBU}</span>}
                </h3>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Month</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Solar (KWh)</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">REB (KWh)</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Diesel (Ltr)</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">GasBoiler (m³)</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">GasGenerator (m³)</th>
                        <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase">Total Energy (MWh)</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {displayData.map((month, idx) => (
                        <tr key={idx} className="hover:bg-gray-50">
                          <td className="px-4 py-3 text-sm font-medium text-gray-900">{month.month}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">{(month['Solar (KWh)'] || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">{(month['REB (KWh)'] || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">{(month['Diesel (Ltr)'] || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">{(month['GasBoiler (m3)'] || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right text-gray-700">{(month['GasGenerator (m3)'] || 0).toLocaleString()}</td>
                          <td className="px-4 py-3 text-sm text-right font-semibold text-blue-600">{month.totalEnergy.toFixed(2)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
};

export default EnergyDashboard;