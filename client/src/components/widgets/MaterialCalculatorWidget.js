// client/src/components/widgets/MaterialCalculatorWidget.js
import React, { useState, useEffect } from 'react';
import { Beaker } from 'lucide-react';
import { calculateMaterialEF, calculateFabricWeight } from '../../utils/efFactors';

const MaterialCalculatorWidget = () => {
  const [inputs, setInputs] = useState({
    materialMix: '',
    length: '',
    width: '',
    gsm: ''
  });
  
  const [results, setResults] = useState({
    weight: 0,
    ef: 0,
    breakdown: ''
  });

  const calculateEF = () => {
    const { materialMix, length, width, gsm } = inputs;
    
    if (!materialMix || !length || !width || !gsm) {
      return;
    }

    // Calculate weight in tons
    const weightTon = calculateFabricWeight(
      parseFloat(length),
      parseFloat(width),
      parseFloat(gsm)
    );

    // Parse material mix and calculate EF
    const materialResult = calculateMaterialEF(materialMix);
    
    if (!materialResult.success) {
      alert(materialResult.error);
      return;
    }

    // Calculate total EF
    const totalEF = weightTon * materialResult.ef;

    // Build breakdown text
    let breakdownText = '';
    materialResult.breakdown.forEach((item, idx) => {
      breakdownText += `${item.percentage}% ${item.material} (EF: ${item.ef}) = ${item.contribution.toFixed(2)}`;
      if (idx < materialResult.breakdown.length - 1) breakdownText += ' + ';
    });

    setResults({
      weight: weightTon,
      ef: totalEF,
      breakdown: breakdownText
    });
  };

  useEffect(() => {
    if (inputs.materialMix && inputs.length && inputs.width && inputs.gsm) {
      calculateEF();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inputs]);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center gap-2 mb-6">
        <Beaker className="w-6 h-6 text-purple-500" />
        <h3 className="text-xl font-bold text-gray-800">Material EF Calculator</h3>
      </div>

      <div className="space-y-4">
        {/* Material Mix Input */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Material Mix
          </label>
          <input
            type="text"
            value={inputs.materialMix}
            onChange={(e) => setInputs({...inputs, materialMix: e.target.value})}
            placeholder="e.g., 50%Cotton50%Nylon"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
          />
          <p className="text-xs text-gray-500 mt-1">Format: 50%Cotton50%Nylon</p>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Length (yard)
            </label>
            <input
              type="number"
              value={inputs.length}
              onChange={(e) => setInputs({...inputs, length: e.target.value})}
              placeholder="100"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Width (inch)
            </label>
            <input
              type="number"
              value={inputs.width}
              onChange={(e) => setInputs({...inputs, width: e.target.value})}
              placeholder="60"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              GSM
            </label>
            <input
              type="number"
              value={inputs.gsm}
              onChange={(e) => setInputs({...inputs, gsm: e.target.value})}
              placeholder="150"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 outline-none text-sm"
            />
          </div>
        </div>

        {/* Results */}
        {results.ef > 0 && (
          <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 mt-4">
            <div className="grid grid-cols-2 gap-4 mb-3">
              <div>
                <p className="text-xs text-gray-600">Weight</p>
                <p className="text-2xl font-bold text-purple-600">
                  {results.weight.toFixed(6)} ton
                </p>
              </div>
              <div>
                <p className="text-xs text-gray-600">Emission Factor</p>
                <p className="text-2xl font-bold text-purple-600">
                  {results.ef.toFixed(4)} t CO₂e
                </p>
              </div>
            </div>
            <div className="text-xs text-gray-600 bg-white p-2 rounded">
              <p className="font-semibold mb-1">Calculation:</p>
              <p className="break-words">{results.breakdown}</p>
              <p className="mt-1">Total EF: {results.ef.toFixed(4)}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default MaterialCalculatorWidget;