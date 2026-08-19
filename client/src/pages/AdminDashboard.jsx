import React, { useEffect, useState } from 'react';
import api from '../utils/api';
import AnimatedCounter from '../components/AnimatedCounter';
import { ToastContainer, useToast } from '../components/Toast';
import { exportToCSV } from '../utils/exportCsv';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import IssueDetailModal from '../components/IssueDetailModal';
import NotificationBell from '../components/NotificationBell';
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

const AdminDashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const { toasts, addToast, removeToast } = useToast();

  let user = {};
  try {
    const raw = localStorage.getItem('user');
    if (raw && raw !== 'undefined') user = JSON.parse(raw);
  } catch (e) {
    user = {};
  }

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
      const res = await api.patch(`/complaints/${id}/status`, { status: newStatus });
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, status: res.data.complaint.status } : c))
      );
      const analRes = await api.get('/analytics/dashboard');
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
      const res = await api.patch(`/complaints/${id}/category`, { category: newCategory });
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, category: res.data.complaint.category, assignedTo: res.data.complaint.assignedTo } : c))
      );
      const analRes = await api.get('/analytics/dashboard');
      setAnalytics(analRes.data);
      addToast(`Category re-classified to "${newCategory}" & auto-assigned`, 'info');
    } catch (err) {
      addToast(err.response?.data?.message || 'Category update failed', 'error');
    }
  };

  const handleAssigneeChange = async (id, newAssignee) => {
    try {
      const res = await api.patch(`/complaints/${id}/assignee`, { assignedTo: newAssignee });
      setComplaints((prev) =>
        prev.map((c) => (c._id === id ? { ...c, assignedTo: res.data.complaint.assignedTo } : c))
      );
      addToast(`Reassigned to ${newAssignee}`, 'success');
    } catch (err) {
      addToast(err.response?.data?.message || 'Assignee update failed', 'error');
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
  const { t } = useLanguage();

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
                {t('adminCommandCenter')}
              </h1>
              <p style={{ margin: '4px 0 0', color: theme.textSecondary, fontSize: '14px' }}>{t('adminSubtitle')}</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <LanguageToggle />
            <ThemeToggle />
            <NotificationBell onSelectComplaint={(complaint) => setSelectedComplaint(complaint)} />

            {/* Admin Avatar - Icon Only */}
            <div title={`${user.name || 'Admin'} (Admin)`} style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, #f59e0b, #ef4444)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '800', color: '#fff', cursor: 'default' }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'A'}
            </div>

            {/* Export CSV - Icon Only */}
            <button
              title={t('exportCsv')}
              onClick={() => {
                exportToCSV(filteredComplaints);
                addToast('📥 Exported analytics report to CSV!', 'success');
              }}
              style={{ backgroundColor: 'rgba(99,102,241,0.15)', border: '1px solid rgba(99,102,241,0.3)', color: '#818cf8', width: '38px', height: '38px', borderRadius: '12px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              📥
            </button>

            {/* Raise Issue - Icon Only */}
            <button
              title={t('userView')}
              onClick={() => window.location.href = '/dashboard'}
              style={{ backgroundColor: '#10b981', border: 'none', color: '#ffffff', width: '38px', height: '38px', borderRadius: '12px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(16,185,129,0.3)', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              🚀
            </button>

            {/* Logout - Icon Only */}
            <button
              title={t('signOut')}
              onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
              style={{ backgroundColor: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.2)', color: '#ef4444', width: '38px', height: '38px', borderRadius: '12px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              🚪
            </button>
          </div>
        </div>

        {/* Animated Metric Cards */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: theme.cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', padding: '24px', transition: 'transform 0.2s', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ color: theme.textSecondary, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Total Issues</span>
            <div style={{ marginTop: '10px' }}><AnimatedCounter target={total} color={theme.textPrimary} /></div>
          </div>

          <div style={{ backgroundColor: theme.cardBg, backdropFilter: 'blur(12px)', border: '1px solid rgba(245, 158, 11, 0.3)', borderRadius: '20px', padding: '24px', transition: 'transform 0.2s', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ color: '#d97706', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Pending Review</span>
            <div style={{ marginTop: '10px' }}><AnimatedCounter target={pending} color="#d97706" /></div>
          </div>

          <div style={{ backgroundColor: theme.cardBg, backdropFilter: 'blur(12px)', border: '1px solid rgba(59, 130, 246, 0.3)', borderRadius: '20px', padding: '24px', transition: 'transform 0.2s', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ color: '#2563eb', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>In Progress</span>
            <div style={{ marginTop: '10px' }}><AnimatedCounter target={inProgress} color="#2563eb" /></div>
          </div>

          <div style={{ backgroundColor: theme.cardBg, backdropFilter: 'blur(12px)', border: '1px solid rgba(16, 185, 129, 0.3)', borderRadius: '20px', padding: '24px', transition: 'transform 0.2s', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
          >
            <span style={{ color: '#059669', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>Resolved / Closed</span>
            <div style={{ marginTop: '10px' }}><AnimatedCounter target={resolved} color="#059669" /></div>
          </div>
        </div>

        {/* Charts Section */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(380px, 1fr))', gap: '24px', marginBottom: '36px' }}>
          
          <div style={{ backgroundColor: theme.cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', padding: '24px', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: theme.textPrimary }}>🍩 Category AI Distribution</h3>
            {categoryData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <PieChart>
                  <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={85} paddingAngle={6} dataKey="value">
                    {categoryData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: theme.isDark ? '#1e293b' : '#ffffff', border: `1px solid ${theme.cardBorder}`, borderRadius: '8px', color: theme.textPrimary }} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: theme.textMuted, textAlign: 'center', marginTop: '70px' }}>No Data</p>
            )}
          </div>

          <div style={{ backgroundColor: theme.cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', padding: '24px', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: theme.textPrimary }}>📊 Priority Breakdown</h3>
            {priorityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <BarChart data={priorityData}>
                  <XAxis dataKey="name" stroke={theme.textMuted} />
                  <YAxis allowDecimals={false} stroke={theme.textMuted} />
                  <Tooltip contentStyle={{ backgroundColor: theme.isDark ? '#1e293b' : '#ffffff', border: `1px solid ${theme.cardBorder}`, borderRadius: '8px', color: theme.textPrimary }} />
                  <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]}>
                    {priorityData.map((entry, index) => (
                      <Cell key={`bar-${index}`} fill={PRIORITY_BADGES[entry.name]?.dot || '#6366f1'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: theme.textMuted, textAlign: 'center', marginTop: '70px' }}>No Data</p>
            )}
          </div>

          <div style={{ backgroundColor: theme.cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', padding: '24px', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: theme.textPrimary }}>📈 7-Day Velocity</h3>
            {trendData.length > 0 ? (
              <ResponsiveContainer width="100%" height={230}>
                <LineChart data={trendData}>
                  <XAxis dataKey="date" stroke={theme.textMuted} />
                  <YAxis allowDecimals={false} stroke={theme.textMuted} />
                  <Tooltip contentStyle={{ backgroundColor: theme.isDark ? '#1e293b' : '#ffffff', border: `1px solid ${theme.cardBorder}`, borderRadius: '8px', color: theme.textPrimary }} />
                  <Line type="monotone" dataKey="complaints" stroke="#a855f7" strokeWidth={3} dot={{ r: 6, fill: '#a855f7' }} />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <p style={{ color: theme.textMuted, textAlign: 'center', marginTop: '70px' }}>No Data</p>
            )}
          </div>
        </div>

        {/* AI Predictive Workload & Surge Forecast Card */}
        {analytics?.predictions && (
          <div className={theme.isDark ? 'glass-panel' : ''} style={{
            backgroundColor: theme.cardBg,
            borderRadius: '24px',
            padding: '28px 32px',
            marginBottom: '36px',
            border: `1px solid ${theme.isDark ? 'rgba(139, 92, 246, 0.3)' : '#e2e8f0'}`,
            background: theme.isDark 
              ? 'linear-gradient(135deg, rgba(15, 17, 26, 0.9) 0%, rgba(30, 27, 75, 0.4) 100%)' 
              : 'linear-gradient(135deg, #ffffff 0%, #f5f3ff 100%)',
            boxShadow: '0 20px 40px -15px rgba(139, 92, 246, 0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <span style={{ fontSize: '24px' }}>🔮</span>
                <div>
                  <h3 className="gradient-text" style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                    Gemini AI Workload & Surge Prediction (Next 7 Days)
                  </h3>
                  <p style={{ margin: '2px 0 0', fontSize: '13px', color: theme.textSecondary }}>
                    Predictive queue intelligence forecasting department bottlenecks and surge velocity.
                  </p>
                </div>
              </div>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '800',
                  backgroundColor: analytics.predictions.riskLevel === 'High' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                  color: analytics.predictions.riskLevel === 'High' ? '#ef4444' : '#f59e0b',
                  border: `1px solid ${analytics.predictions.riskLevel === 'High' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                }}>
                  ● Surge Risk: {analytics.predictions.riskLevel} ({analytics.predictions.projectedSurgePercentage || 25}%)
                </span>
                <span style={{
                  padding: '6px 14px',
                  borderRadius: '20px',
                  fontSize: '12px',
                  fontWeight: '700',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: '#818cf8',
                  border: '1px solid rgba(99, 102, 241, 0.3)'
                }}>
                  Primary Spike: {analytics.predictions.primarySurgeDepartment || 'IT'}
                </span>
              </div>
            </div>

            <div style={{
              padding: '16px 20px',
              borderRadius: '16px',
              backgroundColor: theme.isDark ? 'rgba(18, 21, 33, 0.8)' : '#ffffff',
              border: `1px solid ${theme.cardBorder}`,
              marginBottom: '20px'
            }}>
              <p style={{ margin: '0 0 8px', fontSize: '14px', color: theme.textPrimary, lineHeight: 1.6 }}>
                📊 <strong>Executive Forecast:</strong> {analytics.predictions.forecastSummary}
              </p>
              <p style={{ margin: 0, fontSize: '13px', color: '#10b981', fontWeight: '600' }}>
                💡 <strong>Staffing Action:</strong> {analytics.predictions.actionableRecommendation}
              </p>
            </div>

            {/* Department Forecast Pills */}
            {analytics.predictions.departmentForecasts && (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                {analytics.predictions.departmentForecasts.map((dept, i) => (
                  <div key={i} style={{
                    padding: '14px 18px',
                    borderRadius: '14px',
                    backgroundColor: theme.isDark ? 'rgba(18, 21, 33, 0.6)' : '#f8fafc',
                    border: `1px solid ${theme.cardBorder}`
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px', fontWeight: '700', color: theme.textPrimary }}>
                        {dept.department}
                      </span>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: '800',
                        padding: '2px 8px',
                        borderRadius: '8px',
                        backgroundColor: dept.risk === 'High' ? 'rgba(239, 68, 68, 0.15)' : dept.risk === 'Moderate' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(16, 185, 129, 0.15)',
                        color: dept.risk === 'High' ? '#ef4444' : dept.risk === 'Moderate' ? '#f59e0b' : '#10b981'
                      }}>
                        {dept.projectedVolume}
                      </span>
                    </div>
                    <p style={{ margin: 0, fontSize: '11px', color: theme.textMuted }}>
                      {dept.insight}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Search & Filter */}
        <div style={{ backgroundColor: theme.cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${theme.cardBorder}`, padding: '20px 24px', borderRadius: '20px', marginBottom: '28px', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ flex: '1 1 340px' }}>
              <input type="text" placeholder="🔍 Search issues by title, description or author..."
                value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                style={{ width: '100%', padding: '14px 20px', borderRadius: '12px', backgroundColor: theme.inputBg, border: `1px solid ${theme.cardBorder}`, color: theme.textPrimary, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
              <span style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary }}>Category:</span>
              {CATEGORIES.map((cat) => (
                <button key={cat} onClick={() => setSelectedCategory(cat)}
                  style={{ padding: '8px 16px', borderRadius: '24px', border: '1px solid', borderColor: selectedCategory === cat ? '#6366f1' : theme.cardBorder, backgroundColor: selectedCategory === cat ? '#6366f1' : theme.badgeBg, color: selectedCategory === cat ? '#ffffff' : theme.textSecondary, fontSize: '13px', fontWeight: '600', cursor: 'pointer', transition: 'all 0.2s' }}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Complaints Table */}
        <div style={{ backgroundColor: theme.cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', overflow: 'hidden', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
          <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.tableRowBorder}` }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: theme.textPrimary }}>📋 Active Issues Queue ({filteredComplaints.length})</h2>
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
                    <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>ASSIGNED LEAD</th>
                    <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>PRIORITY</th>
                    <th style={{ padding: '16px 20px', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>CONFIDENCE</th>
                    <th style={{ padding: '16px 24px', color: '#94a3b8', fontSize: '12px', fontWeight: '700' }}>LIFECYCLE ACTION</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredComplaints.map((c) => {
                    const pStyle = PRIORITY_BADGES[c.priority] || PRIORITY_BADGES.Medium;
                    return (
                      <tr key={c._id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)', transition: 'background-color 0.2s', cursor: 'pointer' }}
                        onClick={() => setSelectedComplaint(c)}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'rgba(99,102,241,0.05)'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                      >
                        <td style={{ padding: '20px 24px' }}>
                          <div style={{ color: theme.textPrimary, fontSize: '15px', fontWeight: '600' }}>
                            {c.title}
                            {c.comments && c.comments.length > 0 && (
                              <span style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                                💬 {c.comments.length}
                              </span>
                            )}
                            {c.attachments && c.attachments.length > 0 && (
                              <span style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                                📎 {c.attachments.length}
                              </span>
                            )}
                          </div>
                          <div style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '4px' }}>{c.description}</div>
                          {c.aiSummary && (
                            <div style={{ marginTop: '8px', fontSize: '12px', color: theme.isDark ? '#c084fc' : '#7c3aed', backgroundColor: theme.isDark ? 'rgba(168, 85, 247, 0.1)' : 'rgba(124, 58, 237, 0.08)', padding: '6px 12px', borderRadius: '8px', display: 'inline-block' }}>
                              ✨ <strong>AI Summary:</strong> {c.aiSummary}
                            </div>
                          )}
                        </td>
                        <td style={{ padding: '20px' }} onClick={(e) => e.stopPropagation()}>
                          <select value={c.category} onChange={(e) => handleCategoryChange(c._id, e.target.value)}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '12px',
                              backgroundColor: theme.isDark ? '#1e293b' : '#f8fafc',
                              border: `1px solid ${theme.isDark ? 'rgba(99, 102, 241, 0.3)' : '#cbd5e1'}`,
                              color: theme.isDark ? '#ffffff' : '#0f172a',
                              fontSize: '13px',
                              fontWeight: '600',
                              cursor: 'pointer',
                              outline: 'none',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                            <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="IT">💻 IT</option>
                            <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="HR">👥 HR</option>
                            <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Finance">💳 Finance</option>
                            <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Operations">🏢 Operations</option>
                            <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="General">🌐 General</option>
                          </select>
                        </td>
                        <td style={{ padding: '20px' }} onClick={(e) => e.stopPropagation()}>
                          <select value={c.assignedTo || 'Unassigned'} onChange={(e) => handleAssigneeChange(c._id, e.target.value)}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '12px',
                              backgroundColor: theme.isDark ? 'rgba(99, 102, 241, 0.15)' : 'rgba(99, 102, 241, 0.08)',
                              border: `1px solid ${theme.isDark ? 'rgba(129, 140, 248, 0.4)' : '#a5b4fc'}`,
                              color: theme.isDark ? '#e0e7ff' : '#4338ca',
                              fontSize: '13px',
                              fontWeight: '700',
                              cursor: 'pointer',
                              outline: 'none',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                            <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Vikram Sharma">👤 Vikram Sharma (IT)</option>
                            <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Neha Verma">👤 Neha Verma (HR)</option>
                            <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Rohan Mehta">👤 Rohan Mehta (Finance)</option>
                            <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Pooja Singh">👤 Pooja Singh (Ops)</option>
                            <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Support Desk">👤 Support Desk</option>
                            <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Unassigned">Unassigned</option>
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
                        <td style={{ padding: '20px 24px' }} onClick={(e) => e.stopPropagation()}>
                          <select value={c.status} disabled={updatingId === c._id}
                            onChange={(e) => handleStatusChange(c._id, e.target.value)}
                            style={{
                              padding: '8px 14px',
                              borderRadius: '12px',
                              backgroundColor: c.status === 'Resolved' ? '#10b981' : c.status === 'In Progress' ? '#3b82f6' : (theme.isDark ? '#1e293b' : '#f8fafc'),
                              border: `1px solid ${c.status === 'Resolved' ? '#059669' : c.status === 'In Progress' ? '#2563eb' : (theme.isDark ? 'rgba(255,255,255,0.1)' : '#cbd5e1')}`,
                              color: (c.status === 'Resolved' || c.status === 'In Progress') ? '#ffffff' : (theme.isDark ? '#f8fafc' : '#0f172a'),
                              fontWeight: '700',
                              fontSize: '13px',
                              cursor: 'pointer',
                              outline: 'none',
                              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                            }}>
                            <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Pending">⏳ Pending</option>
                            <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="In Progress">⚡ In Progress</option>
                            <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Resolved">✅ Resolved</option>
                            <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Closed">🔒 Closed</option>
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

        {/* Issue Discussion & Detail Modal */}
        {selectedComplaint && (
          <IssueDetailModal
            complaint={selectedComplaint}
            currentUser={user}
            onClose={() => setSelectedComplaint(null)}
            onComplaintUpdated={(updatedComplaint) => {
              setComplaints((prev) =>
                prev.map((item) => (item._id === updatedComplaint._id ? updatedComplaint : item))
              );
              setSelectedComplaint(updatedComplaint);
            }}
          />
        )}

      </div>
    </div>
  );
};

export default AdminDashboard;