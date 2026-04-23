// client/src/components/waste/RecycleBreakdownBar.js
import React from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const RecycleBreakdownBar = ({ yearlyData, companyType }) => {
  if (!yearlyData || !yearlyData.monthly || yearlyData.monthly.length === 0) {
    return (
      <div>
        <div className="chart-title">📈 Recycle Waste Breakdown (Monthly)</div>
        <div className="chart-placeholder">
          No recycle data available
        </div>
      </div>
    );
  }

  // Sort months
  const monthOrder = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  };

  const sortedData = [...yearlyData.monthly].sort((a, b) => {
    return monthOrder[a.month] - monthOrder[b.month];
  });

  // Transform data for chart
  const chartData = sortedData.map(record => {
    const preConsumer = {
      jhute: record.recycleWaste?.preConsumer?.jhute || 0,
      leftoverOrPadding: companyType === 'Type-2 with Liquid waste' 
        ? (record.recycleWaste?.preConsumer?.leftover || 0)
        : (record.recycleWaste?.preConsumer?.padding || 0)
    };

    const packaging = {
      polyPlastic: record.recycleWaste?.packaging?.polyPlastic || 0,
      carton: record.recycleWaste?.packaging?.carton || 0,
      paper: (record.recycleWaste?.packaging?.paper || 0) + 
             (record.recycleWaste?.packaging?.paperCone || 0)
    };

    return {
      month: record.month.substring(0, 3),
      jhute: preConsumer.jhute,
      leftoverPadding: preConsumer.leftoverOrPadding,
      polyPlastic: packaging.polyPlastic,
      carton: packaging.carton,
      paper: packaging.paper
    };
  });

  return (
    <div>
      <div className="chart-title">📈 Recycle Waste Breakdown (Monthly)</div>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis 
            dataKey="month" 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            stroke="#9CA3AF"
          />
          <YAxis 
            tick={{ fill: '#6B7280', fontSize: 12 }}
            stroke="#9CA3AF"
            label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', style: { fill: '#6B7280' } }}
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'white', 
              border: '1px solid #E5E7EB', 
              borderRadius: '8px',
              padding: '12px'
            }}
            formatter={(value) => value.toLocaleString() + ' kg'}
          />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="rect"
          />
          <Bar dataKey="jhute" stackId="a" fill="#06B6D4" name="Jhute" />
          <Bar 
            dataKey="leftoverPadding" 
            stackId="a" 
            fill="#7d7db6" 
            name={companyType === 'Type-2 with Liquid waste' ? 'Leftover' : 'Padding'} 
          />
          <Bar dataKey="polyPlastic" stackId="b" fill="#3B82F6" name="Poly/Plastic" />
          <Bar dataKey="carton" stackId="b" fill="#6366F1" name="Carton" />
          <Bar dataKey="paper" stackId="b" fill="#10B981" name="Paper" />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default RecycleBreakdownBar;