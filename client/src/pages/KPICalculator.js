// client/src/pages/KPICalculator.js
import React, { useState, useEffect } from 'react';
import { Calculator, Home, FileText, X, Save, Trash2, TrendingUp } from 'lucide-react';
import useFiles from '../hooks/useFiles';
import { useContext } from 'react';
import toast from 'react-hot-toast';
import { DataContext } from '../context/DataContext';
import { Header } from '../components/common';
import { parseFormula, validateFormula, getFormulaSuggestions } from '../utils/formulaParser';

const KPICalculator = ({ onBack }) => {
  const { allFiles } = useFiles();
  const { kpis, createKPI, deleteKPI } = useContext(DataContext);
  
  const [calculationType, setCalculationType] = useState('custom');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [selectedFile, setSelectedFile] = useState('');
  const [formula, setFormula] = useState('');
  const [customValues, setCustomValues] = useState({});
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');
  const [kpiName, setKpiName] = useState('');

  
  const kpiTemplates = [
    { 
      id: 'total_emissions', 
      name: 'Total Emissions (Year)', 
      description: 'Sum of all Total_Emissions column',
      formula: 'SUM({file}:Total_Emissions)'
    },
    { 
      id: 'scope1', 
      name: 'Total Scope 1', 
      description: 'Sum of all Scope 1 emissions',
      formula: 'SUM({file}:NG_Emissions) + SUM({file}:Diesel_Emissions) + SUM({file}:CNG_Emissions)'
    },
    { 
      id: 'scope2', 
      name: 'Total Scope 2', 
      description: 'Sum of all Scope 2 emissions (Energy)',
      formula: 'SUM({file}:REB_Emissions) + SUM({file}:Solar_Emissions)'
    },
    { 
      id: 'scope3', 
      name: 'Total Scope 3', 
      description: 'Sum of all Scope 3 emissions',
      formula: 'SUM({file}:Vehicle_Fuel) + SUM({file}:Waste_Emissions)'
    },
    { 
      id: 'emission_intensity', 
      name: 'Emission Intensity', 
      description: 'Total Emissions / Production',
      formula: 'SUM({file}:Total_Emissions) / SUM({file}:Production_KG)'
    },
    { 
      id: 'custom', 
      name: 'Custom Formula', 
      description: 'Create your own calculation like Excel'
    }
  ];

  const handleCalculate = () => {
    setError('');
    setResult(null);

    if (calculationType === 'custom') {
      if (!formula.trim()) {
        toast.error('Please enter a formula', { icon: '❌' });
        return;
      }

      const validation = validateFormula(formula);
      if (!validation.valid) {
        toast.error(validation.errors.join(', '), { icon: '❌', duration: 4000 });
        return;
      }

      try {
        const calculatedResult = parseFormula(formula, selectedFiles, customValues);
        setResult(calculatedResult);
        toast.success('Calculation successful!', { icon: '✅' });
      } catch (err) {
        toast.error(err.message || 'Calculation failed', { icon: '❌' });
      }
    } else {
      if (!selectedFile) {
        toast.error('Please select a file', { icon: '❌' });
        return;
      }

      const file = (allFiles || []).find(f => f.id === selectedFile);
      
      if (!file || !file.data) {
        toast.error('File data not found', { icon: '❌' });
        return;
      }

      try {
        let calculatedResult = 0;

        switch (calculationType) {
          case 'total_emissions':
            calculatedResult = calculateTotalEmissions(file.data);
            break;
          
          case 'scope1':
            calculatedResult = calculateScope1(file.data);
            break;
          
          case 'scope2':
            calculatedResult = calculateScope2(file.data);
            break;
          
          case 'scope3':
            calculatedResult = calculateScope3(file.data);
            break;
          
          case 'emission_intensity':
            calculatedResult = calculateEmissionIntensity(file.data);
            break;
          
          default:
            setError('Invalid calculation type');
            return;
        }

        setResult(calculatedResult);
        toast.success('Template calculation done!', { icon: '✅' });
      } catch (err) {
        toast.error(err.message || 'Calculation failed', { icon: '❌' });
      }
    }
  };

  // Calculate Total Emissions
  const calculateTotalEmissions = (data) => {
    let total = 0;
    (data || []).forEach(row => {
      const totalEmission = parseFloat(row['Total_Emissions']) || 0;
      total += totalEmission;
    });
    return total;
  };

  // Calculate Scope 1
  const calculateScope1 = (data) => {
    let total = 0;
    (data || []).forEach(row => {
      const ng = parseFloat(row['NG_Emissions']) || 0;
      const diesel = parseFloat(row['Diesel_Emissions']) || 0;
      const cng = parseFloat(row['CNG_Emissions']) || 0;
      total += ng + diesel + cng;
    });
    return total;
  };

  // Calculate Scope 2
  const calculateScope2 = (data) => {
    let total = 0;
    (data || []).forEach(row => {
      const reb = parseFloat(row['REB_Emissions']) || 0;
      const solar = parseFloat(row['Solar_Emissions']) || 0;
      total += reb + solar;
    });
    return total;
  };

  // Calculate Scope 3
  const calculateScope3 = (data) => {
    let total = 0;
    (data || []).forEach(row => {
      const vehicle = parseFloat(row['Vehicle_Fuel']) || 0;
      const waste = parseFloat(row['Waste_Emissions']) || 0;
      total += vehicle + waste;
    });
    return total;
  };

  // Calculate Emission Intensity
  const calculateEmissionIntensity = (data) => {
    let totalEmissions = 0;
    let totalProduction = 0;
    
    (data || []).forEach(row => {
      totalEmissions += parseFloat(row['Total_Emissions']) || 0;
      totalProduction += parseFloat(row['Production_KG']) || parseFloat(row['Production_PCS']) || parseFloat(row['Production_USD']) || 0;
    });
    
    if (totalProduction === 0) {
      throw new Error('No production data found');
    }
    
    return totalEmissions / totalProduction;
  };

  const handleSaveKPI = async () => {
    if (result === null) {
      toast.error('Calculate a result first', { icon: '❌' });
      return;
    }

    if (!kpiName.trim) { //-->remove .trim pore
      toast('Enter KPI name', { icon: 'ℹ️' });
      return;
      // const name = prompt('Enter KPI name:');
      // if (!name) return;
      // setKpiName(name);
    }

    const kpiResult = await createKPI({
      name: kpiName || 'Unnamed KPI',
      formula,
      result,
      date: new Date().toLocaleDateString()
    });

    if (kpiResult.success) {
      toast.success('KPI saved successfully!', { icon: '💾' });
        setKpiName('');
      } else {
        toast.error(kpiResult.error || 'Failed to save KPI', { icon: '❌' });
      }
    // } catch (err) {
    //   toast.error('Error saving KPI', { icon: '❌' });
    // }
  };

  const handleDeleteKPI = async (id) => {
    if (window.confirm('Delete this KPI?')) {
      try {
        await deleteKPI(id);
        toast.success('KPI deleted successfully', { icon: '🗑️' });
      } catch (err) {
        toast.error('Failed to delete KPI', { icon: '❌' });
      }
    }
  };

  const handleAddCustomValue = () => {
    const nameInput = document.getElementById('customVarName');
    const valueInput = document.getElementById('customVarValue');
    
    if (!nameInput.value.trim()) {
      toast.error('Variable name is required', { icon: '❌' });
      return;
    }
    if (!valueInput.value.trim()) {
      toast.error('Value is required', { icon: '❌' });
      return;
    }
    setCustomValues({
      ...customValues,
      [nameInput.value.trim()]: valueInput.value.trim()
    });
    nameInput.value = '';
    valueInput.value = '';
    toast.success('Custom value added', { icon: '➕' });
  };

  const handleRemoveCustomValue = (key) => {
    const newValues = { ...customValues };
    delete newValues[key];
    setCustomValues(newValues);
    toast.success('Custom value removed', { icon: '🗑️' });
  };

  const suggestions = getFormulaSuggestions(selectedFiles);

  const headerActions = [
    {
      label: 'Back to Dashboard',
      icon: Home,
      className: 'px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition flex items-center gap-2',
      onClick: onBack
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        title="KPI Calculator"
        subtitle="Excel-like formulas with automatic scope calculations"
        showMenu={false}
        actions={headerActions}
      />

      <main className="p-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Left Column - Input */}
          <div className="space-y-6">
            {/* Calculation Type Selection */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Select Calculation Type</h2>
              
              <div className="grid grid-cols-1 gap-3">
                {kpiTemplates.map(template => (
                  <button
                    key={template.id}
                    onClick={() => {
                      setCalculationType(template.id);
                      setKpiName(template.name);
                      if (template.formula) setFormula(template.formula);
                    }}
                    className={`p-4 rounded-lg border-2 text-left transition ${
                      calculationType === template.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-orange-300'
                    }`}
                  >
                    <div className="font-semibold text-gray-800">{template.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{template.description}</div>
                    {template.formula && (
                      <div className="text-xs font-mono text-gray-500 mt-2 bg-white p-2 rounded">
                        {template.formula}
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* File Selection for Templates */}
            {calculationType !== 'custom' && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-lg font-bold text-gray-800 mb-4">Select Data File</h2>
                
                <select
                  value={selectedFile}
                  onChange={(e) => setSelectedFile(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
                >
                  <option value="">Choose a file...</option>
                  {(allFiles || []).filter(f => f.type === 'file').map(file => (
                    <option key={file.id} value={file.id}>{file.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Custom Formula Section */}
            {calculationType === 'custom' && (
              <>
                {/* Select Files */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Select Files</h2>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {(allFiles || []).map(file => (
                      <label key={file.id} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedFiles.some(f => f.id === file.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedFiles([...selectedFiles, file]);
                            } else {
                              setSelectedFiles(selectedFiles.filter(f => f.id !== file.id));
                            }
                          }}
                          className="w-4 h-4 text-orange-500"
                        />
                        <FileText className="w-4 h-4 text-green-500" />
                        <span className="text-sm text-gray-700">{file.name}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Formula Builder */}
                <div className="bg-white rounded-lg shadow-lg p-6">
                  <h2 className="text-lg font-bold text-gray-800 mb-4">Formula Builder</h2>
                  
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Formula</label>
                    <textarea
                      value={formula}
                      onChange={(e) => setFormula(e.target.value)}
                      placeholder="e.g., SUM(File1:A1:A10) + 1.63*AVG(File2:B2:B5) or =GHG_RawData!M3/B3"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm font-mono"
                      rows={4}
                    />
                    {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
                  </div>

                  {/* Custom Values */}
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">Custom Values</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder="Variable name (e.g., factor1)"
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                        id="customVarName"
                      />
                      <input
                        type="number"
                        placeholder="Value"
                        className="w-24 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none text-sm"
                        id="customVarValue"
                      />
                      <button
                        onClick={handleAddCustomValue}
                        className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                      >
                        Add
                      </button>
                    </div>
                    
                    <div className="mt-2 space-y-1">
                      {Object.entries(customValues).map(([key, value]) => (
                        <div key={key} className="flex items-center justify-between bg-gray-50 p-2 rounded">
                          <span className="text-sm text-gray-700">{key} = {value}</span>
                          <button
                            onClick={() => handleRemoveCustomValue(key)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Formula Examples */}
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-800">
                    <strong>📝 Formula Examples:</strong><br/>
                    {suggestions.map((s, i) => (
                      <span key={i}>
                        • {s.formula} - {s.description}<br/>
                      </span>
                    ))}
                  </p>
                </div>
              </>
            )}

            {/* KPI Name */}
            <div className="bg-white rounded-lg shadow-lg p-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                KPI Name
              </label>
              <input
                type="text"
                value={kpiName}
                onChange={(e) => setKpiName(e.target.value)}
                placeholder="e.g., Total Emissions 2025"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 outline-none"
              />
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <button
                onClick={handleCalculate}
                className="flex-1 px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition font-semibold flex items-center justify-center gap-2"
              >
                <Calculator className="w-4 h-4" />
                Calculate
              </button>
              {result !== null && (
                <button
                  onClick={handleSaveKPI}
                  className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
                >
                  <Save className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Result */}
            {result !== null && (
              <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                <p className="text-sm text-gray-600 mb-1">Result:</p>
                <p className="text-3xl font-bold text-orange-600">
                  {typeof result === 'number' ? result.toFixed(4) : result}
                </p>
                <p className="text-sm text-gray-600 mt-1">t CO₂e</p>
              </div>
            )}
          </div>

          {/* Right Column - Saved KPIs */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Saved KPIs</h2>
            
            {!kpis || kpis.length === 0 ? (
              <div className="text-center py-12">
                <TrendingUp className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No saved KPIs yet</p>
                <p className="text-sm text-gray-400">Calculate and save your first KPI</p>
              </div>
            ) : (
              <div className="space-y-3">
                {(kpis || []).map(kpi => (
                  <div key={kpi.id} className="bg-gray-50 rounded-lg p-4 relative group">
                    <button
                      onClick={() => handleDeleteKPI(kpi.id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <h3 className="font-semibold text-gray-800 mb-2">{kpi.name}</h3>
                    <p className="text-xs text-gray-500 mb-2">Date: {kpi.date}</p>
                    {kpi.formula && (
                      <p className="text-xs text-gray-600 mb-2 font-mono bg-white p-2 rounded break-all">{kpi.formula}</p>
                    )}
                    <p className="text-2xl font-bold text-orange-600">
                      {typeof kpi.result === 'number' ? kpi.result.toFixed(4) : kpi.result}
                      <span className="text-sm ml-1">t CO₂e</span>
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default KPICalculator;