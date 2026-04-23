// client/src/components/waste/WasteInsights.js
import React from 'react';
import './WasteInsights.css';

const WasteInsights = ({ comparisonData }) => {
  if (!comparisonData || !comparisonData.years) {
    return null;
  }

  const years = comparisonData.years || [];
  const currentYear = years[years.length - 1] || {};
  const firstYear = years[0] || {};
  const previousYear = years[years.length - 2] || {};

  // Calculate insights
  const recyclingImprovement = currentYear.recyclingRate - firstYear.recyclingRate;
  const hazardousReduction = ((firstYear.hazardousWaste - currentYear.hazardousWaste) / firstYear.hazardousWaste * 100);
  const targetGap = 75 - currentYear.recyclingRate; // Assuming 75% target
  const industryAverage = 55; // Assumed industry average
  const performanceVsIndustry = currentYear.recyclingRate - industryAverage;

  // Determine trend direction
  const getTrendEmoji = (value) => {
    if (value > 0) return '📈';
    if (value < 0) return '📉';
    return '➡️';
  };

  return (
    <div className="insights">
      <h3>💡 Key Insights & Recommendations</h3>
      <ul>
        <li>
          <strong>Excellent Progress:</strong> Recycling rate improved by {Math.abs(recyclingImprovement).toFixed(1)} 
          percentage points over {years.length} years ({firstYear.recyclingRate?.toFixed(1)}% → {currentYear.recyclingRate?.toFixed(1)}%) 
          {getTrendEmoji(recyclingImprovement)}
        </li>
        
        {hazardousReduction > 0 && (
          <li>
            <strong>Hazardous Waste Reduction:</strong> Successfully reduced hazardous waste by {hazardousReduction.toFixed(0)}% 
            since {firstYear.year} - great environmental achievement! ♻️
          </li>
        )}
        
        <li>
          <strong>{currentYear.year} Target:</strong> {targetGap > 0 
            ? `${targetGap.toFixed(1)}% away from 75% recycling target - ${targetGap < 10 ? 'almost there!' : 'keep pushing!'}` 
            : 'Target achieved! 🎉'
          } Current rate: {currentYear.recyclingRate?.toFixed(1)}%
        </li>
        
        {performanceVsIndustry > 0 ? (
          <li>
            <strong>Industry Benchmark:</strong> Current performance exceeds industry average of {industryAverage}% 
            by {performanceVsIndustry.toFixed(1)} percentage points - leading the way! 🏆
          </li>
        ) : (
          <li>
            <strong>Industry Benchmark:</strong> Current performance is {Math.abs(performanceVsIndustry).toFixed(1)}% 
            below industry average of {industryAverage}% - opportunity for improvement 📊
          </li>
        )}
        
        {currentYear.recyclingRate < previousYear.recyclingRate ? (
          <li>
            <strong>Focus Area:</strong> Recycling rate declined from {previousYear.year}. 
            Priority actions: improve plastic and packaging waste segregation, enhance staff training, 
            review waste collection processes 🎯
          </li>
        ) : (
          <li>
            <strong>Focus Area:</strong> Continue improving plastic and packaging waste segregation to reach target. 
            Consider implementing advanced sorting technologies and staff incentive programs 🚀
          </li>
        )}
        
        <li>
          <strong>Sustainability Impact:</strong> Over {years.length} years, diverted {(currentYear.recycledWaste - firstYear.recycledWaste).toLocaleString()} kg 
          from landfills, equivalent to saving approximately {Math.round((currentYear.recycledWaste - firstYear.recycledWaste) * 0.002)} 
          tons of CO₂ emissions 🌍
        </li>
      </ul>
    </div>
  );
};

export default WasteInsights;