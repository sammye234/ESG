// client/src/components/waste/RecyclingGauge.js
import React from 'react';
import WasteSankeyChart from './WasteSankeyChart';
export {WasteSankeyChart};



// export const RecyclingGauge = ({ data }) => {
//   if (!data || !data.metrics) {
//     return (
//       <div>
//         <div style={{
//           fontSize: '18px',
//           fontWeight: 600,
//           color: '#1f2937',
//           marginBottom: '16px',
//           display: 'flex',
//           alignItems: 'center',
//           gap: '8px'
//         }}>
//           🎯 Recycling Rate Gauge
//         </div>
//         <div style={{
//           height: '300px',
//           background: 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)',
//           borderRadius: '8px',
//           display: 'flex',
//           alignItems: 'center',
//           justifyContent: 'center',
//           color: 'white',
//           fontSize: '16px'
//         }}>
//           No recycling data available
//         </div>
//       </div>
//     );
//   }

//   const recyclingRate = data.metrics.recyclingRate || 0;
//   const target = 75;
//   const industryAvg = 55;

//   const getColor = (rate) => {
//     if (rate >= 70) return '#10B981';
//     if (rate >= 60) return '#F59E0B';
//     return '#EF4444';
//   };

//   const color = getColor(recyclingRate);
//   const percentage = Math.min((recyclingRate / 100) * 100, 100);

//   return (
//     <div>
//       <div style={{
//         fontSize: '18px',
//         fontWeight: 600,
//         color: '#1f2937',
//         marginBottom: '16px',
//         display: 'flex',
//         alignItems: 'center',
//         gap: '8px'
//       }}>
//         🎯 Recycling Rate Gauge
//       </div>
//       <div style={{ padding: '20px', textAlign: 'center' }}>
//         {/* Simple circular progress gauge */}
//         <div style={{ position: 'relative', width: '200px', height: '200px', margin: '0 auto' }}>
//           <svg viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
//             {/* Background circle */}
//             <circle
//               cx="100"
//               cy="100"
//               r="80"
//               fill="none"
//               stroke="#E5E7EB"
//               strokeWidth="20"
//             />
//             {/* Progress circle */}
//             <circle
//               cx="100"
//               cy="100"
//               r="80"
//               fill="none"
//               stroke={color}
//               strokeWidth="20"
//               strokeDasharray={`${percentage * 5.03} ${500}`}
//               strokeLinecap="round"
//             />
//           </svg>
//           <div style={{
//             position: 'absolute',
//             top: '50%',
//             left: '50%',
//             transform: 'translate(-50%, -50%)',
//             textAlign: 'center'
//           }}>
//             <div style={{ fontSize: '36px', fontWeight: 'bold', color: color }}>
//               {recyclingRate.toFixed(1)}%
//             </div>
//             <div style={{ fontSize: '12px', color: '#6B7280' }}>Current Rate</div>
//           </div>
//         </div>
        
//         {/* Legend */}
//         <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'space-around', fontSize: '14px' }}>
//           <div>
//             <div style={{ color: '#6B7280' }}>Target</div>
//             <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{target}%</div>
//           </div>
//           <div>
//             <div style={{ color: '#6B7280' }}>Industry Avg</div>
//             <div style={{ fontWeight: 'bold', color: '#1f2937' }}>{industryAvg}%</div>
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// };
export const RecyclingGauge = ({ data }) => {
  if (!data || !data.metrics) {
    return <div className="chart-card">No data</div>;
  }

  const rate = data.metrics.recyclingRate || 0;
  const percentage = Math.min(rate, 100);

  const color = rate >= 75 ? '#10B981' : rate >= 60 ? '#F59E0B' : '#EF4444';

  return (
    <div className="chart-card">
      <div className="chart-title">🎯 Recycling Rate</div>
      <div style={{ textAlign: 'center', padding: '20px' }}>
        <div style={{ position: 'relative', width: 200, height: 200, margin: '0 auto' }}>
          <svg viewBox="0 0 200 200" style={{ transform: 'rotate(-90deg)' }}>
            <circle cx="100" cy="100" r="80" fill="none" stroke="#E5E7EB" strokeWidth="20" />
            <circle
              cx="100" cy="100" r="80" fill="none" stroke={color} strokeWidth="20"
              strokeDasharray={`${percentage * 5.03} 500`} strokeLinecap="round"
            />
          </svg>

          <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>
            <div style={{ fontSize: '36px', fontWeight: 'bold', color }}>{rate.toFixed(1)}%</div>
            <div style={{ fontSize: '12px', color: '#666' }}>Recycling Rate</div>
          </div>
        </div>
        
        <div style={{ marginTop: '20px', fontSize: '14px', color: '#666' }}>
          Target: 75% • Industry Avg: 55%
        </div>
      </div>
    </div>
  );
};