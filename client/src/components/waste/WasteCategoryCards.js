// client/src/components/waste/WasteCategoryCards.js
import React from 'react';
import './WasteCategoryCards.css';

const WasteCategoryCards = ({ data }) => {
  if (!data || !data.metrics || !data.monthlyData) return null;

  const formatNumber = (num) => num?.toLocaleString('en-US', { maximumFractionDigits: 0 }) || '0';

  const metrics = data.metrics;

  // Sum breakdowns from monthlyData
  let jhute = 0, leftover = 0, padding = 0;
  let polyPlastic = 0, carton = 0, paper = 0, patternBoard = 0;
  let medical = 0, metal = 0, electric = 0, chemicalDrum = 0;
  let sludge = 0, foodWaste = 0;

  data.monthlyData.forEach(month => {
    const r = month.recycleWaste || {};
    const h = month.hazardousWaste?.solid || {};
    const b = month.bioSolidWaste || {};

    jhute += r.preConsumer?.jhute || 0;
    leftover += r.preConsumer?.leftover || 0;
    padding += r.preConsumer?.padding || 0;
    polyPlastic += r.packaging?.polyPlastic || 0;
    carton += r.packaging?.carton || 0;
    paper += (r.packaging?.paper || 0) + (r.packaging?.emptyCone || 0);
    patternBoard += r.packaging?.patternBoard || 0;

    medical += h.medicalWaste || 0;
    metal += h.metal || 0;
    electric += h.electricWaste || 0;
    chemicalDrum += h.emptyChemicalDrum || 0;

    sludge += b.sludge || 0;
    foodWaste += b.foodWaste || 0;
  });

  const preConsumerTotal = jhute + leftover + padding;
  const packagingTotal = polyPlastic + carton + paper + patternBoard;

  return (
    <div className="breakdown-grid">
      {/* Recycle Card */}
      <div className="breakdown-card recycle">
        <div className="breakdown-title">♻️ RECYCLE WASTE</div>

        <div className="breakdown-subsection">
          <div className="breakdown-subsection-header">
            PRE-CONSUMER ({preConsumerTotal > 0 ? ((preConsumerTotal / metrics.totalRecyclable) * 100).toFixed(1) : '0.0'}%)
          </div>
          <div className="breakdown-item"><span>Jhute</span><span className="breakdown-value">{formatNumber(jhute)} kg</span></div>
          {(leftover > 0 || padding > 0) && (
            <div className="breakdown-item">
              <span>{leftover > 0 ? 'Leftover' : 'Padding'}</span>
              <span className="breakdown-value">{formatNumber(leftover || padding)} kg</span>
            </div>
          )}
          <div className="breakdown-item subtotal">
            <span><strong>Total Pre-Consumer</strong></span>
            <span className="breakdown-value">{formatNumber(preConsumerTotal)} kg</span>
          </div>
        </div>

        <div className="breakdown-subsection">
          <div className="breakdown-subsection-header">
            PACKAGING ({packagingTotal > 0 ? ((packagingTotal / metrics.totalRecyclable) * 100).toFixed(1) : '0.0'}%)
          </div>
          {polyPlastic > 0 && <div className="breakdown-item"><span>Poly/Plastic</span><span className="breakdown-value">{formatNumber(polyPlastic)} kg</span></div>}
          {carton > 0 && <div className="breakdown-item"><span>Carton</span><span className="breakdown-value">{formatNumber(carton)} kg</span></div>}
          {paper > 0 && <div className="breakdown-item"><span>Paper/Cone</span><span className="breakdown-value">{formatNumber(paper)} kg</span></div>}
          {patternBoard > 0 && <div className="breakdown-item"><span>Pattern Board</span><span className="breakdown-value">{formatNumber(patternBoard)} kg</span></div>}
          <div className="breakdown-item subtotal">
            <span><strong>Total Packaging</strong></span>
            <span className="breakdown-value">{formatNumber(packagingTotal)} kg</span>
          </div>
        </div>

        <div className="breakdown-total">
          <div className="breakdown-item">
            <span><strong>Total Recycled</strong></span>
            <span className="breakdown-value total-recycle">{formatNumber(metrics.totalRecyclable)} kg</span>
          </div>
        </div>
      </div>

      {/* Hazardous Card */}
      <div className="breakdown-card hazardous">
        <div className="breakdown-title">☢️ HAZARDOUS WASTE</div>
        <div className="breakdown-section-label">SOLID HAZARDOUS</div>
        {medical > 0 && <div className="breakdown-item"><span>Medical Waste</span><span className="breakdown-value">{formatNumber(medical)} kg</span></div>}
        {metal > 0 && <div className="breakdown-item"><span>Metal</span><span className="breakdown-value">{formatNumber(metal)} kg</span></div>}
        {electric > 0 && <div className="breakdown-item"><span>Electric Waste</span><span className="breakdown-value">{formatNumber(electric)} kg</span></div>}
        {chemicalDrum > 0 && <div className="breakdown-item"><span>Chemical Drum</span><span className="breakdown-value">{formatNumber(chemicalDrum)} kg</span></div>}
        {sludge > 0 && <div className="breakdown-item"><span>Sludge</span><span className="breakdown-value">{formatNumber(sludge)} kg</span></div>}
        <div className="breakdown-total">
          <div className="breakdown-item">
            <span><strong>Total Hazardous</strong></span>
            <span className="breakdown-value total-hazardous">{formatNumber(metrics.totalHazardous)} kg</span>
          </div>
        </div>
      </div>

      {/* Bio-Solid Card */}
      <div className="breakdown-card biosolid">
        <div className="breakdown-title">🌱 BIO-SOLID WASTE</div>
        {foodWaste > 0 && <div className="breakdown-item"><span>Food Waste</span><span className="breakdown-value">{formatNumber(foodWaste)} kg</span></div>}
        <div className="breakdown-total">
          <div className="breakdown-item">
            <span><strong>Total Bio-Solid</strong></span>
            <span className="breakdown-value total-biosolid">{formatNumber(metrics.bioSolid)} kg</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WasteCategoryCards;