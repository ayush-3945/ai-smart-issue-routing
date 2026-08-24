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
    <section style={{ position: 'relative', padding: '80px 20px', margin: '0 auto', borderBottom: `1px solid ${theme.cardBorder}`, overflow: 'hidden' }}>
      {/* Background Gradients */}
      <div style={{ position: 'absolute', top: '20%', left: '-150px', width: '500px', height: '500px', background: 'radial-gradient(circle, rgba(245, 158, 11, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }}></div>
      <div style={{ position: 'absolute', bottom: '-50px', right: '-150px', width: '600px', height: '600px', background: 'radial-gradient(circle, rgba(14, 165, 233, 0.08) 0%, transparent 70%)', pointerEvents: 'none' }}></div>

      <div style={{ maxWidth: '1100px', margin: '0 auto', position: 'relative', zIndex: 1 }}>
      <div style={{ textAlign: 'center', marginBottom: '40px' }}>
        <h2 style={{ fontSize: '32px', fontWeight: '800', margin: '0 0 12px', color: theme.textPrimary, letterSpacing: '-0.5px' }}>
          State-wise Mining Summary
        </h2>
        <p style={{ color: theme.textSecondary, fontSize: '16px', margin: 0 }}>Interactive geospatial overview of mining operations and DMF funds across India.</p>
      </div>

      <div style={{ display: 'flex', gap: '40px', flexWrap: 'wrap', background: theme.isDark ? 'rgba(15, 23, 42, 0.6)' : 'rgba(255, 255, 255, 0.8)', backdropFilter: 'blur(20px)', padding: '20px', borderRadius: '24px', border: `1px solid ${theme.cardBorder}`, boxShadow: theme.isDark ? '0 20px 40px rgba(0,0,0,0.4)' : '0 20px 40px -10px rgba(0,0,0,0.1)' }}>
        
        {/* Left Side: Interactive Map */}
        <div style={{ flex: '2 1 500px', minWidth: '300px', position: 'relative', background: theme.isDark ? 'rgba(0,0,0,0.2)' : 'linear-gradient(135deg, rgba(37,99,235,0.05), rgba(16,185,129,0.05))', borderRadius: '16px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: `1px solid ${theme.cardBorder}` }}>
          
          {/* Dashed Concentric Circles Background */}
          <svg style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', width: '800px', height: '800px', pointerEvents: 'none', opacity: theme.isDark ? 0.2 : 0.5 }} viewBox="0 0 800 800">
            {[...Array(15)].map((_, i) => (
              <circle key={i} cx="400" cy="400" r={(i + 1) * 30} fill="none" stroke={theme.isDark ? '#475569' : '#cbd5e1'} strokeWidth="1" strokeDasharray="4 4" />
            ))}
          </svg>

          <ComposableMap
            projection="geoMercator"
            projectionConfig={{
              scale: 1100,
              center: [82.5, 22.5]
            }}
            style={{ width: '100%', height: '500px', backgroundColor: 'transparent', position: 'relative', zIndex: 1 }}
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
                          fill: isSelected ? '#f59e0b' : '#274b78',
                          stroke: '#ffffff',
                          strokeWidth: 0.5,
                          outline: 'none',
                          transition: 'all 0.2s ease',
                          cursor: 'pointer'
                        },
                        hover: {
                          fill: '#3b6a9e',
                          stroke: '#ffffff',
                          strokeWidth: 1,
                          outline: 'none',
                          cursor: 'pointer'
                        },
                        pressed: {
                          fill: '#1e3a5f',
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

        {/* Right Side: State Info & Analytics */}
        <div style={{ flex: '1 1 300px', maxWidth: '400px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', border: `1px solid ${theme.cardBorder}`, boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '800', color: theme.textPrimary, margin: '0 0 4px', borderBottom: `2px solid #f59e0b`, display: 'inline-block', paddingBottom: '4px' }}>
              {selectedState || "India"}
            </h3>
            <p style={{ color: theme.textSecondary, fontSize: '13px', margin: '4px 0 0' }}>Live District Mineral Foundation (DMF) Data</p>
          </div>

          <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', border: `1px solid ${theme.cardBorder}`, boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '20px', borderBottom: '1px solid rgba(128,128,128,0.2)', paddingBottom: '10px' }}>
              <span style={{ fontWeight: '700', fontSize: '16px', color: theme.textPrimary }}>DMF Fund Status</span>
              <span style={{ fontSize: '12px', color: theme.textSecondary }}>Till Jun 2026</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', fontSize: '14px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.textPrimary }}>
                <span>Fund Collected:</span>
                <span style={{ fontWeight: '800' }}>{currentData.dmfCollected}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.textPrimary }}>
                <span>Fund Allocated:</span>
                <span style={{ fontWeight: '800' }}>{currentData.dmfAllocated}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: theme.textPrimary }}>
                <span>Fund Utilized:</span>
                <span style={{ fontWeight: '800' }}>{currentData.dmfUtilized}</span>
              </div>
            </div>
          </div>

          {/* Minerals Chips */}
          <div style={{ background: theme.cardBg, borderRadius: '16px', padding: '24px', border: `1px solid ${theme.cardBorder}`, boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h4 style={{ margin: '0 0 16px', fontSize: '16px', fontWeight: '700', color: theme.textPrimary, borderBottom: '1px solid rgba(128,128,128,0.2)', paddingBottom: '10px' }}>Important Minerals</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {currentData.minerals.map((mineral, i) => (
                <span key={i} style={{ padding: '6px 12px', borderRadius: '20px', background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#f59e0b', fontSize: '13px', fontWeight: '600' }}>
                  {mineral}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
      </div>
    </section>
  );
};

export default IndiaMapDashboard;
