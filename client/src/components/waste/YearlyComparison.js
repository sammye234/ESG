// client/src/components/waste/YearlyComparison.js
import React from 'react';
import { BarChart, Bar, LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import './YearlyComparison.css';

const YearlyComparison = ({ comparisonData, companyType }) => {
  if (!comparisonData || !comparisonData.years) {
    return (
      <div className="yearly-comparison-container">
        <div className="no-data-message">
          <p>📊 No yearly comparison data available. Upload waste data to see trends.</p>
        </div>
      </div>
    );
  }

  // Extract years data
  const years = comparisonData.years || [];
  
  // Calculate KPIs
  const currentYear = years[years.length - 1] || {};
  const previousYear = years[years.length - 2] || {};
  const firstYear = years[0] || {};

  // Calculate improvements
  const recyclingRateImprovement = currentYear.recyclingRate - firstYear.recyclingRate;
  const hazardousReduction = ((firstYear.hazardousWaste - currentYear.hazardousWaste) / firstYear.hazardousWaste * 100);
  const ytdComparison = ((currentYear.totalWaste - previousYear.totalWaste) / previousYear.totalWaste * 100);

  // Prepare chart data
  const yearlyBarData = years.map(year => ({
    year: year.year,
    Total: year.totalWaste,
    Recycled: year.recycledWaste,
    Hazardous: year.hazardousWaste
  }));

  const recyclingRateTrendData = years.map(year => ({
    year: year.year,
    'Recycling Rate': year.recyclingRate
  }));

  const categoryBreakdownData = years.map(year => ({
    year: year.year,
    Recycle: year.recycledWaste,
    Hazardous: year.hazardousWaste,
    'Bio-Solid': year.bioSolidWaste || 0
  }));

  return (
    <div className="yearly-comparison-container">
      {/* Yearly KPIs */}
      <div className="yearly-kpis">
        <div className="yearly-kpi green">
          <h3>{currentYear.year} Total Waste (YTD)</h3>
          <div className="value">{currentYear.totalWaste?.toLocaleString() || 0} kg</div>
          <div className="change">
            {ytdComparison > 0 ? '↑' : '↓'} {Math.abs(ytdComparison).toFixed(1)}% vs {previousYear.year}
          </div>
        </div>
        
        <div className="yearly-kpi blue">
          <h3>{currentYear.year} Recycling Rate</h3>
          <div className="value">{currentYear.recyclingRate?.toFixed(1) || 0}%</div>
          <div className="change">
            ↑ {Math.abs(currentYear.recyclingRate - previousYear.recyclingRate).toFixed(1)}% vs {previousYear.year}
          </div>
        </div>
        
        <div className="yearly-kpi purple">
          <h3>{years.length}-Year Improvement</h3>
          <div className="value">+{recyclingRateImprovement.toFixed(1)}%</div>
          <div className="change">Recycling rate increased</div>
        </div>
        
        <div className="yearly-kpi orange">
          <h3>Hazardous Reduction</h3>
          <div className="value">-{hazardousReduction.toFixed(0)}%</div>
          <div className="change">Since {firstYear.year}</div>
        </div>
      </div>

      {/* Comparison Table */}
      <div className="comparison-table">
        <div className="table-header">
          📋 Year-over-Year Comparison
        </div>
        <div className="table-responsive">
          <table>
            <thead>
              <tr>
                <th>Year</th>
                <th>Total Generated (kg)</th>
                <th>Recycled (kg)</th>
                <th>Hazardous (kg)</th>
                <th>Bio-Solid (kg)</th>
                <th>Recycling Rate</th>
                <th>YoY Change</th>
              </tr>
            </thead>
            <tbody>
              {years.map((year, index) => {
                const prevYear = years[index - 1];
                const yoyChange = prevYear 
                  ? ((year.recyclingRate - prevYear.recyclingRate) / prevYear.recyclingRate * 100)
                  : 0;
                
                const isCurrentYear = index === years.length - 1;
                
                return (
                  <tr key={year.year} className={isCurrentYear ? 'highlight-row' : ''}>
                    <td><strong>{year.year}{isCurrentYear && ' (YTD)'}</strong></td>
                    <td>{year.totalWaste?.toLocaleString() || 0}</td>
                    <td>{year.recycledWaste?.toLocaleString() || 0}</td>
                    <td>{year.hazardousWaste?.toLocaleString() || 0}</td>
                    <td>{year.bioSolidWaste?.toLocaleString() || 0}</td>
                    <td>{year.recyclingRate?.toFixed(1) || 0}%</td>
                    <td className={yoyChange > 0 ? 'trend-up' : 'trend-neutral'}>
                      {index === 0 ? '—' : `${yoyChange > 0 ? '↑' : '↓'} ${Math.abs(yoyChange).toFixed(1)}%`}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Yearly Charts */}
      <div className="charts-grid-2">
        {/* Total Waste Generated (Yearly) */}
        <div className="chart-card">
          <div className="chart-title">📊 Total Waste Generated (Yearly)</div>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={yearlyBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Bar dataKey="Total" fill="#64748B" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Recycled" fill="#10B981" radius={[8, 8, 0, 0]} />
              <Bar dataKey="Hazardous" fill="#EF4444" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Recycling Rate Progress */}
        <div className="chart-card">
          <div className="chart-title">📈 Recycling Rate Progress</div>
          <ResponsiveContainer width="100%" height={280}>
            <LineChart data={recyclingRateTrendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} label={{ value: '%', angle: 0, position: 'top' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: 'white', border: '1px solid #e5e7eb', borderRadius: '8px' }}
              />
              <Legend />
              <Line 
                type="monotone" 
                dataKey="Recycling Rate" 
                stroke="#10B981" 
                strokeWidth={3}
                dot={{ fill: '#10B981', r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* 3-Year Category Breakdown */}
        <div className="chart-card-full">
          <div className="chart-title">🌊 {years.length}-Year Waste Category Comparison</div>
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={categoryBreakdownData}>
              <defs>
                <linearGradient id="colorRecycle" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorHazardous" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#EF4444" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#EF4444" stopOpacity={0.1}/>
                </linearGradient>
                <linearGradient id="colorBioSolid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#92400E" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#92400E" stopOpacity={0.1}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="year" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Legend />
              <Area 
                type="monotone" 
                dataKey="Recycle" 
                stackId="1"
                stroke="#10B981" 
                fill="url(#colorRecycle)" 
              />
              <Area 
                type="monotone" 
                dataKey="Hazardous" 
                stackId="1"
                stroke="#EF4444" 
                fill="url(#colorHazardous)" 
              />
              <Area 
                type="monotone" 
                dataKey="Bio-Solid" 
                stackId="1"
                stroke="#92400E" 
                fill="url(#colorBioSolid)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default YearlyComparison;