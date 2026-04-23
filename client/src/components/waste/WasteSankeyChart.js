// client/src/components/waste/WasteSankeyChart.js
import React, { useMemo } from 'react';
import { Sankey, Tooltip, ResponsiveContainer } from 'recharts';

const WasteSankeyChart = ({ wasteData }) => {
  const data = useMemo(() => {
    if (!wasteData || !wasteData.metrics) {
      return { nodes: [], links: [], totals: { totalWaste: 0, totalRecycle: 0, totalHazardous: 0, totalBioSolid: 0 } };
    }

    const metrics = wasteData.metrics;

    // Use backend-calculated values directly
    const totalWaste = metrics.totalWaste || 0;
    const totalRecycle = metrics.totalRecyclable || 0;
    const totalHazardous = metrics.totalHazardous || 0;
    const totalBioSolid = metrics.bioSolid || 0;

    // Extract breakdown from monthly data (summed already in backend)
    let jhute = 0, leftover = 0, padding = 0;
    let polyPlastic = 0, carton = 0, paper = 0, emptyCone = 0, patternBoard = 0;
    let medical = 0, metal = 0, electric = 0, chemicalDrum = 0;
    let sludge = 0, foodWaste = 0;

    (wasteData.monthlyData || []).forEach(month => {
      const r = month.recycleWaste || {};
      const h = month.hazardousWaste?.solid || {};
      const b = month.bioSolidWaste || {};

      jhute += (r.preConsumer?.jhute || 0);
      leftover += (r.preConsumer?.leftover || 0);
      padding += (r.preConsumer?.padding || 0);
      polyPlastic += (r.packaging?.polyPlastic || 0);
      carton += (r.packaging?.cartoon || 0);
      paper += (r.packaging?.paper || 0);
      emptyCone += (r.packaging?.emptyCone || 0);
      patternBoard += (r.packaging?.patternBoard || 0);

      medical += (h.medical || 0);
      metal += (h.metal || 0);
      electric += (h.electric || 0);
      chemicalDrum += (h.chemicalDrum || 0);

      sludge += (b.sludge || 0);
      foodWaste += (b.foodWaste || 0);
    });

    const nodes = [
      { name: 'Total Waste' },
      { name: 'Recyclable' },
      { name: 'Hazardous' },
      { name: 'Bio-Solid' },
      { name: 'Jhute' },
      { name: 'Leftover' },
      { name: 'Padding' },
      { name: 'Poly/Plastic' },
      { name: 'Carton' },
      { name: 'Paper' },
      { name: 'Empty Cone' },
      { name: 'Pattern Board' },
      { name: 'Medical' },
      { name: 'Metal' },
      { name: 'Electric' },
      { name: 'Chemical Drum' },
      { name: 'Sludge' },
      { name: 'Food Waste' }
    ];

    const links = [];

    // Main categories
    if (totalRecycle > 0) links.push({ source: 0, target: 1, value: totalRecycle });
    if (totalHazardous > 0) links.push({ source: 0, target: 2, value: totalHazardous });
    if (totalBioSolid > 0) links.push({ source: 0, target: 3, value: totalBioSolid });

    // Recyclable breakdown
    if (jhute > 0) links.push({ source: 1, target: 4, value: jhute });
    if (leftover > 0) links.push({ source: 1, target: 5, value: leftover });
    if (padding > 0) links.push({ source: 1, target: 6, value: padding });
    if (polyPlastic > 0) links.push({ source: 1, target: 7, value: polyPlastic });
    if (carton > 0) links.push({ source: 1, target: 8, value: carton });
    if (paper > 0) links.push({ source: 1, target: 9, value: paper });
    if (emptyCone > 0) links.push({ source: 1, target: 10, value: emptyCone });
    if (patternBoard > 0) links.push({ source: 1, target: 11, value: patternBoard });

    // Hazardous
    if (medical > 0) links.push({ source: 2, target: 12, value: medical });
    if (metal > 0) links.push({ source: 2, target: 13, value: metal });
    if (electric > 0) links.push({ source: 2, target: 14, value: electric });
    if (chemicalDrum > 0) links.push({ source: 2, target: 15, value: chemicalDrum });
    if (sludge > 0) links.push({ source: 2, target: 16, value: sludge });

    // Bio-solid
    if (foodWaste > 0) links.push({ source: 3, target: 17, value: foodWaste });

    return {
      nodes,
      links: links.filter(l => l.value > 0),
      totals: { totalWaste, totalRecycle, totalHazardous, totalBioSolid }
    };
  }, [wasteData]);

  if (data.links.length === 0) {
    return (
      <div style={{ padding: '40px', textAlign: 'center', color: '#666' }}>
        <p style={{ fontSize: '16px', fontWeight: '500' }}>📊 No waste flow data available</p>
        <p style={{ fontSize: '14px', color: '#999', marginTop: '8px' }}>
          Upload waste data to see the flow diagram
        </p>
      </div>
    );
  }

const customNode = (props) => {
    const { x, y, width, height, index, payload } = props;
    
    // Color scheme matching your reference
    const colors = {
      0: '#4A90E2',  // Total Waste - Blue
      1: '#10B981',  // Recyclable - Green
      2: '#EF4444',  // Hazardous - Red
      3: '#F59E0B',  // Bio-Solid - Orange
      // Recyclable items - Green shades
      4: '#34D399',  // Jhute
      5: '#10B981',  // Leftover
      6: '#059669',  // Padding
      7: '#6366F1',  // Poly/Plastic
      8: '#3B82F6',  // Carton
      9: '#10B981',  // Paper
      10: '#8B5CF6', // Empty Cone
      11: '#A78BFA', // Pattern Board
      // Hazardous items - Red shades
      12: '#DC2626', // Medical
      13: '#991B1B', // Metal
      14: '#EF4444', // Electric
      15: '#F87171', // Chemical Drum
      16: '#FCA5A5', // Sludge
      // Bio-solid
      17: '#D97706'  // Food Waste
    };

    const nodeColor = colors[index] || '#6B7280';
    const nodeName = data.nodes[index]?.name || '';
    
    // All labels on the right side of nodes
    const textX = x + width + 8;
    const textAnchor = 'start';

    return (
      <g>
        <rect 
          x={x} 
          y={y} 
          width={width} 
          height={height} 
          fill={nodeColor} 
          rx={6}
          style={{
            filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))',
            transition: 'all 0.3s ease'
          }}
        />
        <text 
          x={textX} 
          y={y + height / 2} 
          textAnchor={textAnchor}
          fill="#1f2937"
          fontSize="11" 
          fontWeight="600"
          dy="0.35em"
        >
          {nodeName}
        </text>
      </g>
    );
  };

  const customLink = (props) => {
    const { sourceX, targetX, sourceY, targetY, sourceControlX, targetControlX, linkWidth, index } = props;
    
    // Color links based on category
    const link = data.links[index];
    let linkColor = '#10B981'; // Default green for recyclable
    
    if (link.source === 0 && link.target === 1) linkColor = '#10B981'; // Total -> Recyclable
    if (link.source === 0 && link.target === 2) linkColor = '#EF4444'; // Total -> Hazardous
    if (link.source === 0 && link.target === 3) linkColor = '#F59E0B'; // Total -> Bio-solid
    
    if (link.source === 1) linkColor = '#10B981'; // Recyclable breakdown
    if (link.source === 2) linkColor = '#EF4444'; // Hazardous breakdown
    if (link.source === 3) linkColor = '#F59E0B'; // Bio-solid breakdown

    return (
      <path
        d={`
          M${sourceX},${sourceY + linkWidth / 2}
          C${sourceControlX},${sourceY + linkWidth / 2}
          ${targetControlX},${targetY + linkWidth / 2}
          ${targetX},${targetY + linkWidth / 2}
          L${targetX},${targetY - linkWidth / 2}
          C${targetControlX},${targetY - linkWidth / 2}
          ${sourceControlX},${sourceY - linkWidth / 2}
          ${sourceX},${sourceY - linkWidth / 2}
          Z
        `}
        fill={linkColor}
        fillOpacity={0.5}
        style={{
          transition: 'all 0.3s ease'
        }}
      />
    );
  };

  return (
      <div style={{ width: '100%', height: '650px' }}>
        {/* Title */}
        <div style={{ 
          textAlign: 'center', 
          marginBottom: '20px',
          fontSize: '18px',
          fontWeight: '600',
          color: '#1f2937'
        }}>
          Waste Flow Sankey Diagram
        </div>
        
      <ResponsiveContainer width="100%" height="90%">
        <Sankey
          data={data}
          node={customNode}
          link={customLink}
          nodePadding={20}
          nodeWidth={15}
          margin={{ top: 30, bottom: 30, left: 120, right: 120 }}
        >
          <Tooltip 
            formatter={(value) => `${value.toLocaleString()} kg`}
            contentStyle={{
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
              border: '1px solid #e5e7eb',
              borderRadius: '8px',
              padding: '12px',
              boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
            }}
            labelStyle={{
              fontWeight: '600',
              color: '#1f2937',
              marginBottom: '4px'
            }}
          />
        </Sankey>
      </ResponsiveContainer>
      
      {/* Legend */}
      <div style={{ 
        display: 'flex', 
        justifyContent: 'center', 
        gap: '24px', 
        marginTop: '16px',
        flexWrap: 'wrap'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#10B981', borderRadius: '4px' }}></div>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
            Recyclable: {data.totals.totalRecycle.toLocaleString()} kg
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#EF4444', borderRadius: '4px' }}></div>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
            Hazardous: {data.totals.totalHazardous.toLocaleString()} kg
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '16px', height: '16px', backgroundColor: '#F59E0B', borderRadius: '4px' }}></div>
          <span style={{ fontSize: '13px', fontWeight: '500', color: '#374151' }}>
            Bio-Solid: {data.totals.totalBioSolid.toLocaleString()} kg
          </span>
        </div>
      </div>
    </div>
  );
};

export default WasteSankeyChart;

