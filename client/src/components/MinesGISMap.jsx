import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import api from '../utils/api';
import { useTheme } from '../context/ThemeContext';

// Fix for default marker icon issues in React Leaflet with Vite/Webpack
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MinesGISMap = ({ onBack }) => {
  const { theme } = useTheme();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  // Default center: Jharia Coal Field (23.7500, 86.4167) or Dhanbad (23.7957, 86.4304)
  const defaultCenter = [23.7500, 86.4167];

  useEffect(() => {
    const fetchHazards = async () => {
      try {
        const res = await api.get('/complaints/all');
        const allComplaints = res.data.complaints || res.data || [];
        // Filter out complaints without coordinates
        const mappedComplaints = allComplaints.filter(c => c.location && c.location.latitude && c.location.longitude);
        setComplaints(mappedComplaints);
      } catch (err) {
        console.error('Error fetching GIS data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchHazards();
  }, []);

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'Critical': return '#ef4444';
      case 'High': return '#f97316';
      case 'Medium': return '#eab308';
      case 'Low': return '#22c55e';
      default: return '#3b82f6';
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '75vh', // Fixed height to ensure map renders
      minHeight: '500px',
      width: '100%',
      backgroundColor: theme.background,
      position: 'relative',
      borderRadius: '16px',
      overflow: 'hidden',
      border: `1px solid ${theme.cardBorder}`,
      marginTop: '16px'
    }}>
      {/* Header */}
      <div style={{
        padding: '16px 20px',
        backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.85)' : 'rgba(255, 255, 255, 0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: `1px solid ${theme.cardBorder}`,
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        position: 'absolute',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000
      }}>
        <button
          onClick={onBack}
          style={{
            background: 'none',
            border: 'none',
            color: theme.textPrimary,
            fontSize: '18px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '8px',
            borderRadius: '8px',
            backgroundColor: theme.isDark ? 'rgba(255,255,255,0.05)' : '#f1f5f9'
          }}
        >
          ←
        </button>
        <div>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: theme.textPrimary }}>
            Mines GIS View
          </h2>
          <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary }}>
            {loading ? 'Loading hazards...' : `${complaints.length} hazards mapped`}
          </p>
        </div>
      </div>

      {/* Map Container */}
      <div style={{ flex: 1, marginTop: '72px', height: 'calc(100vh - 72px)' }}>
        <MapContainer
          center={defaultCenter}
          zoom={12}
          style={{ height: '100%', width: '100%', zIndex: 1 }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          
          {complaints.map(c => (
            <Marker key={c._id} position={[c.location.latitude, c.location.longitude]}>
              <Popup>
                <div style={{ minWidth: '150px' }}>
                  <h4 style={{ margin: '0 0 8px 0', fontSize: '14px', fontWeight: '700', color: '#1e293b' }}>
                    {c.title}
                  </h4>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Priority:</span>
                      <span style={{ fontWeight: '700', color: getPriorityColor(c.priority) }}>
                        {c.priority}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Status:</span>
                      <span style={{ fontWeight: '600', color: '#334155' }}>
                        {c.status}
                      </span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ color: '#64748b' }}>Category:</span>
                      <span style={{ fontWeight: '500', color: '#334155' }}>
                        {c.category}
                      </span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
};

export default MinesGISMap;
