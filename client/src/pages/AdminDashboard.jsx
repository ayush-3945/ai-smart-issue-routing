import React, { useEffect, useState } from 'react';

import { useSocket } from '../context/SocketContext';
import api from '../utils/api';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socket = useSocket();

  const fetchAllComplaints = async () => {
    try {
      setLoading(true);
      const res = await api.get('/complaints/all');
      setComplaints(res.data.complaints || []);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch complaints');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAllComplaints();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.patch(`/complaints/${id}/status`, { status: newStatus });
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: res.data.complaint.status } : c))
      );
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  // Metrics calculation
  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto', fontFamily: 'sans-serif' }}>
      <h1 style={{ marginBottom: '20px', color: '#1e293b' }}>👨‍💼 Admin AI Control Center</h1>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '20px', backgroundColor: '#f1f5f9', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, color: '#64748b' }}>Total Complaints</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0', color: '#0f172a' }}>{total}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#fef3c7', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, color: '#d97706' }}>Pending</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0', color: '#b45309' }}>{pending}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#dbeafe', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, color: '#2563eb' }}>In Progress</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0', color: '#1d4ed8' }}>{inProgress}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#dcfce7', borderRadius: '12px', textAlign: 'center' }}>
          <h3 style={{ margin: 0, color: '#16a34a' }}>Resolved</h3>
          <p style={{ fontSize: '32px', fontWeight: 'bold', margin: '8px 0 0', color: '#15803d' }}>{resolved}</p>
        </div>
      </div>

      {loading ? (
        <p>Loading complaints...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1)' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                <th style={{ padding: '16px' }}>Title</th>
                <th style={{ padding: '16px' }}>Category (AI)</th>
                <th style={{ padding: '16px' }}>Priority</th>
                <th style={{ padding: '16px' }}>Confidence</th>
                <th style={{ padding: '16px' }}>Status</th>
                <th style={{ padding: '16px' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: '500' }}>
                    {c.title}
                    <div style={{ fontSize: '12px', color: '#64748b' }}>User: {c.user?.name || 'Unknown'} ({c.user?.email})</div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '12px', backgroundColor: '#e2e8f0', fontSize: '13px' }}>
                      {c.category}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '12px',
                        fontSize: '13px',
                        fontWeight: 'bold',
                        backgroundColor: c.priority === 'Critical' ? '#fee2e2' : c.priority === 'High' ? '#ffedd5' : '#f1f5f9',
                        color: c.priority === 'Critical' ? '#991b1b' : c.priority === 'High' ? '#c2410c' : '#334155',
                      }}
                    >
                      {c.priority}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#2563eb', fontWeight: 'bold' }}>
                    {c.aiConfidence}%
                  </td>
                  <td style={{ padding: '16px' }}>{c.status}</td>
                  <td style={{ padding: '16px' }}>
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c._id, e.target.value)}
                      style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid #cbd5e1' }}
                    >
                      <option value="Pending">Pending</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Resolved">Resolved</option>
                      <option value="Closed">Closed</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;