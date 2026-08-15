import React, { useEffect, useState } from 'react';
import { useSocket } from '../context/SocketContext';
import api from '../utils/api';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from 'recharts';

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const PRIORITY_COLORS = {
  Low: '#10b981',
  Medium: '#3b82f6',
  High: '#f59e0b',
  Critical: '#ef4444',
};

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const socket = useSocket();

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, analRes] = await Promise.all([
        api.get('/complaints/all'),
        api.get('/analytics/dashboard'),
      ]);
      setComplaints(compRes.data.complaints || []);
      setAnalytics(analRes.data);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      const res = await api.patch(`/complaints/${id}/status`, { status: newStatus });
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: res.data.complaint.status } : c))
      );
      // Refresh analytics after status change
      const analRes = await api.get('/analytics/dashboard');
      setAnalytics(analRes.data);
    } catch (err) {
      alert(err.response?.data?.message || 'Status update failed');
    }
  };

  // Format data for charts
  const categoryData = analytics?.categoryStats?.map((item) => ({
    name: item._id || 'Unassigned',
    value: item.count,
  })) || [];

  const priorityData = analytics?.priorityStats?.map((item) => ({
    name: item._id || 'Normal',
    count: item.count,
  })) || [];

  const trendData = analytics?.trendStats?.map((item) => ({
    date: item._id,
    complaints: item.count,
  })) || [];

  const total = complaints.length;
  const pending = complaints.filter((c) => c.status === 'Pending').length;
  const inProgress = complaints.filter((c) => c.status === 'In Progress').length;
  const resolved = complaints.filter((c) => c.status === 'Resolved' || c.status === 'Closed').length;

  return (
    <div style={{ padding: '24px', maxWidth: '1300px', margin: '0 auto', fontFamily: 'system-ui, sans-serif', backgroundColor: '#f8fafc', minHeight: '100vh' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <div>
          <h1 style={{ margin: 0, color: '#0f172a', fontSize: '28px' }}>👨‍💼 Admin AI Control Center</h1>
          <p style={{ margin: '4px 0 0', color: '#64748b' }}>Real-time issue routing & intelligence dashboard</p>
        </div>
      </div>

      {/* Metric Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '32px' }}>
        <div style={{ padding: '20px', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 2px 4px rgba(0,0,0,0.02)' }}>
          <span style={{ color: '#64748b', fontSize: '14px', fontWeight: '500' }}>Total Complaints</span>
          <p style={{ fontSize: '32px', fontWeight: '800', margin: '8px 0 0', color: '#0f172a' }}>{total}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#fffbeb', borderRadius: '16px', border: '1px solid #fef3c7' }}>
          <span style={{ color: '#b45309', fontSize: '14px', fontWeight: '500' }}>Pending</span>
          <p style={{ fontSize: '32px', fontWeight: '800', margin: '8px 0 0', color: '#b45309' }}>{pending}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#eff6ff', borderRadius: '16px', border: '1px solid #dbeafe' }}>
          <span style={{ color: '#1d4ed8', fontSize: '14px', fontWeight: '500' }}>In Progress</span>
          <p style={{ fontSize: '32px', fontWeight: '800', margin: '8px 0 0', color: '#1d4ed8' }}>{inProgress}</p>
        </div>
        <div style={{ padding: '20px', backgroundColor: '#f0fdf4', borderRadius: '16px', border: '1px solid #dcfce7' }}>
          <span style={{ color: '#15803d', fontSize: '14px', fontWeight: '500' }}>Resolved</span>
          <p style={{ fontSize: '32px', fontWeight: '800', margin: '8px 0 0', color: '#15803d' }}>{resolved}</p>
        </div>
      </div>

      {/* Visual Analytics Charts Section (Day 21) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '20px', marginBottom: '32px' }}>
        
        {/* Category Pie Chart */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: '16px' }}>🍩 Category Distribution</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={50} outerRadius={80} paddingAngle={5} dataKey="value">
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '60px' }}>No category data yet</p>
          )}
        </div>

        {/* Priority Bar Chart */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: '16px' }}>📊 Priority Breakdown</h3>
          {priorityData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={priorityData}>
                <XAxis dataKey="name" stroke="#94a3b8" />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]}>
                  {priorityData.map((entry, index) => (
                    <Cell key={`bar-${index}`} fill={PRIORITY_COLORS[entry.name] || '#3b82f6'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '60px' }}>No priority data yet</p>
          )}
        </div>

        {/* Daily Trends Line Chart */}
        <div style={{ backgroundColor: '#ffffff', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <h3 style={{ margin: '0 0 16px', color: '#1e293b', fontSize: '16px' }}>📈 Activity Trends (Last 7 Days)</h3>
          {trendData.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <LineChart data={trendData}>
                <XAxis dataKey="date" stroke="#94a3b8" />
                <YAxis allowDecimals={false} stroke="#94a3b8" />
                <Tooltip />
                <Line type="monotone" dataKey="complaints" stroke="#8b5cf6" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p style={{ color: '#94a3b8', textAlign: 'center', marginTop: '60px' }}>No trend history yet</p>
          )}
        </div>

      </div>

      {/* Complaints Table */}
      <h2 style={{ fontSize: '20px', color: '#0f172a', marginBottom: '16px' }}>📋 All Issues & Complaints</h2>
      
      {loading ? (
        <p>Loading analytics & complaints...</p>
      ) : error ? (
        <p style={{ color: 'red' }}>{error}</p>
      ) : (
        <div style={{ overflowX: 'auto', backgroundColor: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ backgroundColor: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                <th style={{ padding: '16px', color: '#475569', fontSize: '13px', fontWeight: '600' }}>TITLE</th>
                <th style={{ padding: '16px', color: '#475569', fontSize: '13px', fontWeight: '600' }}>CATEGORY (AI)</th>
                <th style={{ padding: '16px', color: '#475569', fontSize: '13px', fontWeight: '600' }}>PRIORITY</th>
                <th style={{ padding: '16px', color: '#475569', fontSize: '13px', fontWeight: '600' }}>CONFIDENCE</th>
                <th style={{ padding: '16px', color: '#475569', fontSize: '13px', fontWeight: '600' }}>STATUS</th>
                <th style={{ padding: '16px', color: '#475569', fontSize: '13px', fontWeight: '600' }}>ACTION</th>
              </tr>
            </thead>
            <tbody>
              {complaints.map((c) => (
                <tr key={c._id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '16px', fontWeight: '500' }}>
                    <div style={{ color: '#0f172a' }}>{c.title}</div>
                    <div style={{ fontSize: '12px', color: '#64748b', marginTop: '2px' }}>
                      By: {c.user?.name || 'User'} ({c.user?.email || 'N/A'})
                    </div>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ padding: '4px 10px', borderRadius: '8px', backgroundColor: '#f1f5f9', color: '#334155', fontSize: '13px', fontWeight: '500' }}>
                      {c.category}
                    </span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span
                      style={{
                        padding: '4px 10px',
                        borderRadius: '8px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: c.priority === 'Critical' ? '#fee2e2' : c.priority === 'High' ? '#ffedd5' : '#f1f5f9',
                        color: c.priority === 'Critical' ? '#dc2626' : c.priority === 'High' ? '#ea580c' : '#475569',
                      }}
                    >
                      {c.priority}
                    </span>
                  </td>
                  <td style={{ padding: '16px', color: '#2563eb', fontWeight: '700' }}>
                    {c.aiConfidence}%
                  </td>
                  <td style={{ padding: '16px' }}>
                    <span style={{ fontSize: '14px', color: '#334155' }}>{c.status}</span>
                  </td>
                  <td style={{ padding: '16px' }}>
                    <select
                      value={c.status}
                      onChange={(e) => handleStatusChange(c._id, e.target.value)}
                      style={{ padding: '6px 12px', borderRadius: '8px', border: '1px solid #cbd5e1', backgroundColor: '#ffffff', cursor: 'pointer' }}
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