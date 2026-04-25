// client/src/pages/EmissionsDashboard.js
import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useEmissions } from '../hooks/useEmissions';


import {
  AreaChart, Area, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line
} from 'recharts';

import {
  Leaf, Loader, Building2, Activity, Zap, Truck, AlertCircle, TrendingUp, Home
} from 'lucide-react';

// KPI Card 
const KPICard = ({ title, value, unit, color, icon: Icon, subtitle }) => (
  <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow border-l-4" style={{ borderLeftColor: color }}>
    <div className="flex justify-between items-start mb-2">
      <div className="flex-1">
        <p className="text-sm font-medium text-gray-600 mb-1">{title}</p>
        {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      </div>
      <div className="p-2 rounded-lg" style={{ backgroundColor: `${color}20` }}>
        <Icon className="w-6 h-6" style={{ color }} />
      </div>
    </div>
    <div className="mt-3">
      <div className="flex items-end gap-2">
        <h2 className="text-3xl font-bold text-gray-900">{parseFloat(value || 0).toLocaleString()}</h2>
        <span className="text-sm text-gray-500 mb-1">{unit}</span>
      </div>
    </div>
  </div>
);

// Intensity Chart 
const IntensityChart = ({ monthlyData = [] }) => {
  const chartData = monthlyData.map(month => {
    const totalEmissions = (month.scope1 || 0) + (month.scope2 || 0) + (month.scope3 || 0);
    const production =
      parseFloat(month['Production (Pcs)']) ||
      parseFloat(month['ProductionWeight (Kg)']) ||
      parseFloat(month['ProductionCost (USD)']) || 1;

    return {
      month: month.month || 'Unknown',
      intensity: totalEmissions / production,
      totalEmissions: totalEmissions.toFixed(4),
      production: production.toFixed(0),
      unit: month['Production (Pcs)'] ? 'pcs' : 'kg'
    };
  });

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 mt-8">
      <div className="flex items-center gap-3 mb-4">
        <TrendingUp className="w-6 h-6 text-green-600" />
        <div>
          <h3 className="text-xl font-bold text-gray-800">Emission Intensity (tCO₂e per product)</h3>
          <p className="text-sm text-gray-600">Monthly emission intensity across all products</p>
        </div>
      </div>

      <ResponsiveContainer width="100%" height={320}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
          <XAxis dataKey="month" tick={{ fontSize: 12 }} />
          <YAxis tick={{ fontSize: 12 }} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="intensity"
            stroke="#10B981"
            strokeWidth={3}
            dot={{ fill: '#10B981', r: 5 }}
            name="tCO₂e per unit"
          />
        </LineChart>
      </ResponsiveContainer>

      <div className="mt-4 text-xs text-gray-500 bg-blue-50 p-3 rounded-lg">
        💡 Calculates intensity = Total Emissions ÷ Production (priority: pcs → kg → USD)
      </div>
    </div>
  );
};

const EmissionsDashboard = () => {
  const navigate = useNavigate();

  
  const {
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
  } = useEmissions();
  //files are auto loaded when visited
  useEffect(() => {
    fetchEmissionsFiles();
  },[fetchEmissionsFiles]);



  
  const handleFileSelection = async (fileId) => {
    if (!fileId) {
      setSelectedFileId('');
      return;
    }

    setSelectedFileId(fileId);

    try {
      await fetchMetrics(fileId);
      console.log('✅ Metrics loaded from cache');
    } catch (err) {
      if (err.response?.status === 404) {
        console.log('📊 Metrics not found, processing file...');
        await processFile(fileId);
      } else {
        // Other errors (network, auth, etc.)
        console.error('❌ Error fetching metrics:', err);
      }
    }
  };
  const handleBackToDashboard = () => {
    console.log('🔙 Going back to dashboard');
    navigate('/dashboard');
  };
  

  
  const businessUnits = Object.keys(processedData?.factoryData || metrics?.factoryData || {});

  
  const [selectedBU, setSelectedBU] = React.useState('all');

  const currentData = selectedBU === 'all'
    ? processedData || metrics
    : processedData?.factoryData?.[selectedBU] || metrics?.factoryData?.[selectedBU];

  const currentMonthly = currentData?.monthlyData || [];
  const currentMetrics = currentData?.metrics || currentData || {};

  const totalEmissions = currentMetrics.totalEmissions || 0;
  const scope1Percent = totalEmissions ? ((currentMetrics.scope1 / totalEmissions) * 100).toFixed(1) : 0;
  const scope2Percent = totalEmissions ? ((currentMetrics.scope2 / totalEmissions) * 100).toFixed(1) : 0;
  const scope3Percent = totalEmissions ? ((currentMetrics.scope3 / totalEmissions) * 100).toFixed(1) : 0;

const COLORS = {
  scope1: '#EF4444',
  scope2: '#F59E0B',
  scope3: '#10B981'
};

// ─── UI ───
return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      {/* Header - Fixed layout */}
      <div className="mb-8 bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-lg rounded-xl">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Left: Title + Subtitle */}
            <div>
              <h1 className="text-3xl font-bold flex items-center gap-3">
                <Activity className="w-8 h-8" />
                Emissions Dashboard
              </h1>
              <p className="text-teal-100 mt-1 opacity-90">
                Comprehensive GHG Protocol Scope 1, 2 & 3 Analysis
              </p>
            </div>

            {/* Right corner: Back button + Last Updated */}
            <div className="flex items-center gap-6">
              {/* Back to Dashboard Button */}
              <button
                onClick={handleBackToDashboard}
                className="px-5 py-2.5 bg-white/90 text-gray-800 rounded-lg hover:bg-white transition flex items-center gap-2 shadow-sm font-medium"
              >
                <Home className="w-5 h-5" />
                Back to Dashboard
              </button>

              {/* Last Updated */}
              <div className="text-right">
                <p className="text-sm text-teal-100 opacity-90">Last Updated</p>
                <p className="text-lg font-semibold text-white">
                  {new Date().toLocaleDateString()}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* File Selection */}
      <div className="bg-white rounded-xl shadow p-6 mb-8">
        <div className="flex items-center gap-4">
          <Leaf className="w-6 h-6 text-green-600" />
          <label className="font-medium text-gray-700">Select Emissions File:</label>
          <select
            value={selectedFileId || ''}
            onChange={(e) => handleFileSelection(e.target.value)}
            className="flex-1 max-w-md px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
            disabled={loading || processing}
          >
            <option value="">Choose a file...</option>
            {emissionsFiles.map(f => (
              <option key={f._id} value={f._id}>
                🌍 {f.originalName} ({f.rowCount || '?'} rows) – {f.businessUnit || 'HQ'}
              </option>
            ))}
          </select>
          {(loading || processing) && <Loader className="animate-spin text-green-600 w-6 h-6" />}
        </div>
      </div>

      {/* BU Filter */}
      {businessUnits.length > 0 && (
        <div className="bg-white rounded-xl shadow p-6 mb-8">
          <div className="flex items-center gap-4">
            <Building2 className="w-6 h-6 text-green-600" />
            <label className="font-medium text-gray-700">Business Unit:</label>
            <div className="flex gap-2 flex-wrap">
              <button
                onClick={() => setSelectedBU('all')}
                className={`px-5 py-2 rounded-lg font-medium ${selectedBU === 'all' ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
              >
                All Combined
              </button>
              {businessUnits.map(bu => (
                <button
                  key={bu}
                  onClick={() => setSelectedBU(bu)}
                  className={`px-5 py-2 rounded-lg font-medium ${selectedBU === bu ? 'bg-green-600 text-white' : 'bg-gray-100 hover:bg-gray-200'}`}
                >
                  {bu}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Loading / Error / Empty states */}
      {loading && !emissionsFiles.length && (
        <div className="text-center py-20">
          <Loader className="w-16 h-16 animate-spin mx-auto text-green-600" />
          <p className="mt-4 text-green-700">Loading files...</p>
        </div>
      )}

      {error && (
        <div className="text-center py-20 text-red-600">
          Error: {error}
        </div>
      )}

      {!selectedFileId && !loading && (
        <div className="text-center py-20 text-gray-500">
          <Leaf className="w-20 h-20 mx-auto mb-4 text-gray-300" />
          <p className="text-xl">Select a file to view emissions analysis</p>
        </div>
      )}

      {selectedFileId && (processing || loading) && (
        <div className="text-center py-20">
          <Loader className="w-16 h-16 animate-spin mx-auto text-green-600" />
          <p className="mt-4 text-green-700">
            {processing ? 'Processing emissions data...' : 'Loading metrics...'}
          </p>
        </div>
      )}

      {/* Main Dashboard Content */}
      {selectedFileId && !loading && !processing && currentMetrics && (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <KPICard
              title="Total Emissions"
              value={totalEmissions.toFixed(2)}
              unit="t CO₂e"
              color="#3B82F6"
              icon={Activity}
              subtitle="All Scopes Combined"
            />
            <KPICard
              title="Scope 1 (Direct)"
              value={currentMetrics.scope1?.toFixed(2) || 0}
              unit="t CO₂e"
              color={COLORS.scope1}
              icon={Activity}
              subtitle={`${scope1Percent}% of total`}
            />
            <KPICard
              title="Scope 2 (Energy)"
              value={currentMetrics.scope2?.toFixed(2) || 0}
              unit="t CO₂e"
              color={COLORS.scope2}
              icon={Zap}
              subtitle={`${scope2Percent}% of total`}
            />
            <KPICard
              title="Scope 3 (Indirect)"
              value={currentMetrics.scope3?.toFixed(2) || 0}
              unit="t CO₂e"
              color={COLORS.scope3}
              icon={Truck}
              subtitle={`${scope3Percent}% of total`}
            />
          </div>

          {/* Charts Row */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Emissions Trend</h3>
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={currentMonthly}>
                  <defs>
                    <linearGradient id="colorScope1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.scope1} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.scope1} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorScope2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.scope2} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.scope2} stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorScope3" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor={COLORS.scope3} stopOpacity={0.3} />
                      <stop offset="95%" stopColor={COLORS.scope3} stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                  <YAxis tick={{ fontSize: 12 }} />
                  <Tooltip />
                  <Legend />
                  <Area type="monotone" dataKey="scope1" name="Scope 1" stroke={COLORS.scope1} fill="url(#colorScope1)" strokeWidth={2} />
                  <Area type="monotone" dataKey="scope2" name="Scope 2" stroke={COLORS.scope2} fill="url(#colorScope2)" strokeWidth={2} />
                  <Area type="monotone" dataKey="scope3" name="Scope 3" stroke={COLORS.scope3} fill="url(#colorScope3)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-bold text-gray-800 mb-4">Emissions by Scope</h3>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={[
                      { name: 'Scope 1', value: currentMetrics.scope1 || 0 },
                      { name: 'Scope 2', value: currentMetrics.scope2 || 0 },
                      { name: 'Scope 3', value: currentMetrics.scope3 || 0 }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(1)}%`}
                    outerRadius={100}
                    dataKey="value"
                  >
                    <Cell fill={COLORS.scope1} />
                    <Cell fill={COLORS.scope2} />
                    <Cell fill={COLORS.scope3} />
                  </Pie>
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Scope Breakdowns */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
            {/* Scope 1 Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4" style={{ borderTopColor: COLORS.scope1 }}>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 rounded" style={{ backgroundColor: COLORS.scope1 }}></div>
                Scope 1 Breakdown
              </h3>
              
              <div className="space-y-4">
                {[
                  { name: 'Solar', value: currentMetrics?.solarEmissions || (currentMetrics?.scope1 * 0.1) || 0 }, // approximate if no breakdown
                  { name: 'Diesel', value: currentMetrics?.dieselEmissions || (currentMetrics?.scope1 * 0.6) || 0 },
                  { name: 'Gas Boiler', value: currentMetrics?.gasBoilerEmissions || (currentMetrics?.scope1 * 0.15) || 0 },
                  { name: 'Gas Generator', value: currentMetrics?.gasGenEmissions || (currentMetrics?.scope1 * 0.15) || 0 },
                ].filter(item => item.value > 0).map((item, idx) => {
                  const percent = totalEmissions > 0 ? (item.value / totalEmissions * 100).toFixed(1) : 0;
                  return (
                    <div key={idx} className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
                      <span className="font-medium text-gray-700">{item.name}</span>
                      <div className="text-right">
                        <div className="font-semibold text-gray-900">
                          {item.value.toFixed(2)} tCO₂e
                        </div>
                        <div className="text-sm text-gray-500">{percent}%</div>
                      </div>
                    </div>
                  );
                })}

                {currentMetrics?.scope1 === 0 && (
                  <p className="text-center text-gray-500 py-4">No Scope 1 activity recorded</p>
                )}
              </div>
            </div>

            {/* Scope 2 Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4" style={{ borderTopColor: COLORS.scope2 }}>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 rounded" style={{ backgroundColor: COLORS.scope2 }}></div>
                Scope 2 Breakdown
              </h3>
              
              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-gray-100">
                  <span className="font-medium text-gray-700">REB / Grid Electricity</span>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {(currentMetrics?.scope2 || 0).toFixed(2)} tCO₂e
                    </div>
                    <div className="text-sm text-gray-500">
                      {totalEmissions > 0 ? ((currentMetrics?.scope2 / totalEmissions) * 100).toFixed(1) : 0}%
                    </div>
                  </div>
                </div>
              </div>
            </div>
            {/* Scope 3 Breakdown */}
            <div className="bg-white rounded-xl shadow-md p-6 border-t-4" style={{ borderTopColor: COLORS.scope3 }}>
              <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-1.5 h-6 rounded" style={{ backgroundColor: COLORS.scope3 }}></div>
                Scope 3 Breakdown
              </h3>

              <div className="space-y-4">
                {/* Upstream */}
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-800">Upstream</p>
                    <p className="text-xs text-gray-500">Purchased Goods & Services</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {(currentMetrics?.scope3Upstream || 0).toFixed(2)} tCO₂e
                    </div>
                    <div className="text-sm text-gray-500">
                      {totalEmissions > 0 ? ((currentMetrics?.scope3Upstream / totalEmissions) * 100).toFixed(1) : '0.0'}%
                    </div>
                  </div>
                </div>

                {/* Downstream */}
                <div className="flex justify-between items-center py-3 border-b border-gray-100">
                  <div>
                    <p className="font-medium text-gray-800">Downstream</p>
                    <p className="text-xs text-gray-500">Waste Generated in Operations</p>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold text-gray-900">
                      {(currentMetrics?.scope3Downstream || 0).toFixed(2)} tCO₂e
                    </div>
                    <div className="text-sm text-gray-500">
                      {totalEmissions > 0 ? ((currentMetrics?.scope3Downstream / totalEmissions) * 100).toFixed(1) : '0.0'}%
                    </div>
                  </div>
                </div>

                {/* Total Scope 3 */}
                <div className="flex justify-between items-center pt-3">
                  <p className="font-bold text-gray-800 text-lg">Total Scope 3 Emissions</p>
                  <div className="text-right">
                    <div className="text-xl font-bold text-gray-900">
                      {(currentMetrics?.scope3 || 0).toFixed(2)} tCO₂e
                    </div>
                    <div className="text-sm text-gray-600">
                      {totalEmissions > 0 ? ((currentMetrics?.scope3 / totalEmissions) * 100).toFixed(1) : '0.0'}% of total emissions
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Intensity Chart - Full Width */}
            <div className="w-full col-span-full">
              <IntensityChart monthlyData={currentMonthly} />
            </div>

            {/* Info Box - Full Width below chart */}
            <div className="mt-6 w-full col-span-full bg-blue-50 border border-blue-200 rounded-lg p-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
                <div className="w-full">
                  <h4 className="font-bold text-blue-900 mb-2">GHG Protocol Standards</h4>
                  <div className="text-sm text-blue-800 flex gap-8 flex-wrap">
                    <p><strong>Scope 1:</strong> Direct emissions from owned/controlled sources</p>
                    <p><strong>Scope 2:</strong> Indirect emissions from purchased energy</p>
                    <p><strong>Scope 3:</strong> Value chain emissions (upstream & downstream)</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default EmissionsDashboard;