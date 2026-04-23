import React, { useState } from 'react';
import { Activity, Droplets, Trash2, Users, Shield, TrendingUp, AlertCircle, FileText, LayoutGrid, Target, Award } from 'lucide-react';

const ESGDashboardLayout = () => {
  const [currentView, setCurrentView] = useState('main');

  // Navigation Menu
  const NavigationMenu = () => (
    <div className="bg-white rounded-xl shadow-lg p-4 mb-6 border-b-4 border-blue-500">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <div className="bg-gradient-to-br from-green-500 to-blue-600 p-2 rounded-lg">
              <Target className="w-8 h-8 text-white" />
            </div>
            ESG Dashboard System
          </h1>
          <div className="text-right">
            <p className="text-sm text-gray-500">Last Updated</p>
            <p className="font-semibold text-gray-900">Dec 6, 2025</p>
          </div>
        </div>
        
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={() => setCurrentView('main')}
            className={`px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 ${
              currentView === 'main'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <LayoutGrid className="w-4 h-4" />
            Overview
          </button>
          
          <button
            onClick={() => setCurrentView('emissions')}
            className={`px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 ${
              currentView === 'emissions'
                ? 'bg-red-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Activity className="w-4 h-4" />
            Emissions
          </button>
          
          <button
            onClick={() => setCurrentView('water')}
            className={`px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 ${
              currentView === 'water'
                ? 'bg-blue-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Droplets className="w-4 h-4" />
            Water
          </button>
          
          <button
            onClick={() => setCurrentView('waste')}
            className={`px-5 py-2.5 rounded-lg font-medium transition flex items-center gap-2 ${
              currentView === 'waste'
                ? 'bg-orange-500 text-white shadow-lg'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Waste
          </button>
          
          <div className="relative group">
            <button
              disabled
              className="px-5 py-2.5 rounded-lg font-medium bg-gray-50 text-gray-400 cursor-not-allowed flex items-center gap-2 border-2 border-dashed border-gray-300"
            >
              <Users className="w-4 h-4" />
              Social
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">Coming Soon</span>
            </button>
            <div className="hidden group-hover:block absolute top-full mt-2 bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap z-10">
              Social metrics dashboard under development
            </div>
          </div>
          
          <div className="relative group">
            <button
              disabled
              className="px-5 py-2.5 rounded-lg font-medium bg-gray-50 text-gray-400 cursor-not-allowed flex items-center gap-2 border-2 border-dashed border-gray-300"
            >
              <Shield className="w-4 h-4" />
              Governance
              <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-bold">Coming Soon</span>
            </button>
            <div className="hidden group-hover:block absolute top-full mt-2 bg-gray-800 text-white text-xs px-3 py-2 rounded shadow-lg whitespace-nowrap z-10">
              Governance metrics dashboard under development
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  // Widget Cards
  const WidgetCard = ({ title, value, unit, color, icon: Icon }) => (
    <div 
      className="rounded-xl shadow-lg p-6 relative overflow-hidden h-full"
      style={{ backgroundColor: color }}
    >
      <div className="absolute top-2 right-2 text-white/30">
        <Icon className="w-8 h-8" />
      </div>
      <h3 className="text-white/90 font-semibold text-sm mb-3">{title}</h3>
      <div className="mt-auto">
        <div className="text-4xl font-bold text-white mb-1">
          {typeof value === 'number' ? value.toLocaleString() : value}
        </div>
        <div className="text-lg text-white/80">{unit}</div>
      </div>
    </div>
  );

  // Main Dashboard View
  const MainOverview = () => (
    <div>
      {/* Top Scope Widgets */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <WidgetCard 
          title="Scope 1 Emissions"
          value={12383}
          unit="t CO₂e"
          color="#EF4444"
          icon={Activity}
        />
        <WidgetCard 
          title="Scope 2 Emissions"
          value={3216703}
          unit="t CO₂e"
          color="#3B82F6"
          icon={Activity}
        />
        <WidgetCard 
          title="Scope 3 Emissions"
          value={0}
          unit="t CO₂e"
          color="#10B981"
          icon={Activity}
        />
        <WidgetCard 
          title="Total Emissions"
          value={3229086}
          unit="t CO₂e"
          color="#8B5CF6"
          icon={Activity}
        />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-gradient-to-br from-blue-500 to-blue-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <FileText className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">Data Files</p>
          <p className="text-3xl font-bold">12</p>
          <p className="text-xs opacity-75 mt-2">CSV & Excel uploads</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Award className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">ESG Score</p>
          <p className="text-3xl font-bold">78.5</p>
          <p className="text-xs opacity-75 mt-2">Environmental focus</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Droplets className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">Water Usage</p>
          <p className="text-3xl font-bold">96,837</p>
          <p className="text-xs opacity-75 mt-2">m³ total consumption</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-700 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <Trash2 className="w-8 h-8 opacity-80" />
            <TrendingUp className="w-5 h-5" />
          </div>
          <p className="text-sm opacity-90 mb-1">Recycling</p>
          <p className="text-3xl font-bold">62.3%</p>
          <p className="text-xs opacity-75 mt-2">Waste diversion rate</p>
        </div>
      </div>

      {/* Info Banner */}
      <div className="bg-gradient-to-r from-blue-50 via-green-50 to-blue-50 border-l-4 border-blue-500 rounded-xl p-6 shadow-md">
        <div className="flex items-start gap-4">
          <AlertCircle className="w-7 h-7 text-blue-600 flex-shrink-0 mt-1" />
          <div className="flex-1">
            <h3 className="font-bold text-gray-900 text-lg mb-3">📊 Dashboard Integration Guide</h3>
            <p className="text-gray-700 mb-4">
              Your existing widgets, charts, and data will be integrated into this layout. Each section below shows where your components will appear.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
              <div className="bg-white p-4 rounded-lg border-l-4 border-red-500">
                <p className="font-bold text-gray-900 mb-1">🔴 Emissions Tab</p>
                <p className="text-sm text-gray-600">Intensity Chart, Scope Comparison, Pie Chart + your detailed Scope 3 dashboard</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-blue-500">
                <p className="font-bold text-gray-900 mb-1">💧 Water Tab</p>
                <p className="text-sm text-gray-600">Your existing Sankey diagram + consumption analytics</p>
              </div>
              <div className="bg-white p-4 rounded-lg border-l-4 border-orange-500">
                <p className="font-bold text-gray-900 mb-1">♻️ Waste Tab</p>
                <p className="text-sm text-gray-600">Recycling rates, waste breakdown charts, disposal methods</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Placeholder for Charts */}
      <div className="mt-8 bg-white rounded-xl shadow-lg p-8">
        <h3 className="text-2xl font-bold text-gray-800 mb-4">Your Existing Charts Display Here</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-lg border-2 border-dashed border-gray-300 text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">Scope Comparison Chart</p>
            <p className="text-sm text-gray-500 mt-1">Your existing BarChart component</p>
          </div>
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-8 rounded-lg border-2 border-dashed border-gray-300 text-center">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="font-semibold text-gray-700">Scope Pie Chart</p>
            <p className="text-sm text-gray-500 mt-1">Your existing PieChart component</p>
          </div>
        </div>
      </div>
    </div>
  );

  // Emissions View
  const EmissionsView = () => (
    <div>
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Activity className="w-8 h-8 text-red-500" />
          Emissions Dashboard
        </h2>
        <p className="text-gray-600 mb-6">Comprehensive GHG Protocol Scope 1, 2 & 3 Analysis</p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-gradient-to-br from-red-50 to-red-100 border-l-4 border-red-500 p-6 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-2">Scope 1 (Direct)</h4>
            <p className="text-4xl font-bold text-red-600 mb-2">12,383</p>
            <p className="text-sm text-gray-700">Diesel, NG, Generators</p>
          </div>
          
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 border-l-4 border-blue-500 p-6 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-2">Scope 2 (Energy)</h4>
            <p className="text-4xl font-bold text-blue-600 mb-2">3,216,703</p>
            <p className="text-sm text-gray-700">REB, Solar, Steam</p>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 border-l-4 border-green-500 p-6 rounded-lg">
            <h4 className="font-bold text-gray-800 mb-2">Scope 3 (Indirect)</h4>
            <p className="text-4xl font-bold text-green-600 mb-2">0</p>
            <p className="text-sm text-gray-700">Supply Chain & Waste</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-12 text-center shadow-inner">
        <Activity className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <p className="text-xl font-semibold text-gray-700 mb-2">Your Detailed Emissions Charts</p>
        <p className="text-gray-600">IntensityChart, ScopeComparisonChart, ScopePieChart components display here</p>
      </div>
    </div>
  );

  // Water View
  const WaterView = () => (
    <div>
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Droplets className="w-8 h-8 text-blue-500" />
          Water Dashboard
        </h2>
        <p className="text-gray-600 mb-6">Water extraction, usage, and discharge tracking</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-5 rounded-lg border-l-4 border-blue-500">
            <p className="text-sm text-gray-600 mb-1">Ground Water</p>
            <p className="text-2xl font-bold text-blue-600">89,145</p>
            <p className="text-xs text-gray-500 mt-1">m³</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Rainwater</p>
            <p className="text-2xl font-bold text-green-600">3,672</p>
            <p className="text-xs text-gray-500 mt-1">m³</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-5 rounded-lg border-l-4 border-purple-500">
            <p className="text-sm text-gray-600 mb-1">Recycled</p>
            <p className="text-2xl font-bold text-purple-600">4,397</p>
            <p className="text-xs text-gray-500 mt-1">m³</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-lg border-l-4 border-orange-500">
            <p className="text-sm text-gray-600 mb-1">Total</p>
            <p className="text-2xl font-bold text-orange-600">96,837</p>
            <p className="text-xs text-gray-500 mt-1">m³</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-12 text-center shadow-inner">
        <Droplets className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <p className="text-xl font-semibold text-gray-700 mb-2">Water Sankey Diagram</p>
        <p className="text-gray-600">Your WaterSankeyChart component displays here</p>
      </div>
    </div>
  );

  // Waste View
  const WasteView = () => (
    <div>
      <div className="bg-white rounded-xl shadow-lg p-8 mb-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
          <Trash2 className="w-8 h-8 text-orange-500" />
          Waste Dashboard
        </h2>
        <p className="text-gray-600 mb-6">Waste generation, recycling, and disposal tracking</p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 p-5 rounded-lg border-l-4 border-gray-500">
            <p className="text-sm text-gray-600 mb-1">Total Waste</p>
            <p className="text-2xl font-bold text-gray-700">500,977</p>
            <p className="text-xs text-gray-500 mt-1">kg</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-green-100 p-5 rounded-lg border-l-4 border-green-500">
            <p className="text-sm text-gray-600 mb-1">Recycled</p>
            <p className="text-2xl font-bold text-green-600">312,109</p>
            <p className="text-xs text-gray-500 mt-1">kg • 62.3%</p>
          </div>
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-5 rounded-lg border-l-4 border-orange-500">
            <p className="text-sm text-gray-600 mb-1">Packaging</p>
            <p className="text-2xl font-bold text-orange-600">91,968</p>
            <p className="text-xs text-gray-500 mt-1">kg</p>
          </div>
          <div className="bg-gradient-to-br from-red-50 to-red-100 p-5 rounded-lg border-l-4 border-red-500">
            <p className="text-sm text-gray-600 mb-1">Hazardous</p>
            <p className="text-2xl font-bold text-red-600">6,500</p>
            <p className="text-xs text-gray-500 mt-1">kg</p>
          </div>
        </div>
      </div>

      <div className="bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl p-12 text-center shadow-inner">
        <Trash2 className="w-16 h-16 text-gray-500 mx-auto mb-4" />
        <p className="text-xl font-semibold text-gray-700 mb-2">Waste Breakdown Charts</p>
        <p className="text-gray-600">Recycling rates, waste composition, disposal methods</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-green-50 p-6">
      <NavigationMenu />
      
      {currentView === 'main' && <MainOverview />}
      {currentView === 'emissions' && <EmissionsView />}
      {currentView === 'water' && <WaterView />}
      {currentView === 'waste' && <WasteView />}
    </div>
  );
};

export default ESGDashboardLayout;