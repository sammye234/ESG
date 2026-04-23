// client/src/components/waste/WasteKPICards.js
import React from 'react';
import './WasteKPICards.css';

const WasteKPICards = ({ data, momChanges }) => {
  if (!data) {
    return (
      <div className="kpi-grid">
        {[1, 2, 3, 4, 5, 6].map(i => (
          <div key={i} className="kpi-card skeleton">
            <div className="skeleton-text"></div>
            <div className="skeleton-value"></div>
            <div className="skeleton-trend"></div>
          </div>
        ))}
      </div>
    );
  }

  const formatNumber = (num) => {
    return num?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0';
  };

  const formatPercentage = (num) => {
    if (!num) return '0.0';
    return Math.abs(num).toFixed(1);
  };

  const getTrendIcon = (value) => {
    return value > 0 ? '↑' : '↓';
  };

  
  const kpis = [
    {
      label: 'Total Waste Generated',
      value: formatNumber(data.metrics?.totalWaste),
      unit: 'kg',
      color: 'green'
    },
    {
      label: 'Recycled Waste',
      value: formatNumber(data.metrics?.totalRecyclable),
      unit: 'kg',
      color: 'blue'
    },
    {
      label: 'Hazardous Waste',
      value: formatNumber(data.metrics?.totalHazardous),
      unit: 'kg',
      color: 'red'
    },
    {
      label: 'Overall Recycling Rate',
      value: data.metrics?.recyclingRate?.toFixed(1) || '0.0',
      unit: '%',
      color: 'purple',
      subtitle: 'of total waste'
    },
    // Add these if you have preConsumer/packaging in metrics
    {
      label: 'Pre-Consumer Rate',
      value: data.metrics?.preConsumer ? ((data.metrics.preConsumer / data.metrics.totalRecyclable) * 100).toFixed(1) : '0.0',
      unit: '%',
      color: 'orange'
    },
    {
      label: 'Packaging Rate',
      value: data.metrics?.packaging ? ((data.metrics.packaging / data.metrics.totalRecyclable) * 100).toFixed(1) : '0.0',
      unit: '%',
      color: 'teal'
    }
  ];

  return (
    <div className="kpi-grid">
      {kpis.map((kpi, index) => (
        <div key={index} className={`kpi-card ${kpi.color}`}>
          <div className="kpi-label">{kpi.label}</div>
          <div className="kpi-value">
            {kpi.value} <span className="kpi-unit">{kpi.unit}</span>
          </div>
          {kpi.subtitle && (
            <div className="kpi-subtitle">{kpi.subtitle}</div>
          )}
          {kpi.trend !== 0 && (
            <div className={`kpi-trend ${kpi.trend < 0 ? 'negative' : ''}`}>
              {getTrendIcon(kpi.trend)} {formatPercentage(kpi.trend)}% vs last month
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

export default WasteKPICards;