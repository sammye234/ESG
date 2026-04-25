// client/src/components/charts/WaterSankeyChart.js
import React, { useMemo } from 'react';
import { 
  Sankey, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';

const WaterSankeyChart = ({ waterData }) => {
  const data = useMemo(() => {
    if (!waterData) {
      return { nodes: [], links: [], totals: { totalSource: 0, totalConsumption: 0, totalOutput: 0 } };
    }

    // Use the metrics object (works for both combined and per-BU)
    const groundWater = waterData.totalGroundWater || 0;
    const rainwater = waterData.totalRainwater || 0;
    const recycled = waterData.totalRecycled || 0;
    const boilerWater = waterData.totalBoilerWater || 0;
    const domestic = waterData.totalDomestic || 0;
    const wtpBackwash = waterData.totalWTPBackwash || 0;
    const nonContactCooling = waterData.totalNonContactCooling || 0;

    // Note: We don't use totalProcessLoss/treatment/discharge from data anymore
    // We'll calculate outputs based on realistic assumptions per consumption type

    const totalSource = groundWater + rainwater + recycled;
    const totalConsumption = boilerWater + domestic + wtpBackwash + nonContactCooling;

    // Define nodes (same as before)
    const nodes = [
      { name: 'Ground Water' },
      { name: 'Rainwater' },
      { name: 'Recycled Water' },
      { name: 'Water Supply' },
      { name: 'Boiler Water' },
      { name: 'Domestic' },
      { name: 'WTP Backwash' },
      { name: 'Non-Contact Cooling' },
      { name: 'Process Loss' },
      { name: 'Treatment' },
      { name: 'Discharge' }
    ];

    const links = [];

    // 1. Sources → Water Supply
    if (groundWater > 0) links.push({ source: 0, target: 3, value: groundWater });
    if (rainwater > 0) links.push({ source: 1, target: 3, value: rainwater });
    if (recycled > 0) links.push({ source: 2, target: 3, value: recycled });

    // 2. Water Supply → Consumption categories
    if (boilerWater > 0) links.push({ source: 3, target: 4, value: boilerWater });
    if (domestic > 0) links.push({ source: 3, target: 5, value: domestic });
    if (wtpBackwash > 0) links.push({ source: 3, target: 6, value: wtpBackwash });
    if (nonContactCooling > 0) links.push({ source: 3, target: 7, value: nonContactCooling });

    // 3. Realistic output flows (this is the improved part)

    // Boiler Water: mostly evaporates → high Process Loss, some blowdown to Treatment
    if (boilerWater > 0) {
      links.push({ source: 4, target: 8, value: boilerWater * 0.8 });  // 80% evaporation/loss
      links.push({ source: 4, target: 9, value: boilerWater * 0.2 });  // 20% blowdown → treatment
    }

    // Domestic: almost entirely goes to wastewater → Treatment → eventually Discharge
    if (domestic > 0) {
      links.push({ source: 5, target: 9, value: domestic * 0.95 });     // To treatment
      links.push({ source: 5, target: 10, value: domestic * 0.05 });    // Minor evaporation/loss
    }

    // WTP Backwash: dirty water → directly to Treatment
    if (wtpBackwash > 0) {
      links.push({ source: 6, target: 9, value: wtpBackwash });
    }

    // Non-Contact Cooling: mostly evaporates in cooling towers
    if (nonContactCooling > 0) {
      links.push({ source: 7, target: 8, value: nonContactCooling * 0.9 });  // High evaporation
      links.push({ source: 7, target: 10, value: nonContactCooling * 0.1 }); // Small blowdown/discharge
    }

    // Optional: If you ever add Wet Process or Utility, you can route them here too

    // Calculate actual total output for summary cards
    let totalProcessLoss = 0;
    let totalTreatment = 0;
    let totalDischarge = 0;

    links.forEach(link => {
      if (link.target === 8) totalProcessLoss += link.value;
      if (link.target === 9) totalTreatment += link.value;
      if (link.target === 10) totalDischarge += link.value;
    });

    const totalOutput = totalProcessLoss + totalTreatment + totalDischarge;

    return { 
      nodes, 
      links: links.filter(link => link.value > 0),
      totals: { 
        totalSource: Math.round(totalSource),
        totalConsumption: Math.round(totalConsumption),
        totalOutput: Math.round(totalOutput)
      }
    };
  }, [waterData]);

  const nodes = data.nodes;

  // Your existing customTooltip, customNode, customLink remain EXACTLY the same
  // (I'm including them here for completeness)

  const customTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      if (data.source !== undefined && data.target !== undefined) {
        const sourceNode = nodes[data.source];
        const targetNode = nodes[data.target];
        return (
          <div className="bg-white p-4 rounded-lg shadow-2xl border-2 border-blue-200">
            <p className="font-bold text-gray-800 mb-2">Flow</p>
            <p className="text-sm text-gray-700">
              <span className="font-semibold">{sourceNode?.name}</span>
              <span className="mx-2">→</span>
              <span className="font-semibold">{targetNode?.name}</span>
            </p>
            <p className="text-lg font-bold text-blue-600 mt-2">
              {Math.round(data.value).toLocaleString()} m³
            </p>
          </div>
        );
      }
    }
    return null;
  };

  const customNode = (props) => {
    const { x, y, width, height, index } = props;
    const isSource = index <= 2;
    const isOutput = index >= 8;
    
    const colors = {
      0: '#00b4d8', 1: '#89ff01', 2: '#004208', 3: '#f59e0b',
      4: '#b5179e', 5: '#9999ff', 6: '#14b8a6', 7: '#8b5cf6',
      8: '#f97316', 9: '#ec4899', 10: '#dc2626'
    };

    const fill = colors[index] || '#3b82f6';
    
    const textX = isSource ? x - 10 : (isOutput ? x + width + 10 : x + width / 2);
    const textAnchor = isSource ? 'end' : (isOutput ? 'start' : 'middle');

    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={fill} fillOpacity={0.85} stroke="#fff" strokeWidth={3} rx={6} />
        <text x={textX} y={y + height / 2} textAnchor={textAnchor} dominantBaseline="middle" fill="#1f2937" fontSize={13} fontWeight="700"
          style={{ textShadow: '0 0 3px white, 0 0 3px white, 0 0 3px white' }}>
          {nodes[index]?.name}
        </text>
      </g>
    );
  };

  const customLink = (props) => {
    const { sourceX, sourceY, sourceControlX, targetX, targetY, targetControlX, linkWidth, index } = props;
    const linkColors = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ef4444', '#06b6d4', '#14b8a6', '#f97316', '#ec4899', '#dc2626'];
    const color = linkColors[index % linkColors.length];
    
    return (
      <path
        d={`M${sourceX},${sourceY} C${sourceControlX},${sourceY} ${targetControlX},${targetY} ${targetX},${targetY}`}
        fill="none"
        stroke={color}
        strokeWidth={linkWidth}
        strokeOpacity={0.4}
        style={{ transition: 'all 0.3s ease' }}
      />
    );
  };

  if (!waterData || data.links.length === 0) {
    return (
      <div className="bg-gradient-to-r from-blue-50 to-green-50 rounded-xl p-8 text-center border-2 border-dashed border-blue-300">
        <p className="text-gray-600 mb-2">No water flow data available</p>
        <p className="text-sm text-gray-500">Select a file with water data to see the flow diagram</p>
      </div>
    );
  }

  return (
    <div className="w-full">
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Water Flow Visualization</h4>
        <div className="flex items-center gap-6 text-xs">
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-500"></div><span className="text-gray-600">Sources</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-500"></div><span className="text-gray-600">Supply</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-cyan-500"></div><span className="text-gray-600">Consumption</span></div>
          <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-500"></div><span className="text-gray-600">Outputs</span></div>
        </div>
      </div>
      
      <ResponsiveContainer width="100%" height={600}>
        <Sankey
          data={data}
          node={customNode}
          link={customLink}
          nodePadding={50}
          nodeWidth={20}
          margin={{ top: 40, right: 180, bottom: 40, left: 180 }}
        >
          <Tooltip content={customTooltip} />
        </Sankey>
      </ResponsiveContainer>

      {/* Summary Cards */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg border-l-4 border-green-500">
          <p className="text-xs text-gray-600 mb-1">Total Input</p>
          <p className="text-2xl font-bold text-green-700">{data.totals.totalSource.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">m³</p>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
          <p className="text-xs text-gray-600 mb-1">Total Consumption</p>
          <p className="text-2xl font-bold text-blue-700">{data.totals.totalConsumption.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">m³</p>
        </div>
        <div className="bg-gradient-to-br from-red-50 to-red-100 p-4 rounded-lg border-l-4 border-red-500">
          <p className="text-xs text-gray-600 mb-1">Total Output</p>
          <p className="text-2xl font-bold text-red-700">{data.totals.totalOutput.toLocaleString()}</p>
          <p className="text-xs text-gray-500 mt-1">m³</p>
        </div>
      </div>

      {/* Explanation Box */}
      <div className="mt-4 p-4 bg-gradient-to-r from-blue-50 via-green-50 to-purple-50 rounded-lg border-2 border-blue-200">
        <div className="flex items-start gap-2">
          <div className="flex-shrink-0 mt-0.5">
            <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
            </svg>
          </div>
          <div>
            <p className="text-xs font-bold text-gray-800 mb-2">Reading the Diagram</p>
            <div className="grid grid-cols-2 gap-3 text-xs text-gray-700">
              <div><span className="font-semibold text-emerald-600">● Sources (Left):</span><p className="ml-4">Ground Water, Rainwater, Recycled</p></div>
              <div><span className="font-semibold text-amber-600">● Supply (Middle-Left):</span><p className="ml-4">Combined water supply</p></div>
              <div><span className="font-semibold text-cyan-600">● Consumption (Middle-Right):</span><p className="ml-4">Boiler, Domestic, WTP, Cooling</p></div>
              <div><span className="font-semibold text-red-600">● Outputs (Right):</span><p className="ml-4">Process Loss (evaporation), Treatment, Discharge</p></div>
            </div>
            <p className="text-xs text-gray-600 mt-2 italic">The width of each flow represents the volume of water (m³)</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WaterSankeyChart;