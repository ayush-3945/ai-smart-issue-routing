import React, { useState } from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { useTheme } from '../context/ThemeContext';

const geoUrl = "/india-topo.json";

// Mock data for Indian States
const stateData = {
  "Jharkhand": { dmfCollected: "₹1,31,067.00 cr", dmfAllocated: "₹1,08,658.00 cr", dmfUtilized: "₹69,884.00 cr", minerals: ["Coal", "Iron Ore", "Uranium", "Mica"] },
  "Odisha": { dmfCollected: "₹1,50,000.00 cr", dmfAllocated: "₹1,20,000.00 cr", dmfUtilized: "₹85,000.00 cr", minerals: ["Iron Ore", "Bauxite", "Coal", "Chromite"] },
  "Chhattisgarh": { dmfCollected: "₹95,000.00 cr", dmfAllocated: "₹80,000.00 cr", dmfUtilized: "₹60,000.00 cr", minerals: ["Coal", "Iron Ore", "Tin", "Limestone"] },
  "Madhya Pradesh": { dmfCollected: "₹70,000.00 cr", dmfAllocated: "₹55,000.00 cr", dmfUtilized: "₹40,000.00 cr", minerals: ["Diamond", "Copper", "Coal", "Manganese"] },
  "Gujarat": { dmfCollected: "₹45,000.00 cr", dmfAllocated: "₹30,000.00 cr", dmfUtilized: "₹20,000.00 cr", minerals: ["Lignite", "Bauxite", "Limestone"] },
  "Maharashtra": { dmfCollected: "₹55,000.00 cr", dmfAllocated: "₹40,000.00 cr", dmfUtilized: "₹25,000.00 cr", minerals: ["Coal", "Manganese", "Iron Ore"] },
  "Rajasthan": { dmfCollected: "₹80,000.00 cr", dmfAllocated: "₹65,000.00 cr", dmfUtilized: "₹45,000.00 cr", minerals: ["Zinc", "Lead", "Silver", "Limestone"] },
  "Karnataka": { dmfCollected: "₹60,000.00 cr", dmfAllocated: "₹45,000.00 cr", dmfUtilized: "₹35,000.00 cr", minerals: ["Gold", "Iron Ore", "Manganese"] },
  "Andhra Pradesh": { dmfCollected: "₹40,000.00 cr", dmfAllocated: "₹25,000.00 cr", dmfUtilized: "₹15,000.00 cr", minerals: ["Mica", "Limestone", "Barytes"] },
  "Telangana": { dmfCollected: "₹50,000.00 cr", dmfAllocated: "₹35,000.00 cr", dmfUtilized: "₹20,000.00 cr", minerals: ["Coal", "Limestone"] },
  "West Bengal": { dmfCollected: "₹35,000.00 cr", dmfAllocated: "₹25,000.00 cr", dmfUtilized: "₹18,000.00 cr", minerals: ["Coal", "Fireclay"] },
  "Default": { dmfCollected: "₹15,000.00 cr", dmfAllocated: "₹10,000.00 cr", dmfUtilized: "₹5,000.00 cr", minerals: ["Limestone", "Sand"] }
};

const IndiaMapDashboard = () => {
  const { theme } = useTheme();
  const [selectedState, setSelectedState] = useState("Jharkhand");
  const [hoveredState, setHoveredState] = useState(null);

  const currentData = stateData[selectedState] || stateData["Default"];

  return (
    <section style={{ padding: '80px 48px', maxWidth: '1100px', margin: '0 auto', borderBottom: `1px solid ${theme.cardBorder}` }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 12px', color: theme.textPrimary, letterSpacing: '-0.5px' }}>
          State-wise Mining Summary
        </h2>
        <p style={{ color: theme.textSecondary, fontSize: '16px', margin: 0 }}>Interactive geospatial overview of mining operations and DMF funds across India.</p>
      </div>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', backgroundColor: theme.cardBg, borderRadius: '24px', padding: '40px', border: `1px solid ${theme.cardBorder}`, boxShadow: '0 20px 40px -15px rgba(0,0,0,0.3)' }}>
        
        {/* Left Side: Interactive Map */}
        <div style={{ flex: '1', minWidth: '350px', position: 'relative' }}>
          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 1000,
              center: [82.5, 22.5] // Centered on India
            }}
            style={{ width: '100%', height: '400px', backgroundColor: 'transparent' }}
          >
            <Geographies geography={geoUrl}>
              {({ geographies }) =>
                geographies.map((geo) => {
                  const stateName = geo.properties.name || geo.properties.ST_NM;
                  const isSelected = selectedState === stateName;
                  const isHovered = hoveredState === stateName;
                  
                  return (
                    <Geography
                      key={geo.rsmKey}
                      geography={geo}
                      onMouseEnter={() => setHoveredState(stateName)}
                      onMouseLeave={() => setHoveredState(null)}
                      onClick={() => setSelectedState(stateName)}
                      style={{
                        default: {
                          fill: isSelected ? '#f59e0b' : theme.isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                          stroke: theme.isDark ? 'rgba(255,255,255,0.2)' : '#cbd5e1',
                          strokeWidth: 0.75,
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        },
                        hover: {
                          fill: '#fbbf24',
                          stroke: theme.isDark ? 'rgba(255,255,255,0.4)' : '#94a3b8',
                          strokeWidth: 1,
                          outline: 'none',
                          cursor: 'pointer'
                        },
                        pressed: {
                          fill: '#d97706',
                          outline: 'none',
                        },
                      }}
                    />
                  );
                })
              }
            </Geographies>
          </ComposableMap>
          {hoveredState && (
            <div style={{ position: 'absolute', top: 0, right: 0, padding: '4px 12px', background: theme.isDark ? '#000' : '#fff', color: theme.isDark ? '#fff' : '#000', borderRadius: '4px', fontSize: '12px', fontWeight: 'bold' }}>
              {hoveredState}
            </div>
          )}
        </div>

        {/* Right Side: Data Panel */}
        <div style={{ flex: '1', minWidth: '300px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: theme.textPrimary, margin: '0 0 4px', borderBottom: `2px solid #f59e0b`, display: 'inline-block', paddingBottom: '4px' }}>
              {selectedState || "India"}
            </h3>
            <p style={{ color: theme.textSecondary, fontSize: '13px', margin: '4px 0 0' }}>Live District Mineral Foundation (DMF) Data</p>
          </div>

          <div style={{ backgroundColor: '#78350f', borderRadius: '12px', padding: '24px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(120, 53, 15, 0.4)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>
              <span style={{ fontWeight: '700', fontSize: '16px' }}>DMF Fund Status</span>
              <span style={{ fontSize: '12px', opacity: 0.8 }}>Till Jun 2026</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.9 }}>Fund Collected:</span>
                <span style={{ fontWeight: '800' }}>{currentData.dmfCollected}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.9 }}>Fund Allocated:</span>
                <span style={{ fontWeight: '800' }}>{currentData.dmfAllocated}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span style={{ opacity: 0.9 }}>Fund Utilized:</span>
                <span style={{ fontWeight: '800' }}>{currentData.dmfUtilized}</span>
              </div>
            </div>
          </div>

          <div style={{ backgroundColor: '#064e3b', borderRadius: '12px', padding: '24px', color: '#fff', boxShadow: '0 10px 25px -5px rgba(6, 78, 59, 0.4)' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', borderBottom: '1px solid rgba(255,255,255,0.2)', paddingBottom: '10px' }}>Important Minerals</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', fontSize: '14px' }}>
              {currentData.minerals.map((mineral, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ color: '#34d399' }}>●</span> {mineral}
                </div>
              ))}
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};

export default IndiaMapDashboard;
