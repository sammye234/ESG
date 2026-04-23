// // client/src/components/waste/WasteTrendChart.js
// import React from 'react';
// import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// const WasteTrendChart = ({ yearlyData, selectedYear }) => {
//   if (!yearlyData || !yearlyData.monthly || yearlyData.monthly.length === 0) {
//     return (
//       <div>
//         <div className="chart-title">📊 Monthly Waste Trend</div>
//         <div className="chart-placeholder">
//           No data available for {selectedYear}
//         </div>
//       </div>
//     );
//   }

//   // Sort months by month order
//   const monthOrder = {
//     'January': 1, 'February': 2, 'March': 3, 'April': 4,
//     'May': 5, 'June': 6, 'July': 7, 'August': 8,
//     'September': 9, 'October': 10, 'November': 11, 'December': 12
//   };

//   const sortedData = [...yearlyData.monthly].sort((a, b) => {
//     return monthOrder[a.month] - monthOrder[b.month];
//   });

//   // Transform data for chart
//   const chartData = sortedData.map(record => ({
//     month: record.month.substring(0, 3), // Short month name
//     total: record.calculated?.totalWaste || 0,
//     recycled: record.calculated?.totalRecycle || 0,
//     hazardous: record.calculated?.totalHazardousSolid || 0
//   }));

//   return (
//     <div>
//       <div className="chart-title">📊 Monthly Waste Trend</div>
//       <ResponsiveContainer width="100%" height={300}>
//         <LineChart data={chartData}>
//           <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
//           <XAxis 
//             dataKey="month" 
//             tick={{ fill: '#6B7280', fontSize: 12 }}
//             stroke="#9CA3AF"
//           />
//           <YAxis 
//             tick={{ fill: '#6B7280', fontSize: 12 }}
//             stroke="#9CA3AF"
//             label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft', style: { fill: '#6B7280' } }}
//           />
//           <Tooltip 
//             contentStyle={{ 
//               backgroundColor: 'white', 
//               border: '1px solid #E5E7EB', 
//               borderRadius: '8px',
//               padding: '12px'
//             }}
//             formatter={(value) => value.toLocaleString() + ' kg'}
//           />
//           <Legend 
//             wrapperStyle={{ paddingTop: '20px' }}
//             iconType="circle"
//           />
//           <Line 
//             type="monotone" 
//             dataKey="total" 
//             stroke="#8B5CF6" 
//             strokeWidth={3}
//             name="Total Waste"
//             dot={{ fill: '#8B5CF6', r: 4 }}
//             activeDot={{ r: 6 }}
//           />
//           <Line 
//             type="monotone" 
//             dataKey="recycled" 
//             stroke="#10B981" 
//             strokeWidth={3}
//             name="Recycled"
//             dot={{ fill: '#10B981', r: 4 }}
//             activeDot={{ r: 6 }}
//           />
//           <Line 
//             type="monotone" 
//             dataKey="hazardous" 
//             stroke="#EF4444" 
//             strokeWidth={3}
//             name="Hazardous"
//             dot={{ fill: '#EF4444', r: 4 }}
//             activeDot={{ r: 6 }}
//           />
//         </LineChart>
//       </ResponsiveContainer>
//     </div>
//   );
// };

// export default WasteTrendChart;
// client/src/components/waste/WasteTrendChart.js
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

const WasteTrendChart = ({ yearlyData }) => {
  if (!yearlyData || !yearlyData.monthly || yearlyData.monthly.length === 0) {
    return (
      <div className="chart-card">
        <div className="chart-title">📊 Monthly Waste Trend</div>
        <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
          No data available
        </div>
      </div>
    );
  }

  const monthOrder = {
    'January': 1, 'February': 2, 'March': 3, 'April': 4,
    'May': 5, 'June': 6, 'July': 7, 'August': 8,
    'September': 9, 'October': 10, 'November': 11, 'December': 12
  };

  const sortedData = [...yearlyData.monthly].sort((a, b) => {
    return monthOrder[a.month] - monthOrder[b.month];
  });

  const chartData = sortedData.map(record => ({
    month: record.month.substring(0, 3),
    total: record.calculated?.totalWaste || 0,
    recycled: record.calculated?.totalRecyclable || 0,
    hazardous: record.calculated?.totalHazardous || 0
  }));

  return (
    <div className="chart-card">
      <div className="chart-title">📊 Monthly Waste Trend</div>
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E5E7EB" />
          <XAxis dataKey="month" tick={{ fill: '#6B7280', fontSize: 12 }} />
          <YAxis tick={{ fill: '#6B7280', fontSize: 12 }} label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }} />
          <Tooltip formatter={(value) => value.toLocaleString() + ' kg'} />
          <Legend />
          <Line type="monotone" dataKey="total" stroke="#8B5CF6" strokeWidth={3} name="Total Waste" />
          <Line type="monotone" dataKey="recycled" stroke="#10B981" strokeWidth={3} name="Recycled" />
          <Line type="monotone" dataKey="hazardous" stroke="#EF4444" strokeWidth={3} name="Hazardous" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
};

export default WasteTrendChart;