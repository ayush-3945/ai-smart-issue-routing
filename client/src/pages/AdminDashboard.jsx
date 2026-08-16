import React, { useEffect, useState } from 'react';
import axios from 'axios';
import AnimatedCounter from '../components/AnimatedCounter';
import { ToastContainer, useToast } from '../components/Toast';
import { exportToCSV } from '../utils/exportCsv';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
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

const COLORS = ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];
const PRIORITY_BADGES = {
  Critical: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', dot: '#ef4444' },
  High: { bg: '#fffbeb', text: '#b45309', border: '#fde68a', dot: '#f59e0b' },
  Medium: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6' },
  Low: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', dot: '#10b981' },
};

const CATEGORIES = ['All', 'IT', 'HR', 'Finance', 'Operations', 'General'];
const API_BASE = 'https://ai-smart-issue-routing-production.up.railway.app/api';

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  let user = {};
  try {
    const raw = localStorage.getItem('user');
    if (raw && raw !== 'undefined') user = JSON.parse(raw);
  } catch (e) {
    user = {};
  }

  const getAuthHeaders = () => {
    const token = localStorage.getItem('accessToken');
    return { headers: { Authorization: `Bearer ${token}` } };
  };

  const fetchData = async () => {
    try {
      setLoading(true);
      const headers = getAuthHeaders();
      const [compRes, analRes] = await Promise.all([
        axios.get(`${API_BASE}/complaints/all`, headers),
        axios.get(`${API_BASE}/analytics/dashboard`, headers),
      ]);
      setComplaints(compRes.data.complaints || []);
      setAnalytics(analRes.data);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleStatusChange = async (id, newStatus) => {
    try {
      setUpdatingId(id);
      const res = await axios.patch(
        `${API_BASE}/complaints/${id}/status`,
        { status: newStatus },
        getAuthHeaders()
      );
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: res.data.complaint.status } : c))
      );
      const analRes = await axios.get(`${API_BASE}/analytics/dashboard`, getAuthHeaders());
      setAnalytics(analRes.data);
      addToast(`Status updated to "${newStatus}" successfully!`, newStatus === 'Resolved' ? 'success' : 'info');
    } catch (err) {
      addToast(err.response?.data?.message || 'Status update failed', 'error');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleCategoryChange = async (id, newCategory) => {
    try {
      const res = await axios.patch(
        `${API_BASE}/complaints/${id}/category`,
        { category: newCategory },
        getAuthHeaders()
      );
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, category: res.data.complaint.category } : c))
      );
      const analRes = await axios.get(`${API_BASE}/analytics/dashboard`, getAuthHeaders());
      setAnalytics(analRes.data);
      addToast(`Category re-classified to "${newCategory}"`, 'info');
    } catch (err) {
      addToast(err.response?.data?.message || 'Category update failed', 'error');
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    const matchesSearch =
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (c.user?.name && c.user.name.toLowerCase().includes(searchQuery.toLowerCase()));
    const matchesCategory = selectedCategory === 'All' || c.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

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

  const { theme } = useTheme();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.bg, color: theme.textPrimary, fontFamily: "'Inter', system-ui, sans-serif", padding: '32px 24px', transition: 'all 0.3s ease' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ maxWidth: '1350px', margin: '0 auto' }}>

        {/* Top Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: `1px solid ${theme.cardBorder}`, paddingBottom: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '10px 14px', borderRadius: '12px', fontSize: '20px' }}>⚡</div>
            <div>
              <h1 style={{ margin: 0, fontSize: '26px', fontWeight: '800', letterSpacing: '-0.5px', color: theme.textPrimary }}>
                SmartIssue <span style={{ background: 'linear-gradient(90deg, #818cf8, #c084fc)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>AI Command Center</span>
              </h1>
              <p style={{ margin: '4px 0 0', color: theme.textSecondary, fontSize: '14px' }}>Autonomous Issue Classification & Real-Time Resolution Ops</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <ThemeToggle />

            {/* Admin Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: '#fff' }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
              </div>
              <div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0', display: 'block', lineHeight: 1.2 }}>{user.name || 'Admin'}</span>
                <span style={{ fontSize: '11px', color: '#f59e0b', fontWeight: '700' }}>👑 Admin</span>
              </div>
            </div>

            {/* Export CSV Button */}
            <button
              onClick={() => {
                exportToCSV(filteredComplaints);
                addToast('📥 Exported analytics report to CSV!', 'success');
              }}
              style={{ backgroundColor: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', padding: '9px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px' }}
            >
              📥 Export CSV
            </button>

            <button
              onClick={() => window.location.href = '/dashboard'}
              style={{ backgroundColor: '#10b981', border: 'none', color: '#ffffff', padding: '9px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', boxShadow: '0 4px 12px rgba(16,185,129,0.3)' }}
            >
              📝 Raise Issue ➔
            </button>

            <button
              onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '9px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Animated Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', padding: '24px', transition: 'transform 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ color: '#94a3b8', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Issues</span>
            <div style={{ marginTop: '10px' }}><AnimatedCounter target={total} color="#ffffff" /></div>
          </div>

          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(245, 158, 11, 0.2)', borderRadius: '20px', padding: '24px', transition: 'transform 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ color: '#fbbf24', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Review</span>
            <div style={{ marginTop: '10px' }}><AnimatedCounter target={pending} color="#fbbf24" /></div>
          </div>

          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(59, 130, 246, 0.2)', borderRadius: '20px', padding: '24px', transition: 'transform 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ color: '#60a5fa', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>In Progress</span>
            <div style={{ marginTop: '10px' }}><AnimatedCounter target={inProgress} color="#60a5fa" /></div>
          </div>

          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(16, 185, 129, 0.2)', borderRadius: '20px', padding: '24px', transition: 'transform 0.2s' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ color: '#34d399', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resolved / Closed</span>
            <div style={{ marginTop: '10px' }}><AnimatedCounter target={resolved} color="#34d399" /></div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '36px' }}>
          
          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: '#e2e8f0' }}>🍩 Category AI Distribution</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={6} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center', marginTop: '70px' }}>No Data</p>
            )}
          </div>

          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: '#e2e8f0' }}>📊 Priority Breakdown</h3>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={priorityData}>
                  <XAxis dataKey="name" stroke="#64748b" />
                  <YAxis allowDecimals={false} stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={PRIORITY_BADGES[entry.name]?.dot || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center', marginTop: '70px' }}>No Data</p>
            )}
          </div>

          <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.6)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.06)', borderRadius: '20px', padding: '24px' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: '#e2e8f0' }}>📈 7-Day Velocity</h3>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={trendData}>
                  <XAxis dataKey="date" stroke="#64748b" />
                  <YAxis allowDecimals={false} stroke="#64748b" />
                  <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }} />
                  <Line type="monotone" dataKey="complaints" stroke="#a855f7" strokeWidth={3} dot={{ r: 6, fill: '#a855f7' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: '#64748b', textAlign: 'center', marginTop: '70px' }}>No Data</p>
            )}
          </div>
        </div>

        {/* Search & Filter */}
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', padding: '20px 24px', borderRadius: '20px', marginBottom: '28px' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 340px' }}>
              <input type="text" placeholder="🔍 Search issues by title, description or author..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '14px 20px', borderRadius: '12px', backgroundColor: 'rgba(15, 23, 42, 0.6)', border: '1px solid rgba(255,255,255,0.12)', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#94a3b8' }}>Category:</span>
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  style={{ padding: '8px 16px', borderRadius: '24px', border: '1px solid', borderColor: selectedCategory === cat ? '#6366f1' : 'rgba(255,255,255,0.1)', backgroundColor: selectedCategory === cat ? '#6366f1' : 'rgba(15, 23, 42, 0.4)', color: selectedCategory === cat ? '#ffffff' : '#94a3b8', fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', backdropFilter: 'blur(12px)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '20px', overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700' }}>📋 Active Issues Queue ({filteredComplaints.length})</h2>
          </div>

          {loading ? (
            <div style={{ padding: '24px' }}>
              {[1, 2, 3].map((i) => (
                <div key={i} style={{ padding: '20px 0', borderBottom: '1px solid rgba(255,255,255,0.04)', animation: 'pulse 1.5s ease-in-out infinite' }}>
                  <div style={{ height: '16px', width: '50%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '8px', marginBottom: '10px' }}></div>
                  <div style={{ height: '12px', width: '80%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}></div>
                </div>
              ))}
              <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
            </div>
          ) : filteredComplaints.length === 0 ? (
            <div style={{ padding: '50px', textAlign: 'center', color: '#64748b' }}>No matching complaints found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead>
                  <tr style={{ backgroundColor: 'rgba(15, 23, 42, 0.4)', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <th style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>ISSUE DETAILS</th>
                    <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>AI CATEGORY</th>
                    <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>PRIORITY</th>
                    <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>CONFIDENCE</th>
                    <th style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>LIFECYCLE ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((c) => {
                    const pStyle = PRIORITY_BADGES[c.priority] || PRIORITY_BADGES.Medium;
                    return (
                      <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background-color 0.2s' }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '20px 24px' }}>
                          <div style={{ color: '#ffffff', fontSize: '15px', fontWeight: '600' }}>{c.title}</div>
                          <div style={{ fontSize: '13px', color: '#94a3b8', marginTop: '4px' }}>{c.description}</div>
                          {c.aiSummary && (
                            <div style={{ marginTop: '8px', fontSize: '12px', color: '#c084fc', backgroundColor: 'rgba(168, 85, 247, 0.1)', padding: '6px 12px', borderRadius: '8px', display: 'inline-block' }}>
                              ✨ <strong>AI Summary:</strong> {c.aiSummary}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '20px' }}>
                          <select value={c.category} onChange={(e) => handleCategoryChange(c._id, e.target.value)}
                            style={{ padding: '8px 12px', borderRadius: '10px', backgroundColor: 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', fontSize: '13px', cursor: 'pointer' }}>
                            <option value="IT">IT</option>
                            <option value="HR">HR</option>
                            <option value="Finance">Finance</option>
                            <option value="Operations">Operations</option>
                            <option value="General">General</option>
                          </select>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px', borderRadius: '20px', fontSize: '12px', fontWeight: '700', backgroundColor: pStyle.bg, color: pStyle.text, border: `1px solid ${pStyle.border}` }}>
                            <span style={{ width: '6px', height: '6px', backgroundColor: pStyle.dot, borderRadius: '50%' }}></span>
                            {c.priority}
                          </span>
                        </td>
                        <td style={{ padding: '20px' }}>
                          <span style={{ color: '#818cf8', fontWeight: '800', fontSize: '14px' }}>{c.aiConfidence}%</span>
                        </td>
                        <td style={{ padding: '20px 24px' }}>
                          <select value={c.status} disabled={updatingId === c._id}
                            onChange={(e) => handleStatusChange(c._id, e.target.value)}
                            style={{ padding: '8px 14px', borderRadius: '10px', backgroundColor: c.status === 'Resolved' ? '#10b981' : c.status === 'In Progress' ? '#3b82f6' : 'rgba(15, 23, 42, 0.8)', border: '1px solid rgba(255,255,255,0.15)', color: '#ffffff', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}>
                            <option value="Pending">Pending</option>
                            <option value="In Progress">In Progress</option>
                            <option value="Resolved">Resolved</option>
                            <option value="Closed">Closed</option>
                          </select>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AdminDashboard;