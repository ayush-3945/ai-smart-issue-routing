import React, { useEffect, useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
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
import InstallPwaButton from '../components/InstallPwaButton';
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

const COLORS = ['#ef4444', '#10b981', '#f59e0b', '#06b6d4', '#8b5cf6', '#64748b'];
const PRIORITY_BADGES = {
  Critical: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', dot: '#ef4444' },
  High: { bg: '#fffbeb', text: '#b45309', border: '#fde68a', dot: '#f59e0b' },
  Medium: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6' },
  Low: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', dot: '#10b981' },
};

const CATEGORIES = ['All', 'Safety', 'Environment', 'Equipment', 'Labour', 'Production', 'General'];
import CodeHelpSidebar from '../components/CodeHelpSidebar';
import CommandPalette from '../components/CommandPalette';

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [updatingId, setUpdatingId] = useState(null);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isCommandOpen, setIsCommandOpen] = useState(false);
  const [selectedContractorTier, setSelectedContractorTier] = useState('All');
  const [attendanceLogs, setAttendanceLogs] = useState([]);
  const [selectedFleetFilter, setSelectedFleetFilter] = useState('All');
  const [selectedContractorData, setSelectedContractorData] = useState(null);
  const [contractorModalTab, setContractorModalTab] = useState('attendance');
  const { toasts, addToast, removeToast } = useToast();

  // Autonomous IoT Sensor Telemetry State
  const [iotSensors, setIotSensors] = useState({ methane: 0.38, co: 14, airflow: 4.2, strata: 14.5 });
  const [isSpiking, setIsSpiking] = useState(false);
  const [lastSpikeTriggered, setLastSpikeTriggered] = useState(null);

  // Subtle real-time sensor fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setIotSensors((prev) => {
        if (prev.methane > 1.0) return prev; // Keep spike active until user refreshes or resets
        return {
          methane: parseFloat((0.34 + Math.random() * 0.08).toFixed(2)),
          co: Math.floor(12 + Math.random() * 5),
          airflow: parseFloat((4.1 + Math.random() * 0.3).toFixed(1)),
          strata: parseFloat((14.2 + Math.random() * 0.6).toFixed(1))
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleSimulateSpike = async () => {
    setIsSpiking(true);
    setIotSensors({
      methane: 1.85,
      co: 88,
      airflow: 1.6,
      strata: 28.4
    });

    try {
      const automatedIncident = {
        title: '🚨 IoT Telemetry Alert: Critical Methane (CH4) Surge 1.85% at Pit 4 / Shaft B',
        description: 'AUTONOMOUS SENSOR INGESTION: Continuous underground mine telemetry detected dangerous methane surge of 1.85% (DGMS statutory evacuation threshold >1.40% under CMR 2017 Reg 153). Carbon Monoxide spiked to 88 PPM and intake airflow dropped below safety limit to 1.6 m/s. Autonomous ventilation auxiliary fans engaged. Immediate personnel evacuation and safety nodal controller dispatch required.',
        mineSite: 'Jharia Colliery - Pit 4 (Underground)'
      };

      const res = await api.post('/complaints', automatedIncident);
      setLastSpikeTriggered(new Date().toLocaleTimeString());
      addToast(`🚨 Autonomous IoT Sensor Breach Ingested! AI routed to DGMS Safety Controller with Emergency Containment SOP.`, 'warning', 7000);

      await fetchData();
    } catch (err) {
      console.error('Spike simulation failed:', err);
      addToast(err.response?.data?.message || 'Failed to trigger autonomous IoT incident', 'error', 4000);
    } finally {
      setIsSpiking(false);
    }
  };

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
      const [compRes, analRes, attRes] = await Promise.all([
        api.get('/complaints/all'),
        api.get('/analytics/dashboard'),
        api.get('/attendance').catch(() => ({ data: { data: [] } }))
      ]);
      setComplaints(compRes.data.complaints || []);
      setAnalytics(analRes.data);
      setAttendanceLogs(attRes.data.data || []);
    } catch (err) {
      console.error('Admin fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/login');
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
      addToast(`Assigned lead updated to "${newAssignee}"`, 'info');
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
    <div style={{ display: 'flex', minHeight: '100vh', backgroundColor: theme.bg, color: theme.textPrimary, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif" }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />

      {/* CodeHelp Style Vertical Sidebar */}
      <CodeHelpSidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        currentUser={user}
        onOpenSearch={() => setIsCommandOpen(true)}
      />

      {/* Global Quick Search Command Palette (Ctrl + K) */}
      <CommandPalette
        isOpen={isCommandOpen}
        onClose={setIsCommandOpen}
        complaints={complaints}
        onSelectComplaint={(c) => setSelectedComplaint(c)}
      />

      {/* Main Content Area */}
      <div className="admin-main-content" style={{ flex: 1, padding: '32px 36px', overflowY: 'auto', maxHeight: '100vh', width: '100%', boxSizing: 'border-box' }}>
        <div style={{ maxWidth: '1280px', margin: '0 auto' }}>

          {/* Top Header with Breadcrumb & Quick Search */}
          <div className="dashboard-header" style={{ borderBottom: `1px solid ${theme.cardBorder}` }}>
            <div className="dashboard-top-row">
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '11px', color: theme.textMuted, fontWeight: '700', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '2px' }}>
                  <span
                    onClick={() => navigate('/')}
                    title={t('backToHome')}
                    style={{ cursor: 'pointer', transition: 'color 0.2s' }}
                    onMouseEnter={(e) => e.currentTarget.style.color = '#fbbf24'}
                    onMouseLeave={(e) => e.currentTarget.style.color = theme.textMuted}
                  >
                    ← Home
                  </span>
                  <span>/</span>
                  <span style={{ color: '#f59e0b' }}>Command Center</span>
                </div>
                <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '900', letterSpacing: '-0.5px', color: theme.textPrimary }}>
                  {t('adminCommandCenter')}
                </h1>
              </div>

              {/* User Dashboard Switch on Mobile */}
              <button
                onClick={() => navigate('/dashboard')}
                title="Go to User Dashboard"
                style={{
                  padding: '7px 12px',
                  borderRadius: '10px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  color: '#fbbf24',
                  fontSize: '12px',
                  fontWeight: '700',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px'
                }}
              >
                <span>⛏️</span>
                <span>Field Portal</span>
              </button>
            </div>

            <div className="dashboard-controls">
              {/* Quick Search Pill */}
              <button
                onClick={() => setIsCommandOpen(true)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  padding: '7px 12px',
                  borderRadius: '10px',
                  backgroundColor: theme.isDark ? 'rgba(18, 21, 33, 0.8)' : '#f1f5f9',
                  border: `1px solid ${theme.cardBorder}`,
                  color: theme.textSecondary,
                  fontSize: '12px',
                  cursor: 'pointer',
                  fontWeight: '600'
                }}
              >
                <span>🔍 Quick Jump</span>
                <span style={{ fontSize: '9px', fontWeight: '800', padding: '1px 5px', borderRadius: '4px', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0' }}>Ctrl K</span>
              </button>

              <InstallPwaButton />

              <button
                title="Sign Out"
                onClick={handleLogout}
                style={{ background: 'rgba(239, 68, 68, 0.1)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#ef4444', padding: '0 12px', height: '32px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'inline-flex', alignItems: 'center', gap: '6px', transition: 'all 0.2s' }}
                onMouseEnter={(e) => { e.currentTarget.style.background = '#ef4444'; e.currentTarget.style.color = '#fff'; }}
                onMouseLeave={(e) => { e.currentTarget.style.background = 'rgba(239, 68, 68, 0.1)'; e.currentTarget.style.color = '#ef4444'; }}
              >
                <span>🚪</span>
                <span>Sign Off</span>
              </button>
              <LanguageToggle />
              <ThemeToggle />
              <NotificationBell onSelectComplaint={(complaint) => setSelectedComplaint(complaint)} />

              {/* Export CSV */}
              <button
                title={t('exportCsv')}
                onClick={() => {
                  exportToCSV(filteredComplaints);
                  addToast('📥 Exported analytics report to CSV!', 'success');
                }}
                style={{ backgroundColor: 'rgba(245, 158, 11, 0.12)', border: '1px solid rgba(245, 158, 11, 0.3)', color: '#fbbf24', width: '36px', height: '36px', borderRadius: '10px', cursor: 'pointer', fontSize: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', transition: 'transform 0.2s', boxShadow: '0 0 10px rgba(245, 158, 11, 0.15)' }}
              >
                📥
              </button>
            </div>
          </div>

          {/* Animated Metric Cards (Overview Section) */}
          <div id="section-overview" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
            <div style={{ backgroundColor: theme.cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', padding: '24px', transition: 'transform 0.2s', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ color: theme.textSecondary, fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('totalIssues')}</span>
              <div style={{ marginTop: '10px' }}><AnimatedCounter target={total} color={theme.textPrimary} /></div>
            </div>

            <div style={{ backgroundColor: theme.cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', padding: '24px', transition: 'transform 0.2s', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ color: '#d97706', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('pendingReview')}</span>
              <div style={{ marginTop: '10px' }}><AnimatedCounter target={pending} color="#d97706" /></div>
            </div>

            <div style={{ backgroundColor: theme.cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', padding: '24px', transition: 'transform 0.2s', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ color: '#2563eb', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('inProgress')}</span>
              <div style={{ marginTop: '10px' }}><AnimatedCounter target={inProgress} color="#2563eb" /></div>
            </div>

            <div style={{ backgroundColor: theme.cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', padding: '24px', transition: 'transform 0.2s', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <span style={{ color: '#059669', fontSize: '13px', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.5px' }}>{t('resolvedClosed')}</span>
              <div style={{ marginTop: '10px' }}><AnimatedCounter target={resolved} color="#059669" /></div>
            </div>
          </div>

          {/* Live IoT Telemetry & Autonomous Sensor Ingestion Section */}
          <div id="section-iot" className={theme.isDark ? 'glass-panel' : ''} style={{
            backgroundColor: theme.cardBg,
            borderRadius: '24px',
            padding: '28px 32px',
            marginBottom: '36px',
            border: `1px solid ${iotSensors.methane > 1.25 ? 'rgba(239, 68, 68, 0.45)' : 'rgba(245, 158, 11, 0.3)'}`,
            background: theme.isDark
              ? iotSensors.methane > 1.25
                ? 'linear-gradient(135deg, rgba(25, 10, 10, 0.95) 0%, rgba(239, 68, 68, 0.12) 100%)'
                : 'linear-gradient(135deg, rgba(15, 17, 26, 0.95) 0%, rgba(245, 158, 11, 0.06) 100%)'
              : iotSensors.methane > 1.25
                ? 'linear-gradient(135deg, #ffffff 0%, #fef2f2 100%)'
                : 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
            boxShadow: iotSensors.methane > 1.25
              ? '0 20px 40px -15px rgba(239, 68, 68, 0.3)'
              : '0 20px 40px -15px rgba(245, 158, 11, 0.12)'
          }}>
            {/* Header Row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '24px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div style={{
                  width: '42px',
                  height: '42px',
                  borderRadius: '12px',
                  background: iotSensors.methane > 1.25 ? 'linear-gradient(135deg, #ef4444, #dc2626)' : 'linear-gradient(135deg, #f59e0b, #ea580c)',
                  color: '#fff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '20px',
                  boxShadow: iotSensors.methane > 1.25 ? '0 0 20px rgba(239, 68, 68, 0.6)' : '0 0 15px rgba(245, 158, 11, 0.4)'
                }}>
                  📡
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: theme.textPrimary }}>
                      {t('iotSectionTitle')}
                    </h2>
                    <span style={{
                      padding: '2px 8px',
                      borderRadius: '12px',
                      backgroundColor: iotSensors.methane > 1.25 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                      color: iotSensors.methane > 1.25 ? '#ef4444' : '#10b981',
                      fontSize: '11px',
                      fontWeight: '800',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '4px'
                    }}>
                      <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: iotSensors.methane > 1.25 ? '#ef4444' : '#10b981', animation: 'pulse 1s infinite' }}></span>
                      {iotSensors.methane > 1.25 ? 'CRITICAL BREACH' : 'LIVE 3s TELEMETRY'}
                    </span>
                  </div>
                  <p style={{ margin: '2px 0 0', fontSize: '12px', color: theme.textSecondary }}>
                    {t('iotSectionSubtitle')}
                  </p>
                </div>
              </div>

              {/* Spike Simulation Button */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                {lastSpikeTriggered && (
                  <span style={{ fontSize: '11px', color: theme.textMuted }}>
                    Last Spike: {lastSpikeTriggered}
                  </span>
                )}
                <button
                  type="button"
                  onClick={handleSimulateSpike}
                  disabled={isSpiking}
                  style={{
                    padding: '10px 18px',
                    borderRadius: '12px',
                    border: 'none',
                    background: isSpiking ? '#64748b' : 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)',
                    color: '#ffffff',
                    fontSize: '13px',
                    fontWeight: '800',
                    cursor: isSpiking ? 'wait' : 'pointer',
                    boxShadow: '0 8px 20px -5px rgba(239, 68, 68, 0.5)',
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    transition: 'transform 0.2s'
                  }}
                  onMouseEnter={(e) => { if (!isSpiking) e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={(e) => { if (!isSpiking) e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <span>{isSpiking ? '⏳' : '⚡'}</span>
                  <span>{isSpiking ? t('spikingStatus') : t('simulateSpikeBtn')}</span>
                </button>
              </div>
            </div>

            {/* 4 Multi-Sensor Telemetry Gauges */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px' }}>

              {/* Sensor 1: Methane (CH4) */}
              <div style={{
                padding: '18px',
                borderRadius: '16px',
                backgroundColor: theme.isDark ? 'rgba(18, 21, 33, 0.85)' : '#ffffff',
                border: `1px solid ${iotSensors.methane > 1.25 ? '#ef4444' : theme.cardBorder}`,
                boxShadow: iotSensors.methane > 1.25 ? '0 0 15px rgba(239, 68, 68, 0.2)' : 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: theme.textSecondary }}>🔥 Methane (CH4)</span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: iotSensors.methane > 1.25 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                    color: iotSensors.methane > 1.25 ? '#ef4444' : '#10b981'
                  }}>
                    {iotSensors.methane > 1.25 ? 'CRITICAL EVAC' : 'Optimal'}
                  </span>
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: iotSensors.methane > 1.25 ? '#ef4444' : theme.textPrimary, letterSpacing: '-0.5px' }}>
                  {iotSensors.methane}%
                </div>
                {/* Mini Gauge Bar */}
                <div style={{ width: '100%', height: '6px', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', borderRadius: '3px', margin: '10px 0 8px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, (iotSensors.methane / 2.0) * 100)}%`,
                    height: '100%',
                    backgroundColor: iotSensors.methane > 1.25 ? '#ef4444' : iotSensors.methane > 0.8 ? '#f59e0b' : '#10b981',
                    transition: 'width 0.4s ease'
                  }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: theme.textMuted }}>
                  <span>DGMS Limit: 1.25%</span>
                  <span>Shaft B - Seam 4</span>
                </div>
              </div>

              {/* Sensor 2: Carbon Monoxide (CO) */}
              <div style={{
                padding: '18px',
                borderRadius: '16px',
                backgroundColor: theme.isDark ? 'rgba(18, 21, 33, 0.85)' : '#ffffff',
                border: `1px solid ${iotSensors.co > 50 ? '#ef4444' : theme.cardBorder}`,
                boxShadow: iotSensors.co > 50 ? '0 0 15px rgba(239, 68, 68, 0.2)' : 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: theme.textSecondary }}>☠️ Carbon Monoxide (CO)</span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: iotSensors.co > 50 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                    color: iotSensors.co > 50 ? '#ef4444' : '#10b981'
                  }}>
                    {iotSensors.co > 50 ? 'TOXIC SPIKE' : 'Safe'}
                  </span>
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: iotSensors.co > 50 ? '#ef4444' : theme.textPrimary, letterSpacing: '-0.5px' }}>
                  {iotSensors.co} <span style={{ fontSize: '14px', fontWeight: '600' }}>PPM</span>
                </div>
                {/* Mini Gauge Bar */}
                <div style={{ width: '100%', height: '6px', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', borderRadius: '3px', margin: '10px 0 8px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, (iotSensors.co / 100) * 100)}%`,
                    height: '100%',
                    backgroundColor: iotSensors.co > 50 ? '#ef4444' : '#10b981',
                    transition: 'width 0.4s ease'
                  }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: theme.textMuted }}>
                  <span>Threshold: 50 PPM</span>
                  <span>Haulage Roadway</span>
                </div>
              </div>

              {/* Sensor 3: Intake Airflow */}
              <div style={{
                padding: '18px',
                borderRadius: '16px',
                backgroundColor: theme.isDark ? 'rgba(18, 21, 33, 0.85)' : '#ffffff',
                border: `1px solid ${iotSensors.airflow < 2.5 ? '#ef4444' : theme.cardBorder}`,
                boxShadow: iotSensors.airflow < 2.5 ? '0 0 15px rgba(239, 68, 68, 0.2)' : 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: theme.textSecondary }}>💨 Intake Airflow</span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: iotSensors.airflow < 2.5 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                    color: iotSensors.airflow < 2.5 ? '#ef4444' : '#10b981'
                  }}>
                    {iotSensors.airflow < 2.5 ? 'LOW FLOW' : 'Optimal'}
                  </span>
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: iotSensors.airflow < 2.5 ? '#ef4444' : theme.textPrimary, letterSpacing: '-0.5px' }}>
                  {iotSensors.airflow} <span style={{ fontSize: '14px', fontWeight: '600' }}>m/s</span>
                </div>
                {/* Mini Gauge Bar */}
                <div style={{ width: '100%', height: '6px', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', borderRadius: '3px', margin: '10px 0 8px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, (iotSensors.airflow / 6.0) * 100)}%`,
                    height: '100%',
                    backgroundColor: iotSensors.airflow < 2.5 ? '#ef4444' : '#10b981',
                    transition: 'width 0.4s ease'
                  }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: theme.textMuted }}>
                  <span>Min Limit: 2.5 m/s</span>
                  <span>Aux Fan #2</span>
                </div>
              </div>

              {/* Sensor 4: Strata Stress */}
              <div style={{
                padding: '18px',
                borderRadius: '16px',
                backgroundColor: theme.isDark ? 'rgba(18, 21, 33, 0.85)' : '#ffffff',
                border: `1px solid ${iotSensors.strata > 20.0 ? '#ef4444' : theme.cardBorder}`,
                boxShadow: iotSensors.strata > 20.0 ? '0 0 15px rgba(239, 68, 68, 0.2)' : 'none'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontSize: '12px', fontWeight: '700', color: theme.textSecondary }}>🪨 Strata Stress</span>
                  <span style={{
                    fontSize: '10px',
                    fontWeight: '800',
                    padding: '2px 8px',
                    borderRadius: '6px',
                    backgroundColor: iotSensors.strata > 20.0 ? 'rgba(239, 68, 68, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                    color: iotSensors.strata > 20.0 ? '#ef4444' : '#10b981'
                  }}>
                    {iotSensors.strata > 20.0 ? 'SURGE RISK' : 'Normal'}
                  </span>
                </div>
                <div style={{ fontSize: '26px', fontWeight: '900', color: iotSensors.strata > 20.0 ? '#ef4444' : theme.textPrimary, letterSpacing: '-0.5px' }}>
                  {iotSensors.strata} <span style={{ fontSize: '14px', fontWeight: '600' }}>MPa</span>
                </div>
                {/* Mini Gauge Bar */}
                <div style={{ width: '100%', height: '6px', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0', borderRadius: '3px', margin: '10px 0 8px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${Math.min(100, (iotSensors.strata / 35.0) * 100)}%`,
                    height: '100%',
                    backgroundColor: iotSensors.strata > 20.0 ? '#ef4444' : '#10b981',
                    transition: 'width 0.4s ease'
                  }}></div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '10px', color: theme.textMuted }}>
                  <span>Safe Max: 20 MPa</span>
                  <span>Longwall Face</span>
                </div>
              </div>

            </div>
          </div>

          {/* Charts Section */}
          <div id="section-analytics" className="mobile-col" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '24px', marginBottom: '36px' }}>

            <div style={{ backgroundColor: theme.cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', padding: '24px', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: theme.textPrimary }}>🍩 {t('categoryAiDistribution')}</h3>
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
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: theme.textPrimary }}>📊 {t('priorityBreakdown')}</h3>
              {priorityData.length > 0 ? (
                <ResponsiveContainer width="100%" height={230}>
                  <BarChart data={priorityData}>
                    <XAxis dataKey="name" stroke={theme.textMuted} />
                    <YAxis allowDecimals={false} stroke={theme.textMuted} />
                    <Tooltip contentStyle={{ backgroundColor: theme.isDark ? '#1e293b' : '#ffffff', border: `1px solid ${theme.cardBorder}`, borderRadius: '8px', color: theme.textPrimary }} />
                    <Bar dataKey="count" fill="#f59e0b" radius={[8, 8, 0, 0]}>
                      {priorityData.map((entry, index) => (
                        <Cell key={`bar-${index}`} fill={PRIORITY_BADGES[entry.name]?.dot || '#f59e0b'} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: theme.textMuted, textAlign: 'center', marginTop: '70px' }}>No Data</p>
              )}
            </div>

            <div style={{ backgroundColor: theme.cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', padding: '24px', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
              <h3 style={{ margin: '0 0 20px', fontSize: '16px', fontWeight: '700', color: theme.textPrimary }}>📈 {t('sevenDayVelocity')}</h3>
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height={230}>
                  <LineChart data={trendData}>
                    <XAxis dataKey="date" stroke={theme.textMuted} />
                    <YAxis allowDecimals={false} stroke={theme.textMuted} />
                    <Tooltip contentStyle={{ backgroundColor: theme.isDark ? '#1e293b' : '#ffffff', border: `1px solid ${theme.cardBorder}`, borderRadius: '8px', color: theme.textPrimary }} />
                    <Line type="monotone" dataKey="complaints" stroke="#f59e0b" strokeWidth={3} dot={{ r: 6, fill: '#fbbf24' }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <p style={{ color: theme.textMuted, textAlign: 'center', marginTop: '70px' }}>No Data</p>
              )}
            </div>
          </div>

          {/* AI Predictive Workload & Surge Forecast Card */}
          {(() => {
            const pred = analytics?.predictions || {
              riskLevel: 'Moderate',
              projectedSurgePercentage: 24,
              primarySurgeDepartment: 'Safety (DGMS)',
              forecastSummary: 'Expected moderate hazard volume across Safety & Ventilation with stable HEMM mechanical operations.',
              actionableRecommendation: 'Maintain standard DGMS inspection rounds and monitor peak shift gas readings.',
              departmentForecasts: [
                { department: 'Safety (DGMS)', risk: 'High', projectedVolume: '+32%', insight: 'Methane and strata control monitoring' },
                { department: 'Equipment (HEMM)', risk: 'Moderate', projectedVolume: '+14%', insight: 'Heavy machinery hydraulic inspections' },
                { department: 'Environment', risk: 'Low', projectedVolume: 'Stable', insight: 'Dust suppression & water discharge normal' },
                { department: 'Labour', risk: 'Low', projectedVolume: 'Stable', insight: 'PPE and shift muster compliance steady' }
              ]
            };
            return (
              <>
                {/* Section: Attendance Logs */}
                <div id="section-attendance" style={{
                  backgroundColor: theme.cardBg,
                  borderRadius: '24px',
                  padding: '28px 32px',
                  marginBottom: '36px',
                  border: `1px solid ${theme.cardBorder}`,
                  boxShadow: theme.isDark ? 'none' : '0 10px 25px -5px rgba(0,0,0,0.05)'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '24px' }}>
                    <h2 style={{ fontSize: '20px', fontWeight: '800', margin: 0, display: 'flex', alignItems: 'center', gap: '8px', color: theme.textPrimary }}>
                      <span style={{ color: '#8b5cf6' }}>🕒</span> Geo-Fenced Attendance Logs
                    </h2>
                  </div>

                  <div style={{ overflowX: 'auto', borderRadius: '12px', border: `1px solid ${theme.cardBorder}` }}>
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', minWidth: '800px' }}>
                      <thead style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc', borderBottom: `1px solid ${theme.cardBorder}` }}>
                        <tr>
                          <th style={{ padding: '16px', fontWeight: '700', fontSize: '13px', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Worker / Inspector</th>
                          <th style={{ padding: '16px', fontWeight: '700', fontSize: '13px', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Mine Site</th>
                          <th style={{ padding: '16px', fontWeight: '700', fontSize: '13px', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Action & Time</th>
                          <th style={{ padding: '16px', fontWeight: '700', fontSize: '13px', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Distance from Site</th>
                          <th style={{ padding: '16px', fontWeight: '700', fontSize: '13px', color: theme.textSecondary, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {attendanceLogs.length === 0 ? (
                          <tr><td colSpan="5" style={{ padding: '24px', textAlign: 'center', color: theme.textMuted }}>No attendance records found.</td></tr>
                        ) : (
                          attendanceLogs.map((log) => (
                            <tr key={log._id} style={{ borderBottom: `1px solid ${theme.cardBorder}`, transition: 'background-color 0.2s' }} onMouseEnter={(e) => e.currentTarget.style.backgroundColor = theme.isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc'} onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}>
                              <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600', color: theme.textPrimary }}>
                                <div>{log.workerId?.name || 'Unknown Worker'}</div>
                                <div style={{ fontSize: '12px', color: theme.textMuted, fontWeight: '500' }}>{log.workerId?.phone}</div>
                              </td>
                              <td style={{ padding: '16px', fontSize: '14px', color: theme.textSecondary }}>{log.mineSiteId?.name || 'Unknown Site'}</td>
                              <td style={{ padding: '16px', fontSize: '14px', fontWeight: '600' }}>
                                <span style={{ color: log.action === 'PUNCH_IN' ? '#10b981' : '#ef4444' }}>
                                  {log.action === 'PUNCH_IN' ? 'IN' : 'OUT'}
                                </span>
                                <div style={{ fontSize: '12px', color: theme.textMuted, fontWeight: '500' }}>
                                  {new Date(log.timestamp).toLocaleString()}
                                </div>
                              </td>
                              <td style={{ padding: '16px', fontSize: '14px', color: theme.textSecondary }}>
                                {(log.distanceFromSite / 1000).toFixed(2)} km
                              </td>
                              <td style={{ padding: '16px' }}>
                                <span style={{
                                  padding: '4px 10px',
                                  borderRadius: '20px',
                                  fontSize: '12px',
                                  fontWeight: '700',
                                  backgroundColor: log.status === 'Verified' ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.15)',
                                  color: log.status === 'Verified' ? '#22c55e' : '#ef4444',
                                }}>
                                  {log.status === 'Verified' ? 'Verified' : 'Flagged'}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div id="section-ai-forecast" className={theme.isDark ? 'glass-panel' : ''} style={{
                  backgroundColor: theme.cardBg,
                  borderRadius: '24px',
                  padding: '28px 32px',
                  marginBottom: '36px',
                  border: `1px solid ${theme.isDark ? 'rgba(245, 158, 11, 0.35)' : '#fed7aa'}`,
                  background: theme.isDark
                    ? 'linear-gradient(135deg, rgba(15, 17, 26, 0.95) 0%, rgba(245, 158, 11, 0.08) 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
                  boxShadow: '0 20px 40px -15px rgba(245, 158, 11, 0.15)'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px', marginBottom: '18px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <span style={{ fontSize: '24px' }}>🔮</span>
                      <div>
                        <h3 className="gradient-text" style={{ margin: 0, fontSize: '18px', fontWeight: '800' }}>
                          {t('geminiWorkloadPrediction')}
                        </h3>
                        <p style={{ margin: '2px 0 0', fontSize: '13px', color: theme.textSecondary }}>
                          {t('predictiveQueueIntel')}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '800',
                        backgroundColor: pred.riskLevel === 'High' ? 'rgba(239, 68, 68, 0.15)' : 'rgba(245, 158, 11, 0.15)',
                        color: pred.riskLevel === 'High' ? '#ef4444' : '#f59e0b',
                        border: `1px solid ${pred.riskLevel === 'High' ? 'rgba(239, 68, 68, 0.3)' : 'rgba(245, 158, 11, 0.3)'}`
                      }}>
                        ● {t('surgeRisk')}: {pred.riskLevel} ({pred.projectedSurgePercentage || 25}%)
                      </span>
                      <span style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        fontSize: '12px',
                        fontWeight: '700',
                        backgroundColor: 'rgba(245, 158, 11, 0.15)',
                        color: '#fbbf24',
                        border: '1px solid rgba(245, 158, 11, 0.35)'
                      }}>
                        {t('primarySpike')}: {pred.primarySurgeDepartment || 'Safety (DGMS)'}
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
                      📊 <strong>{t('executiveForecast')}:</strong> {pred.forecastSummary}
                    </p>
                    <p style={{ margin: 0, fontSize: '13px', color: '#10b981', fontWeight: '600' }}>
                      💡 <strong>{t('staffingAction')}:</strong> {pred.actionableRecommendation}
                    </p>
                  </div>

                  {/* Department Forecast Pills */}
                  {pred.departmentForecasts && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '14px' }}>
                      {pred.departmentForecasts.map((dept, i) => (
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
              </>
            );
          })()}

          {/* Contractor Statutory Compliance & Safety Scorecard Section */}
          {(() => {
            const CONTRACTORS_LIST = [
              {
                id: 'bgr',
                name: 'BGR Mining & Infra Ltd',
                tier: 'Tier-A',
                tierBadge: 'Tier-A (DGMS Certified)',
                score: 94,
                color: '#10b981',
                zone: 'Jharia Open-Cast & Pit 1',
                lead: 'Rajesh Kumar (DGMS Lead)',
                attendance: '96.4%',
                violationsCount: 1,
                criticalViolations: 0,
                productionTarget: '104%',
                musterStatus: 'Biometric 100% Synced',
                aiVerdict: '🟢 Exceptional statutory safety adherence. Zero lost-time injuries (LTI) in 180 days. Eligible for concession extension under Mines Act.'
              },
              {
                id: 'thriveni',
                name: 'Thriveni Earthmovers Pvt Ltd',
                tier: 'Tier-B',
                tierBadge: 'Tier-B (Good Standing)',
                score: 86,
                color: '#f59e0b',
                zone: 'Bokaro Colliery - Pit B',
                lead: 'Dr. Ananya Sen',
                attendance: '91.2%',
                violationsCount: 3,
                criticalViolations: 0,
                productionTarget: '98%',
                musterStatus: 'Standard Muster (98%)',
                aiVerdict: '🟡 Good general compliance. 2 minor haul-road dust suppression lapses detected. HEMM fleet hydraulic audit scheduled.'
              },
              {
                id: 'gainwell',
                name: 'Gainwell Engineering (HEMM)',
                tier: 'Tier-B',
                tierBadge: 'Tier-B (Good Standing)',
                score: 81,
                color: '#f59e0b',
                zone: 'Korba West - Block A',
                lead: 'Sanjay Sharma',
                attendance: '88.5%',
                violationsCount: 4,
                criticalViolations: 1,
                productionTarget: '93%',
                musterStatus: 'Periodic Verification',
                aiVerdict: '🟡 Satisfactory equipment reliability. Requires refresher safety training on flameproof electrical switchgear under DGMS Reg 153.'
              },
              {
                id: 'vpr',
                name: 'VPR Mining Infra Projects',
                tier: 'Tier-C',
                tierBadge: 'Tier-C (Statutory Warning)',
                score: 64,
                color: '#ef4444',
                zone: 'Jharia Colliery - Pit 4 / Shaft B',
                lead: 'Pooja Verma',
                attendance: '74.1%',
                violationsCount: 11,
                criticalViolations: 4,
                productionTarget: '82%',
                musterStatus: 'Irregular Shift Register',
                aiVerdict: '🔴 CRITICAL STATUTORY NOTICE: Compliance score fell to 64/100 (<70% benchmark). 4 recurrent methane detector lag & haul-road lighting breaches. Immediate DGMS Section 22 inquiry & penalty show-cause notice recommended.'
              }
            ];

            const filteredContractors = CONTRACTORS_LIST.filter(c => {
              if (selectedContractorTier === 'All') return true;
              return c.tier === selectedContractorTier;
            });

            return (
              <div id="section-contractors" className={theme.isDark ? 'glass-panel' : ''} style={{
                backgroundColor: theme.cardBg,
                borderRadius: '24px',
                padding: '28px 32px',
                marginBottom: '36px',
                border: `1px solid ${theme.isDark ? 'rgba(245, 158, 11, 0.35)' : '#fed7aa'}`,
                background: theme.isDark
                  ? 'linear-gradient(135deg, rgba(15, 17, 26, 0.95) 0%, rgba(245, 158, 11, 0.05) 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
                boxShadow: '0 20px 40px -15px rgba(245, 158, 11, 0.12)'
              }}>
                {/* Header & Filter Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
                    }}>
                      👷
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: theme.textPrimary }}>
                        {t('DIGITAL FORM-XIII Statutory Compliance & Scorecard')}
                      </h2>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: theme.textSecondary }}>
                        {t('contractorIntelSubtitle')}
                      </p>
                    </div>
                  </div>

                  {/* Tier Filter Chips */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {['All', 'Tier-A', 'Tier-B', 'Tier-C'].map((tier) => (
                      <button
                        key={tier}
                        type="button"
                        onClick={() => setSelectedContractorTier(tier)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: selectedContractorTier === tier ? '1px solid #f59e0b' : `1px solid ${theme.cardBorder}`,
                          background: selectedContractorTier === tier ? 'linear-gradient(135deg, #f59e0b, #ea580c)' : 'transparent',
                          color: selectedContractorTier === tier ? '#ffffff' : theme.textSecondary,
                          boxShadow: selectedContractorTier === tier ? '0 0 12px rgba(245, 158, 11, 0.35)' : 'none'
                        }}
                      >
                        {tier === 'All' ? 'All Contractors (4)' : tier === 'Tier-A' ? '🟢 Tier-A (>90)' : tier === 'Tier-B' ? '🟡 Tier-B (75-90)' : '🔴 Tier-C (<75 Alert)'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Gemini AI Contractor Review Alert Box */}
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(239, 68, 68, 0.12)',
                  border: '1px solid rgba(239, 68, 68, 0.35)',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '20px' }}>⚠️</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#f87171', marginBottom: '2px' }}>
                      {t('contractorAiRecommendation')}: VPR Mining Infra Projects (Under 70% Benchmark)
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: theme.isDark ? '#fca5a5' : '#b91c1c', lineHeight: 1.5 }}>
                      AI analysis of 11 active field violations shows recurrent methane telemetry lag and haul-road lighting non-compliance in Pit 4. Under <strong>DGMS Circular 2021/04 & Mines Act Sec 22</strong>, immediate contract audit & penalty show-cause notice is recommended before concession renewal.
                    </p>
                  </div>
                </div>

                {/* Contractor Cards Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {filteredContractors.map((c) => (
                    <div
                      key={c.id}
                      onClick={() => setSelectedContractorData(c)}
                      style={{
                        padding: '20px',
                        borderRadius: '18px',
                        backgroundColor: theme.isDark ? 'rgba(18, 21, 33, 0.85)' : '#ffffff',
                        border: `1px solid ${c.score < 70 ? 'rgba(239, 68, 68, 0.4)' : theme.cardBorder}`,
                        transition: 'transform 0.2s, border-color 0.2s',
                        boxShadow: c.score < 70 ? '0 0 20px rgba(239, 68, 68, 0.15)' : 'none',
                        cursor: 'pointer'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {/* Contractor Name & Score */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: theme.textPrimary }}>
                            {c.name}
                          </h3>
                          <span style={{ fontSize: '11px', color: theme.textMuted }}>📍 {c.zone}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '24px', fontWeight: '900', color: c.color, letterSpacing: '-0.5px' }}>
                            {c.score}<span style={{ fontSize: '13px', fontWeight: '600', color: theme.textMuted }}>/100</span>
                          </div>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            backgroundColor: `${c.color}22`,
                            color: c.color
                          }}>
                            {c.tierBadge}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div style={{ width: '100%', height: '6px', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', borderRadius: '3px', marginBottom: '14px', overflow: 'hidden' }}>
                        <div style={{ width: `${c.score}%`, height: '100%', backgroundColor: c.color, transition: 'width 0.4s ease' }}></div>
                      </div>

                      {/* 3 KPI Parameters */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '8px', padding: '10px 0', borderTop: `1px solid ${theme.cardBorder}`, borderBottom: `1px solid ${theme.cardBorder}`, marginBottom: '12px', textAlign: 'center' }}>
                        <div>
                          <div style={{ fontSize: '10px', color: theme.textMuted, fontWeight: '700' }}>ATTENDANCE</div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: theme.textPrimary, marginTop: '2px' }}>{c.attendance}</div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', color: theme.textMuted, fontWeight: '700' }}>VIOLATIONS</div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: c.violationsCount > 5 ? '#ef4444' : theme.textPrimary, marginTop: '2px' }}>
                            {c.violationsCount} {c.criticalViolations > 0 ? `(${c.criticalViolations} Crit)` : ''}
                          </div>
                        </div>
                        <div>
                          <div style={{ fontSize: '10px', color: theme.textMuted, fontWeight: '700' }}>OUTPUT</div>
                          <div style={{ fontSize: '13px', fontWeight: '800', color: theme.textPrimary, marginTop: '2px' }}>{c.productionTarget}</div>
                        </div>
                      </div>

                      {/* AI Verdict */}
                      <p style={{ margin: 0, fontSize: '11px', color: theme.textSecondary, lineHeight: 1.45 }}>
                        {c.aiVerdict}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Heavy Machinery & Fleet Preventive Maintenance Section */}
          {(() => {
            const FLEET_LIST = [
              {
                id: 'D-402',
                name: 'Dumper D-402',
                model: 'CAT 777E (100-Ton Hauler)',
                type: 'HEMM Heavy Hauler',
                zone: 'Jharia Open-Cast Pit 4',
                contractor: 'BGR Mining & Infra Ltd',
                lastServiced: '12 Jul 2026',
                nextDue: '12 Jan 2027',
                dueDays: 142,
                health: 92,
                status: 'Operational',
                statusBadge: '🟢 Operational',
                engineHours: '3,420 hrs',
                aiInsight: 'Hydraulic pressure & brake retarder operating within normal DGMS thermal thresholds. Next routine checkup in 140 hrs.'
              },
              {
                id: 'S-18',
                name: 'Shovel S-18',
                model: 'Komatsu PC2000 Hydraulic',
                type: 'Heavy Excavator',
                zone: 'Bokaro Colliery - Pit B',
                contractor: 'Thriveni Earthmovers',
                lastServiced: '28 Aug 2026',
                nextDue: '28 Feb 2027',
                dueDays: 189,
                health: 88,
                status: 'Operational',
                statusBadge: '🟢 Operational',
                engineHours: '5,190 hrs',
                aiInsight: 'Bucket teeth wear at 32%. AI scheduled ultrasonic non-destructive weld testing in 90 operational days.'
              },
              {
                id: 'CM-05',
                name: 'Continuous Miner CM-05',
                model: 'Joy 12CM12 Underground',
                type: 'Seam Extraction Unit',
                zone: 'Raniganj - Shaft 3 (Deep Seam)',
                contractor: 'Gainwell Engineering',
                lastServiced: '15 Jun 2026',
                nextDue: '15 Dec 2026',
                dueDays: 14,
                health: 76,
                status: 'Warning',
                statusBadge: '🟡 Due in 14 Days (15-Day Alert)',
                engineHours: '2,840 hrs',
                aiInsight: '⚡ 15-Day Advance DGMS Warning: Cutter drum pick wear threshold reached. Automatic service requisition dispatched to Gainwell Engineering.'
              },
              {
                id: 'V-02',
                name: 'Main Ventilation Fan V-02',
                model: 'Howden 500kW Dual-Speed',
                type: 'Shaft Ventilation Fan',
                zone: 'Jharia Pit 4 / Shaft B',
                contractor: 'VPR Mining Infra Projects',
                lastServiced: '04 Feb 2026',
                nextDue: '04 Aug 2026',
                dueDays: -19,
                health: 54,
                status: 'Critical',
                statusBadge: '🔴 OVERDUE BY 19 DAYS',
                engineHours: '8,760 hrs (Continuous)',
                aiInsight: '🚨 DGMS Regulation 153 Non-Compliance: Stator bearing vibration exceeds 4.8 mm/s limit. Urgent overhaul required to prevent methane accumulation.'
              }
            ];

            const filteredFleet = FLEET_LIST.filter(f => {
              if (selectedFleetFilter === 'All') return true;
              return f.status === selectedFleetFilter;
            });

            return (
              <div id="section-fleet" className={theme.isDark ? 'glass-panel' : ''} style={{
                backgroundColor: theme.cardBg,
                borderRadius: '24px',
                padding: '28px 32px',
                marginBottom: '36px',
                border: `1px solid ${theme.isDark ? 'rgba(245, 158, 11, 0.35)' : '#fed7aa'}`,
                background: theme.isDark
                  ? 'linear-gradient(135deg, rgba(15, 17, 26, 0.95) 0%, rgba(245, 158, 11, 0.05) 100%)'
                  : 'linear-gradient(135deg, #ffffff 0%, #fffbeb 100%)',
                boxShadow: '0 20px 40px -15px rgba(245, 158, 11, 0.12)'
              }}>
                {/* Header & Filter Controls */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px', marginBottom: '20px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                    <div style={{
                      width: '42px',
                      height: '42px',
                      borderRadius: '12px',
                      background: 'linear-gradient(135deg, #f59e0b, #ea580c)',
                      color: '#fff',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      boxShadow: '0 0 15px rgba(245, 158, 11, 0.4)'
                    }}>
                      🚜
                    </div>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: theme.textPrimary }}>
                        {t('Machine Reference Number (MRN) & Fleet Preventive Maintenance')}
                      </h2>
                      <p style={{ margin: '2px 0 0', fontSize: '12px', color: theme.textSecondary }}>
                        {t('fleetSectionSubtitle')}
                      </p>
                    </div>
                  </div>

                  {/* Status Filter Chips */}
                  <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                    {[
                      { key: 'All', label: 'All Fleet (4)' },
                      { key: 'Operational', label: '🟢 Operational (2)' },
                      { key: 'Warning', label: '🟡 Due in 14 Days (1)' },
                      { key: 'Critical', label: '🔴 Overdue / Alert (1)' }
                    ].map((filter) => (
                      <button
                        key={filter.key}
                        type="button"
                        onClick={() => setSelectedFleetFilter(filter.key)}
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          fontSize: '12px',
                          fontWeight: '700',
                          cursor: 'pointer',
                          transition: 'all 0.2s ease',
                          border: selectedFleetFilter === filter.key ? '1px solid #f59e0b' : `1px solid ${theme.cardBorder}`,
                          background: selectedFleetFilter === filter.key ? 'linear-gradient(135deg, #f59e0b, #ea580c)' : 'transparent',
                          color: selectedFleetFilter === filter.key ? '#ffffff' : theme.textSecondary,
                          boxShadow: selectedFleetFilter === filter.key ? '0 0 12px rgba(245, 158, 11, 0.35)' : 'none'
                        }}
                      >
                        {filter.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* AI 15-Day Predictive Maintenance Alert */}
                <div style={{
                  padding: '16px 20px',
                  borderRadius: '16px',
                  backgroundColor: 'rgba(245, 158, 11, 0.12)',
                  border: '1px solid rgba(245, 158, 11, 0.35)',
                  marginBottom: '24px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: '12px'
                }}>
                  <span style={{ fontSize: '20px' }}>⚡</span>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '800', color: '#fbbf24', marginBottom: '2px' }}>
                      AI Predictive Overhaul Schedule (Continuous Miner CM-05 & Fan V-02)
                    </div>
                    <p style={{ margin: 0, fontSize: '12px', color: theme.isDark ? '#fde68a' : '#b45309', lineHeight: 1.5 }}>
                      System predicted a 15-day service window for <strong>CM-05</strong> (underground cutter drum wear) and flagged <strong>Ventilation Fan V-02</strong> as 19 days overdue under DGMS Coal Mines Regulation 153. Automatic vendor alerts dispatched to prevent unscheduled seam shutdowns.
                    </p>
                  </div>
                </div>

                {/* Fleet Machinery Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
                  {filteredFleet.map((m) => (
                    <div
                      key={m.id}
                      style={{
                        padding: '20px',
                        borderRadius: '18px',
                        backgroundColor: theme.isDark ? 'rgba(18, 21, 33, 0.85)' : '#ffffff',
                        border: `1px solid ${m.status === 'Critical' ? 'rgba(239, 68, 68, 0.45)' : m.status === 'Warning' ? 'rgba(245, 158, 11, 0.4)' : theme.cardBorder}`,
                        transition: 'transform 0.2s, border-color 0.2s',
                        boxShadow: m.status === 'Critical' ? '0 0 20px rgba(239, 68, 68, 0.15)' : 'none'
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-2px)'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
                    >
                      {/* Machine Header & Health */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
                        <div>
                          <h3 style={{ margin: 0, fontSize: '15px', fontWeight: '800', color: theme.textPrimary }}>
                            {m.name}
                          </h3>
                          <span style={{ fontSize: '11px', color: theme.textMuted }}>{m.model} • {m.zone}</span>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ fontSize: '22px', fontWeight: '900', color: m.health >= 80 ? '#10b981' : m.health >= 70 ? '#f59e0b' : '#ef4444', letterSpacing: '-0.5px' }}>
                            {m.health}%
                          </div>
                          <span style={{
                            fontSize: '10px',
                            fontWeight: '800',
                            padding: '2px 8px',
                            borderRadius: '6px',
                            backgroundColor: m.status === 'Critical' ? 'rgba(239, 68, 68, 0.2)' : m.status === 'Warning' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(16, 185, 129, 0.15)',
                            color: m.status === 'Critical' ? '#ef4444' : m.status === 'Warning' ? '#f59e0b' : '#10b981'
                          }}>
                            {m.statusBadge}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar for Machine Health */}
                      <div style={{ width: '100%', height: '6px', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : '#e2e8f0', borderRadius: '3px', marginBottom: '14px', overflow: 'hidden' }}>
                        <div style={{
                          width: `${m.health}%`,
                          height: '100%',
                          backgroundColor: m.health >= 80 ? '#10b981' : m.health >= 70 ? '#f59e0b' : '#ef4444',
                          transition: 'width 0.4s ease'
                        }}></div>
                      </div>

                      {/* Schedule Dates & Hours */}
                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', padding: '10px 0', borderTop: `1px solid ${theme.cardBorder}`, borderBottom: `1px solid ${theme.cardBorder}`, marginBottom: '12px', fontSize: '11px' }}>
                        <div>
                          <span style={{ color: theme.textMuted }}>LAST SERVICED:</span>
                          <div style={{ fontWeight: '700', color: theme.textPrimary, marginTop: '2px' }}>{m.lastServiced}</div>
                        </div>
                        <div>
                          <span style={{ color: theme.textMuted }}>AI DUE DATE:</span>
                          <div style={{ fontWeight: '800', color: m.dueDays < 0 ? '#ef4444' : m.dueDays <= 15 ? '#f59e0b' : '#10b981', marginTop: '2px' }}>
                            {m.nextDue}
                          </div>
                        </div>
                      </div>

                      {/* AI Diagnostic Insight */}
                      <p style={{ margin: 0, fontSize: '11px', color: theme.textSecondary, lineHeight: 1.45 }}>
                        {m.aiInsight}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            );
          })()}

          {/* Search & Filter (Active Queue Section) */}
          <div id="section-queue" style={{ backgroundColor: theme.cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${theme.cardBorder}`, padding: '20px 24px', borderRadius: '20px', marginBottom: '28px', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '20px', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ flex: '1 1 340px' }}>
                <input type="text" placeholder={`🔍 ${t('searchPlaceholder')}`}
                  value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  style={{ width: '100%', padding: '14px 20px', borderRadius: '12px', backgroundColor: theme.inputBg, border: `1px solid ${theme.cardBorder}`, color: theme.textPrimary, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
                />
              </div>
              <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                <span style={{ fontSize: '13px', fontWeight: '600', color: theme.textSecondary }}>{t('categoryFilter')}:</span>
                {CATEGORIES.map((cat) => (
                  <button key={cat} onClick={() => setSelectedCategory(cat)}
                    style={{ padding: '8px 16px', borderRadius: '24px', border: '1px solid', borderColor: selectedCategory === cat ? '#f59e0b' : theme.cardBorder, color: selectedCategory === cat ? '#ffffff' : theme.textSecondary, fontSize: '13px', fontWeight: '700', cursor: 'pointer', transition: 'all 0.2s', background: selectedCategory === cat ? 'linear-gradient(135deg, #f59e0b, #ea580c)' : 'transparent', boxShadow: selectedCategory === cat ? '0 0 15px rgba(245, 158, 11, 0.35)' : 'none' }}
                  >
                    {cat === 'All' ? t('all') : cat}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Complaints Table */}
          <div style={{ backgroundColor: theme.cardBg, backdropFilter: 'blur(12px)', border: `1px solid ${theme.cardBorder}`, borderRadius: '20px', overflow: 'hidden', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}>
            <div style={{ padding: '20px 24px', borderBottom: `1px solid ${theme.tableRowBorder}` }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: theme.textPrimary }}>📋 {t('activeIssuesQueue')} ({filteredComplaints.length})</h2>
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
              <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch', width: '100%' }}>
                <table style={{ width: '100%', minWidth: '800px', borderCollapse: 'collapse', textAlign: 'left' }}>
                  <thead>
                    <tr style={{ backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.4)' : '#f1f5f9', borderBottom: `1px solid ${theme.cardBorder}` }}>
                      <th style={{ padding: '16px 24px', color: theme.textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>{t('tableIssueDetails')}</th>
                      <th style={{ padding: '16px 20px', color: theme.textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>{t('tableAiCategory')}</th>
                      <th style={{ padding: '16px 20px', color: theme.textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>{t('tableAssignedLead')}</th>
                      <th style={{ padding: '16px 20px', color: theme.textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>{t('tablePriority')}</th>
                      <th style={{ padding: '16px 20px', color: theme.textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>{t('tableConfidence')}</th>
                      <th style={{ padding: '16px 24px', color: theme.textSecondary, fontSize: '12px', fontWeight: '700', textTransform: 'uppercase' }}>{t('tableLifecycleAction')}</th>
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
                            <div style={{ color: theme.textPrimary, fontSize: '15px', fontWeight: '600', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                              <span>{c.title}</span>
                              {c.mineSite && (
                                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', fontWeight: '700', border: '1px solid rgba(245, 158, 11, 0.3)' }}>
                                  🏭 {c.mineSite}
                                </span>
                              )}
                              {c.comments && c.comments.length > 0 && (
                                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                                  💬 {c.comments.length}
                                </span>
                              )}
                              {c.attachments && c.attachments.length > 0 && (
                                <span style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                                  📎 {c.attachments.length}
                                </span>
                              )}
                              {c.location && (c.location.address || c.location.city || c.location.latitude) && (
                                <span
                                  title={c.location.address || `${c.location.latitude}, ${c.location.longitude}`}
                                  style={{ fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(14, 165, 233, 0.15)', color: '#38bdf8' }}
                                >
                                  📍 {c.location.city || 'Pit Location'}
                                </span>
                              )}
                            </div>
                            <div style={{ fontSize: '13px', color: theme.textSecondary, marginTop: '4px' }}>{c.description}</div>
                            {c.location?.address && (
                              <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '3px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                                <span>📍</span>
                                <span>{c.location.address.length > 45 ? `${c.location.address.slice(0, 45)}...` : c.location.address}</span>
                              </div>
                            )}
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
                              <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Safety">🦺 Safety (DGMS)</option>
                              <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Environment">🌿 Environment</option>
                              <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Equipment">⚙️ Equipment (HEMM)</option>
                              <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Labour">👷 Labour & PPE</option>
                              <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Production">⛏️ Production</option>
                              <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="General">📜 General</option>
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
                              <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Rajesh Kumar (DGMS Lead)">👤 Rajesh Kumar (DGMS)</option>
                              <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Dr. Ananya Sen">👤 Dr. Ananya Sen (Env)</option>
                              <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Sanjay Sharma">👤 Sanjay Sharma (HEMM)</option>
                              <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Pooja Verma">👤 Pooja Verma (Labour)</option>
                              <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Virendra Singh">👤 Virendra Singh (Prod)</option>
                              <option style={{ backgroundColor: '#0f172a', color: '#ffffff' }} value="Central Control Room">👤 Central Control Room</option>
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

          {/* Contractor Detail Modal */}
          {selectedContractorData && (
            <div style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
              zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px'
            }} onClick={() => setSelectedContractorData(null)}>
              <div style={{
                backgroundColor: theme.isDark ? '#0f172a' : '#ffffff',
                borderRadius: '24px', width: '100%', maxWidth: '800px',
                border: `1px solid ${selectedContractorData.color}`,
                boxShadow: `0 20px 40px -10px ${selectedContractorData.color}40`,
                overflow: 'hidden', display: 'flex', flexDirection: 'column',
                maxHeight: '90vh'
              }} onClick={e => e.stopPropagation()}>

                {/* Header */}
                <div style={{ padding: '24px', borderBottom: `1px solid ${theme.cardBorder}`, background: `linear-gradient(to right, ${selectedContractorData.color}15, transparent)` }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h2 style={{ margin: 0, fontSize: '24px', fontWeight: '800', color: theme.textPrimary }}>{selectedContractorData.name}</h2>
                      <p style={{ margin: '4px 0 0', color: theme.textSecondary }}>📍 {selectedContractorData.zone} | Lead: {selectedContractorData.lead}</p>
                    </div>
                    <button onClick={() => setSelectedContractorData(null)} style={{ background: 'transparent', border: 'none', color: theme.textSecondary, fontSize: '24px', cursor: 'pointer' }}>×</button>
                  </div>

                  {/* Tabs */}
                  <div style={{ display: 'flex', gap: '20px', marginTop: '24px' }}>
                    <button onClick={() => setContractorModalTab('attendance')} style={{ padding: '8px 16px', border: 'none', background: 'transparent', color: contractorModalTab === 'attendance' ? selectedContractorData.color : theme.textSecondary, borderBottom: contractorModalTab === 'attendance' ? `2px solid ${selectedContractorData.color}` : '2px solid transparent', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' }}>Form-D Register (Attendance)</button>
                    <button onClick={() => setContractorModalTab('violations')} style={{ padding: '8px 16px', border: 'none', background: 'transparent', color: contractorModalTab === 'violations' ? selectedContractorData.color : theme.textSecondary, borderBottom: contractorModalTab === 'violations' ? `2px solid ${selectedContractorData.color}` : '2px solid transparent', fontWeight: '700', fontSize: '15px', cursor: 'pointer', transition: 'all 0.2s' }}>Safety Violations ({selectedContractorData.violationsCount})</button>
                  </div>
                </div>

                {/* Content */}
                <div style={{ padding: '24px', overflowY: 'auto', flex: 1 }}>
                  {contractorModalTab === 'attendance' ? (
                    <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                      <thead>
                        <tr style={{ color: theme.textMuted, fontSize: '12px', borderBottom: `1px solid ${theme.cardBorder}` }}>
                          <th style={{ padding: '12px 8px' }}>WORKER ID</th>
                          <th style={{ padding: '12px 8px' }}>NAME</th>
                          <th style={{ padding: '12px 8px' }}>SHIFT</th>
                          <th style={{ padding: '12px 8px' }}>STATUS (TODAY)</th>
                          <th style={{ padding: '12px 8px' }}>MONTHLY %</th>
                        </tr>
                      </thead>
                      <tbody style={{ fontSize: '14px', color: theme.textPrimary }}>
                        {[
                          { id: 'W-4091', name: 'Ramesh Singh', shift: 'Morning', status: 'Present', pct: '98%' },
                          { id: 'W-4092', name: 'Vikash Kumar', shift: 'Morning', status: 'Absent', pct: '82%' },
                          { id: 'W-4095', name: 'Santosh Yadav', shift: 'Night', status: 'Present', pct: '95%' },
                          { id: 'W-4102', name: 'Deepak Das', shift: 'Night', status: 'Present', pct: '91%' },
                          { id: 'W-4115', name: 'Manoj Munda', shift: 'Morning', status: 'Present', pct: '89%' },
                          { id: 'W-4120', name: 'Arjun Reddy', shift: 'Night', status: 'Absent', pct: '74%' },
                        ].map((w, i) => (
                          <tr key={i} style={{ borderBottom: `1px solid ${theme.cardBorder}` }}>
                            <td style={{ padding: '16px 8px', fontWeight: '600' }}>{w.id}</td>
                            <td style={{ padding: '16px 8px' }}>{w.name}</td>
                            <td style={{ padding: '16px 8px' }}>{w.shift}</td>
                            <td style={{ padding: '16px 8px' }}>
                              <span style={{ padding: '4px 8px', borderRadius: '4px', fontSize: '12px', fontWeight: '700', backgroundColor: w.status === 'Present' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', color: w.status === 'Present' ? '#10b981' : '#ef4444' }}>
                                {w.status}
                              </span>
                            </td>
                            <td style={{ padding: '16px 8px', fontWeight: '700' }}>{w.pct}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  ) : (
                    <div>
                      {Array.from({ length: Math.max(1, selectedContractorData.violationsCount) }).slice(0, 4).map((_, i) => (
                        <div key={i} style={{ padding: '16px', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, marginBottom: '12px', backgroundColor: theme.isDark ? 'rgba(255,255,255,0.02)' : '#f8fafc' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                            <span style={{ fontWeight: '800', color: theme.textPrimary }}>
                              {i % 2 === 0 ? 'Haul Road Dust Suppression Failure' : 'Methane Sensor Bypass Warning'}
                            </span>
                            <span style={{ fontSize: '12px', color: theme.textMuted }}>Today, {10 - i}:30 AM</span>
                          </div>
                          <p style={{ margin: 0, fontSize: '13px', color: theme.textSecondary }}>
                            {i % 2 === 0
                              ? `AI detected PM10 levels exceeding 100µg/m³ near ${selectedContractorData.zone}. Water sprinkler truck W-12 was inactive during shift.`
                              : `Continuous miner telemetry disconnected for >15 minutes. Investigating potential intentional bypass.`}
                          </p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;