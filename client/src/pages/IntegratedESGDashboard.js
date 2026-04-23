import React, { useState, useEffect } from 'react';
import { Upload, LayoutGrid, Beaker, FileText, Activity, Droplets, Trash2, Users, Shield, TrendingUp, AlertCircle } from 'lucide-react';
import RGL, { WidthProvider } from 'react-grid-layout';
import 'react-grid-layout/css/styles.css';
import 'react-resizable/css/styles.css';

const ReactGridLayout = WidthProvider(RGL);

// Main Integrated Dashboard
const IntegratedESGDashboard = () => {
  const [currentView, setCurrentView] = useState('main'); // main, emissions, water, waste
  const [widgets, setWidgets] = useState([
    { i: 'scope1', x: 0, y: 0, w: 3, h: 2, title: 'Scope 1', value: 12383, unit: 't CO₂e', color: '#EF4444' },
    { i: 'scope2', x: 3, y: 0, w: 3, h: 2, title: 'Scope 2', value: 3216703, unit: 't CO₂e', color: '#3B82F6' },
    { i: 'scope3', x: 6, y: 0, w: 3, h: 2, title: 'Scope 3', value: 0, unit: 't CO₂e', color: '#10B981' },
    { i: 'total', x: 9, y: 0, w: 3, h: 2, title: 'Total', value: 3229086, unit: 't CO₂e', color: '#8B5CF6' }
  ]);

  // Dashboard Navigation Menu
  const DashboardMenu = () => (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-800">ESG Dashboard</h2>
        <div className="flex gap-3">
          <button
            onClick={() => setCurrentView('main')}
            className={`px-4 py-2 rounded-lg font-medium transition ${
              currentView === 'main'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setCurrentView('emissions')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              currentView === 'emissions'
                ? 'bg-red-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Emissions
          </button>
          <button
            onClick={() => setCurrentView('water')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              currentView === 'water'
                ? 'bg-blue-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Droplets className="w-4 h-4" />
            Water
          </button>
          <button
            onClick={() => setCurrentView('waste')}
            className={`px-4 py-2 rounded-lg font-medium transition flex items-center gap-2 ${
              currentView === 'waste'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Waste
          </button>
          <button
            disabled
            className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-400 cursor-not-allowed flex items-center gap-2"
            title="Coming Soon"
          >
            <Users className="w-4 h-4" />
            Social
            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">Soon</span>
          </button>
          <button
            disabled
            className="px-4 py-2 rounded-lg font-medium bg-gray-100 text-gray-400 cursor-not-allowed flex items-center gap-2"
            title="Coming Soon"
          >
            <Shield className="w-4 h-4" />
            Governance
            <span className="text-xs bg-yellow-200 text-yellow-800 px-2 py-0.5 rounded-full">Soon</span>
          </button>
        </div>
      </div>
    </div>
  );

  // Widget Component
  const Widget = ({ id, title, value, unit, color }) => (
    <div 
      className="h-full rounded-xl shadow-lg p-6 relative overflow-hidden"
      style={{ backgroundColor: color }}
    >
      <h3 className="text-white font-semibold text-lg mb-4">{title}</h3>
      <div className="flex flex-col justify-center h-2/3">
        <div className="text-5xl font-bold text-white mb-2">
          {value.toLocaleString()}
        </div>
        <div className="text-xl text-white/90">{unit}</div>
      </div>
      <div className="absolute bottom-2 right-2 text-white/30">
        <LayoutGrid className="w-4 h-4" />
      </div>
    </div>
  );

  // Main Overview
  const MainDashboard = () => (
    <div>
      {/* Widgets Grid */}
      <ReactGridLayout
        className="layout"
        layout={widgets}
        cols={12}
        rowHeight={100}
        isDraggable={true}
        isResizable={true}
        draggableCancel=".no-drag"
      >
        {widgets.map((widget) => (
          <div key={widget.i}>
            <Widget
              id={widget.i}
              title={widget.title}
              value={widget.value}
              unit={widget.unit}
              color={widget.color}
            />
          </div>
        ))}
      </ReactGridLayout>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-8 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <FileText className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">Files Uploaded</p>
          <p className="text-3xl font-bold">12</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <Activity className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">ESG Score</p>
          <p className="text-3xl font-bold">78.5</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <Droplets className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">Water Usage</p>
          <p className="text-3xl font-bold">96,837 m³</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-3">
            <Trash2 className="w-8 h-8" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">Recycling Rate</p>
          <p className="text-3xl font-bold">62.3%</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 to-green-50 border-l-4 border-blue-500 rounded-lg p-6">
        <div className="flex items-start gap-3">
          <AlertCircle className="w-6 h-6 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-gray-900 mb-2">📊 Quick Start Guide</h3>
            <p className="text-sm text-gray-700 mb-3">
              Upload your CSV/Excel files to see detailed environmental analytics. Your data will automatically populate the dashboards.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-white/70 p-3 rounded">
                <strong className="text-blue-700">Energy Consumption:</strong> Upload REB (kWh), Diesel (L), NG (m³), Solar (kW) data
              </div>
              <div className="bg-white/70 p-3 rounded">
                <strong className="text-blue-700">Water Consumption:</strong> Source, consumption, discharge data
              </div>
              <div className="bg-white/70 p-3 rounded">
                <strong className="text-blue-700">Waste Management:</strong> Recyclable, hazardous, bio-solid waste
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Emissions Dashboard (Placeholder - would import your detailed component)
  const EmissionsDashboard = () => (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
        <Activity className="w-8 h-8 text-red-500" />
        Detailed Emissions Analysis
      </h2>
      <p className="text-gray-600 mb-6">Comprehensive GHG Protocol Scope 1, 2 & 3 breakdown with trends and targets</p>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-red-50 border-l-4 border-red-500 p-6 rounded-lg">
          <h4 className="font-bold text-gray-800 mb-2">Scope 1 (Direct)</h4>
          <p className="text-3xl font-bold text-red-600">{widgets[0].value.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-2">Diesel, Natural Gas, Generators</p>
        </div>
        
        <div className="bg-blue-50 border-l-4 border-blue-500 p-6 rounded-lg">
          <h4 className="font-bold text-gray-800 mb-2">Scope 2 (Energy)</h4>
          <p className="text-3xl font-bold text-blue-600">{widgets[1].value.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-2">Purchased Electricity (REB)</p>
        </div>
        
        <div className="bg-green-50 border-l-4 border-green-500 p-6 rounded-lg">
          <h4 className="font-bold text-gray-800 mb-2">Scope 3 (Indirect)</h4>
          <p className="text-3xl font-bold text-green-600">{widgets[2].value.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-2">Supply Chain, Waste, Transport</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-lg">
        <p className="text-center text-gray-600">
          📊 <strong>Your existing charts</strong> (Intensity, Comparison, Pie) will appear here when you integrate this design
        </p>
        <p className="text-center text-sm text-gray-500 mt-2">
          This layout preserves all your current functionality while applying the Zoho-inspired design
        </p>
      </div>
    </div>
  );

  // Water Dashboard Placeholder
  const WaterDashboard = () => (
    <div className="bg-white rounded-xl shadow-lg p-8">
      <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
        <Droplets className="w-8 h-8 text-blue-500" />
        Water Consumption Analysis
      </h2>
      <p className="text-gray-600 mb-6">Track water from extraction through usage to discharge (Sankey diagram)</p>
      
      <div className="grid grid-cols-4 gap-4 mb-8">
        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Ground Water</p>
          <p className="text-2xl font-bold text-blue-600">89,145 m³</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Rainwater</p>
          <p className="text-2xl font-bold text-green-600">3,672 m³</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Recycled</p>
          <p className="text-2xl font-bold text-purple-600">4,397 m³</p>
        </div>
        <div className="bg-orange-50 p-4 rounded-lg">
          <p className="text-sm text-gray-600 mb-1">Total</p>
          <p className="text-2xl font-bold text-orange-600">96,837 m³</p>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-lg">
        <p className="text-center text-gray-600">
          💧 <strong>Water Sankey Diagram</strong> will be displayed here with your actual data
        </p>
      </div>
    </div>
  );

   // Waste Dashboard Placeholder
   const WasteDashboard = () => (
     <div className="bg-white rounded-xl shadow-lg p-8">
       <h2 className="text-3xl font-bold text-gray-900 mb-4 flex items-center gap-3">
         <Trash2 className="w-8 h-8 text-orange-500" />
         Waste Management & Recycling
       </h2>
       <p className="text-gray-600 mb-6">Track waste generation, recycling rates, and disposal methods</p>
      
       <div className="grid grid-cols-4 gap-4 mb-8">
         <div className="bg-gray-100 p-4 rounded-lg">
           <p className="text-sm text-gray-600 mb-1">Total Waste</p>
           <p className="text-2xl font-bold text-gray-800">500,977 kg</p>
         </div>
         <div className="bg-green-50 p-4 rounded-lg">
           <p className="text-sm text-gray-600 mb-1">Recycled</p>
           <p className="text-2xl font-bold text-green-600">312,109 kg</p>
         </div>
         <div className="bg-orange-50 p-4 rounded-lg">
           <p className="text-sm text-gray-600 mb-1">Packaging</p>
           <p className="text-2xl font-bold text-orange-600">91,968 kg</p>
         </div>
         <div className="bg-blue-50 p-4 rounded-lg">
           <p className="text-sm text-gray-600 mb-1">Recycling Rate</p>
           <p className="text-2xl font-bold text-blue-600">62.3%</p>
         </div>
       </div>

       <div className="bg-gradient-to-r from-gray-100 to-gray-200 p-6 rounded-lg">
         <p className="text-center text-gray-600">
           ♻️ <strong>Waste breakdown charts</strong> (recycled, hazardous, bio-solid) will appear here
         </p>     </div>
     </div>
   );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 p-6">
      <DashboardMenu />
      
      {currentView === 'main' && <MainDashboard />}
      {currentView === 'emissions' && <EmissionsDashboard />}
      {currentView === 'water' && <WaterDashboard />}
     {/* {currentView === 'waste' && <WasteDashboard />}*/}
    </div>
  );
};

export default IntegratedESGDashboard;