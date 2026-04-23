// client/src/components/waste/WasteCompositionPie.js
import React from 'react';
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WasteCompositionPie = ({ data }) => {
  if (!data || !data.metrics) {
    return (
      <div className="chart-card">
        <div className="chart-title">🥧 Waste Composition</div>
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          No data available
        </div>
      </div>
    );
  }

  const m = data.metrics;
  const totalRecycle = m.totalRecyclable || 0;
  const totalHazardous = m.totalHazardous || 0;
  const totalBioSolid = m.bioSolid || 0;
  const total = totalRecycle + totalHazardous + totalBioSolid;

  if (total === 0) {
    return (
      <div className="chart-card">
        <div className="chart-title">🥧 Waste Composition</div>
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          No waste data to display
        </div>
      </div>
    );
  }

  const chartData = [
    { name: 'Recyclable', value: totalRecycle, percentage: ((totalRecycle / total) * 100).toFixed(1) },
    { name: 'Hazardous', value: totalHazardous, percentage: ((totalHazardous / total) * 100).toFixed(1) },
    { name: 'Bio-Solid', value: totalBioSolid, percentage: ((totalBioSolid / total) * 100).toFixed(1) }
  ].filter(d => d.value > 0);

  const COLORS = { 'Recyclable': '#10B981', 'Hazardous': '#EF4444', 'Bio-Solid': '#92400E' };

  return (
    <div className="chart-card">
      <div className="chart-title">🥧 Waste Composition</div>
      <ResponsiveContainer width="100%" height={300}>
        <PieChart>
          <Pie
            data={chartData}
            dataKey="value"
            cx="50%"
            cy="50%"
            outerRadius={100}
            label={({ percentage }) => `${percentage}%`}
          >
            {chartData.map((entry, i) => (
              <Cell key={i} fill={COLORS[entry.name]} />
            ))}
          </Pie>
          <Tooltip formatter={(v) => `${v.toLocaleString()} kg`} />
          <Legend />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WasteCompositionPie;