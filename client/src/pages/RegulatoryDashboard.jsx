import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AnimatedCounter from '../components/AnimatedCounter';
import { ToastContainer, useToast } from '../components/Toast';
import { exportToCSV } from '../utils/exportCsv';
import ThemeToggle from '../components/ThemeToggle';
import { useTheme } from '../context/ThemeContext';
import IssueDetailModal from '../components/IssueDetailModal';

const PRIORITY_BADGES = {
  Critical: { bg: '#fef2f2', text: '#b91c1c', border: '#fecaca', dot: '#ef4444' },
  High: { bg: '#fffbeb', text: '#b45309', border: '#fde68a', dot: '#f59e0b' },
  Medium: { bg: '#eff6ff', text: '#1d4ed8', border: '#bfdbfe', dot: '#3b82f6' },
  Low: { bg: '#f0fdf4', text: '#15803d', border: '#bbf7d0', dot: '#10b981' },
};

const RegulatoryDashboard = () => {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [analytics, setAnalytics] = useState(null);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const { theme } = useTheme();
  const { toasts, addToast } = useToast();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

  const fetchData = async () => {
    try {
      const res = await api.get('/complaints/all');
      const data = res.data.complaints;
      setComplaints(data);

      setAnalytics({
        total: data.length,
        resolved: data.filter(c => c.status === 'Resolved' || c.status === 'Closed').length,
        open: data.filter(c => c.status === 'Pending' || c.status === 'In Progress').length,
        critical: data.filter(c => c.priority === 'Critical').length
      });
    } catch (err) {
      console.error(err);
      if (err.response?.status === 401 || err.response?.status === 403) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        navigate('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExport = () => {
    const dataToExport = complaints.map(c => ({
      ID: c._id,
      Title: c.title,
      Category: c.category,
      Status: c.status,
      Priority: c.priority,
      'Mine Site': c.mineSite,
      'Created At': new Date(c.createdAt).toLocaleString(),
      'Statutory Clause': c.statutoryClause || 'N/A'
    }));
    exportToCSV(dataToExport, `${user.authorityType || 'Regulatory'}_Compliance_Report.csv`);
    addToast('Compliance Report exported successfully', 'success');
  };

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    navigate('/');
  };

  const filteredComplaints = complaints.filter(c =>
    (c.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
     c.mineSite.toLowerCase().includes(searchQuery.toLowerCase()) ||
     c.category.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.background, color: theme.textPrimary, fontFamily: "'Inter', sans-serif" }}>
      <ToastContainer toasts={toasts} />
      
      {/* Navbar */}
      <nav style={{ padding: '16px 24px', backgroundColor: theme.cardBg, borderBottom: `1px solid ${theme.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: 'linear-gradient(135deg, #10b981, #059669)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '20px', color: '#fff', boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)' }}>
            ⚖️
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '20px', fontWeight: '700' }}>Regulatory Dashboard</h1>
            <span style={{ fontSize: '13px', color: theme.textSecondary, fontWeight: '600' }}>
              {user.authorityType || 'Government Authority'} Oversight
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <ThemeToggle />
          <button onClick={handleExport} style={{ padding: '8px 16px', borderRadius: '8px', border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textPrimary, cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
            📥 Export Report
          </button>
          <button onClick={handleLogout} style={{ padding: '8px 16px', borderRadius: '8px', border: 'none', background: '#ef4444', color: '#fff', cursor: 'pointer', fontWeight: '600', fontSize: '13px' }}>
            Logout
          </button>
        </div>
      </nav>

      {/* Content */}
      <div style={{ padding: '32px 24px', maxWidth: '1400px', margin: '0 auto' }}>
        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '20px', marginBottom: '32px' }}>
          <div style={{ backgroundColor: theme.cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${theme.cardBorder}` }}>
            <h3 style={{ margin: '0 0 8px', color: theme.textSecondary, fontSize: '14px', fontWeight: '600' }}>Total Violations</h3>
            <div style={{ fontSize: '32px', fontWeight: '800' }}>
              {loading ? '-' : <AnimatedCounter value={analytics?.total} />}
            </div>
          </div>
          <div style={{ backgroundColor: theme.cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${theme.cardBorder}` }}>
            <h3 style={{ margin: '0 0 8px', color: theme.textSecondary, fontSize: '14px', fontWeight: '600' }}>Open & Unresolved</h3>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#f59e0b' }}>
              {loading ? '-' : <AnimatedCounter value={analytics?.open} />}
            </div>
          </div>
          <div style={{ backgroundColor: theme.cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${theme.cardBorder}` }}>
            <h3 style={{ margin: '0 0 8px', color: theme.textSecondary, fontSize: '14px', fontWeight: '600' }}>Resolved Compliances</h3>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#10b981' }}>
              {loading ? '-' : <AnimatedCounter value={analytics?.resolved} />}
            </div>
          </div>
          <div style={{ backgroundColor: theme.cardBg, padding: '24px', borderRadius: '16px', border: `1px solid ${theme.cardBorder}` }}>
            <h3 style={{ margin: '0 0 8px', color: theme.textSecondary, fontSize: '14px', fontWeight: '600' }}>Critical Alerts</h3>
            <div style={{ fontSize: '32px', fontWeight: '800', color: '#ef4444' }}>
              {loading ? '-' : <AnimatedCounter value={analytics?.critical} />}
            </div>
          </div>
        </div>

        {/* Filter */}
        <div style={{ marginBottom: '24px' }}>
          <input
            type="text"
            placeholder="Search by mine site, title, or category..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ width: '100%', maxWidth: '400px', padding: '12px 16px', borderRadius: '12px', border: `1px solid ${theme.cardBorder}`, backgroundColor: theme.cardBg, color: theme.textPrimary, fontSize: '14px', outline: 'none' }}
          />
        </div>

        {/* Table */}
        <div style={{ backgroundColor: theme.cardBg, borderRadius: '16px', border: `1px solid ${theme.cardBorder}`, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ backgroundColor: theme.isDark ? 'rgba(255,255,255,0.03)' : '#f8fafc', borderBottom: `1px solid ${theme.cardBorder}` }}>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: theme.textSecondary }}>Incident Title</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: theme.textSecondary }}>Mine Site</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: theme.textSecondary }}>Priority</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: theme.textSecondary }}>Status</th>
                <th style={{ padding: '16px 20px', textAlign: 'left', fontSize: '13px', fontWeight: '600', color: theme.textSecondary }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>Loading compliant data...</td></tr>
              ) : filteredComplaints.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: '40px', textAlign: 'center', color: theme.textSecondary }}>No data found in your jurisdiction.</td></tr>
              ) : (
                filteredComplaints.map(complaint => (
                  <tr key={complaint._id} style={{ borderBottom: `1px solid ${theme.cardBorder}`, transition: 'background 0.2s' }}>
                    <td style={{ padding: '16px 20px' }}>
                      <div style={{ fontWeight: '600', marginBottom: '4px' }}>{complaint.title}</div>
                      <div style={{ fontSize: '12px', color: theme.textSecondary }}>{complaint.category} • {new Date(complaint.createdAt).toLocaleDateString()}</div>
                    </td>
                    <td style={{ padding: '16px 20px', fontSize: '14px' }}>{complaint.mineSite}</td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '700',
                        backgroundColor: PRIORITY_BADGES[complaint.priority]?.bg || '#f1f5f9',
                        color: PRIORITY_BADGES[complaint.priority]?.text || '#475569',
                        border: `1px solid ${PRIORITY_BADGES[complaint.priority]?.border || '#e2e8f0'}`,
                      }}>
                        {complaint.priority}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <span style={{ 
                        padding: '4px 10px', 
                        borderRadius: '20px', 
                        fontSize: '12px', 
                        fontWeight: '600',
                        backgroundColor: complaint.status === 'Resolved' || complaint.status === 'Closed' ? 'rgba(16, 185, 129, 0.1)' : 'rgba(245, 158, 11, 0.1)',
                        color: complaint.status === 'Resolved' || complaint.status === 'Closed' ? '#10b981' : '#f59e0b',
                      }}>
                        {complaint.status}
                      </span>
                    </td>
                    <td style={{ padding: '16px 20px' }}>
                      <button 
                        onClick={() => setSelectedComplaint(complaint)}
                        style={{ padding: '6px 12px', borderRadius: '6px', border: `1px solid ${theme.cardBorder}`, background: 'transparent', color: theme.textPrimary, cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Modal - Read Only */}
      {selectedComplaint && (
        <IssueDetailModal
          complaint={selectedComplaint}
          onClose={() => setSelectedComplaint(null)}
          isRegulatory={true}
        />
      )}
    </div>
  );
};

export default RegulatoryDashboard;
