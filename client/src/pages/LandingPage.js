// client/src/pages/LandingPage.js
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Leaf, Upload, Calculator, MessageSquare } from 'lucide-react';

const LandingPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Background with overlay */}
      <div 
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage: 'url(https://images.unsplash.com/photo-1441974231531-c6227db76b6e?q=80&w=2000)',
        }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-green-900/80 via-green-800/70 to-green-900/80"></div>
      </div>

      <div className="relative z-10">
        {/* Header */}
        <header className="flex justify-between items-center px-8 py-6">
          <div className="flex items-center gap-2 text-white">
            <div className="bg-emerald-500 rounded-full p-2">
              <Leaf className="w-6 h-6" />
            </div>
            <span className="text-xl font-bold">ESG Report Generator</span>
          </div>
          <div className="flex gap-4">
            <button 
              onClick={() => navigate('/signin')}
              className="px-6 py-2 text-white border-2 border-white rounded-lg hover:bg-white/10 transition font-medium"
            >
              Sign In
            </button>
            <button 
              onClick={() => navigate('/signup')}
              className="px-6 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition font-medium"
            >
              Create Account
            </button>
          </div>
        </header>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center px-8 py-32 text-center">
          <h1 className="text-6xl font-bold text-white mb-6 max-w-4xl leading-tight">
            Professional ESG Reporting Made Simple
          </h1>
          <p className="text-xl text-white/90 mb-12 max-w-3xl leading-relaxed">
            Create comprehensive Environmental, Social, and Governance reports
            following GRI standards with powerful tools for data analysis, KPI
            calculations, and AI-assisted insights.
          </p>
          <button 
            onClick={() => navigate('/signup')}
            className="px-10 py-4 bg-emerald-500 text-white text-lg rounded-lg hover:bg-emerald-600 transition transform hover:scale-105 font-semibold shadow-lg"
          >
            Get Started
          </button>
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 px-8 pb-20 max-w-6xl mx-auto">
          <div className="bg-green-900/40 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-green-800/50 transition">
            <div className="bg-emerald-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Upload className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">Data Management</h3>
            <p className="text-white/80 text-lg leading-relaxed">
              Upload and organize CSV files, create folders, and manage your ESG data efficiently.
            </p>
          </div>

          <div className="bg-green-900/40 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-green-800/50 transition">
            <div className="bg-emerald-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <Calculator className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">KPI Calculator</h3>
            <p className="text-white/80 text-lg leading-relaxed">
              Flexible calculations across multiple datasets with Excel-like formulas and custom values.
            </p>
          </div>

          <div className="bg-green-900/40 backdrop-blur-sm border border-white/20 rounded-2xl p-8 hover:bg-green-800/50 transition">
            <div className="bg-emerald-500/20 w-14 h-14 rounded-xl flex items-center justify-center mb-6">
              <MessageSquare className="w-7 h-7 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-3">AI Assistant</h3>
            <p className="text-white/80 text-lg leading-relaxed">
              Get intelligent insights and assistance powered by advanced AI technology.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;