import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../utils/api';
import AnimatedCounter from '../components/AnimatedCounter';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const ContractorDashboard = () => {
  const navigate = useNavigate();
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [issues, setIssues] = useState([]);
  
  // Mock Contractor Data
  const contractor = {
    name: 'BGR Mining & Infra',
    id: 'CTR-7724',
    complianceScore: 92,
    attendance: 145,
    totalWorkers: 150,
    zone: 'Jharia Colliery - Pit 4'
  };

  useEffect(() => {
    // In a real app, fetch issues assigned to this contractor
    // For hackathon, we fetch all and mock it
    api.get('/complaints/all').then((res) => {
      // Mock filter for contractor's issues
      setIssues(res.data.complaints.slice(0, 3)); 
    }).catch(err => console.error(err));
  }, []);

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.bg, color: theme.textPrimary, fontFamily: "'Plus Jakarta Sans', system-ui, sans-serif", padding: '32px 40px', transition: 'all 0.3s ease' }}>
      
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', borderBottom: `1px solid ${theme.cardBorder}`, paddingBottom: '20px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ width: '48px', height: '48px', borderRadius: '14px', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', boxShadow: '0 0 20px rgba(245, 158, 11, 0.4)' }}>
            👷
          </div>
          <div>
            <h1 style={{ margin: 0, fontSize: '24px', fontWeight: '900', letterSpacing: '-0.5px' }}>Contractor Intelligence Hub</h1>
            <p style={{ margin: '4px 0 0', color: theme.textSecondary, fontSize: '13px', fontWeight: '600' }}>
              Welcome back, <span style={{ color: '#fbbf24' }}>{contractor.name}</span> ({contractor.id})
            </p>
          </div>
        </div>
      </div>

      {/* KPI Cards (Glassmorphism) */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '24px', marginBottom: '40px' }}>
        
        {/* Compliance Score */}
        <div className="glass-panel" style={{ backgroundColor: theme.cardBg, borderRadius: '20px', padding: '24px', border: `1px solid ${theme.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 30px -10px rgba(16, 185, 129, 0.2)' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>Statutory Compliance Score</span>
            <div style={{ fontSize: '42px', fontWeight: '900', color: '#10b981', marginTop: '4px' }}>
              <AnimatedCounter target={contractor.complianceScore} />%
            </div>
            <div style={{ fontSize: '12px', color: '#10b981', fontWeight: '600', marginTop: '4px' }}>▲ 2.4% from last month (DGMS Grade A)</div>
          </div>
          <div style={{ fontSize: '48px', opacity: 0.8 }}>🏆</div>
        </div>

        {/* Worker Attendance */}
        <div className="glass-panel" style={{ backgroundColor: theme.cardBg, borderRadius: '20px', padding: '24px', border: `1px solid ${theme.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 30px -10px rgba(56, 189, 248, 0.2)' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>Shift Attendance (Live)</span>
            <div style={{ fontSize: '42px', fontWeight: '900', color: '#38bdf8', marginTop: '4px' }}>
              <AnimatedCounter target={contractor.attendance} /> <span style={{ fontSize: '20px', color: theme.textSecondary }}>/ {contractor.totalWorkers}</span>
            </div>
            <div style={{ fontSize: '12px', color: theme.textMuted, fontWeight: '600', marginTop: '4px' }}>Active in {contractor.zone}</div>
          </div>
          <div style={{ fontSize: '48px', opacity: 0.8 }}>👷‍♂️</div>
        </div>

        {/* Pending Hazards */}
        <div className="glass-panel" style={{ backgroundColor: theme.cardBg, borderRadius: '20px', padding: '24px', border: `1px solid ${theme.cardBorder}`, display: 'flex', alignItems: 'center', justifyContent: 'space-between', boxShadow: '0 10px 30px -10px rgba(245, 158, 11, 0.2)' }}>
          <div>
            <span style={{ fontSize: '12px', fontWeight: '800', color: theme.textMuted, textTransform: 'uppercase', letterSpacing: '1px' }}>Actionable AI Hazards</span>
            <div style={{ fontSize: '42px', fontWeight: '900', color: '#f59e0b', marginTop: '4px' }}>
              <AnimatedCounter target={issues.length} />
            </div>
            <div style={{ fontSize: '12px', color: '#f59e0b', fontWeight: '600', marginTop: '4px' }}>Requires immediate remediation</div>
          </div>
          <div style={{ fontSize: '48px', opacity: 0.8 }}>⚠️</div>
        </div>
      </div>

      {/* Assigned Hazards Queue */}
      <div>
        <h2 style={{ fontSize: '18px', fontWeight: '800', marginBottom: '20px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ color: '#f59e0b' }}>●</span> My Active Safety Violations
        </h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {issues.map(issue => (
            <div key={issue._id} className="glass-panel" style={{ backgroundColor: theme.cardBg, borderRadius: '16px', padding: '20px', border: `1px solid ${theme.cardBorder}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', backgroundColor: 'rgba(245,158,11,0.15)', color: '#f59e0b' }}>
                    {issue.category}
                  </span>
                  <span style={{ padding: '4px 10px', borderRadius: '8px', fontSize: '11px', fontWeight: '800', backgroundColor: 'rgba(239,68,68,0.15)', color: '#ef4444' }}>
                    {issue.priority}
                  </span>
                  <span style={{ fontSize: '12px', color: theme.textMuted }}>{new Date(issue.createdAt).toLocaleString()}</span>
                </div>
                <h3 style={{ margin: '0 0 6px', fontSize: '16px', fontWeight: '700' }}>{issue.title}</h3>
                <p style={{ margin: 0, fontSize: '13px', color: theme.textSecondary, maxWidth: '800px' }}>{issue.description}</p>
              </div>
              <button style={{ padding: '10px 16px', borderRadius: '10px', backgroundColor: '#f59e0b', color: '#fff', border: 'none', fontWeight: '700', cursor: 'pointer', boxShadow: '0 4px 15px rgba(245, 158, 11, 0.4)' }}>
                Resolve Issue
              </button>
            </div>
          ))}
          {issues.length === 0 && (
            <div style={{ padding: '40px', textAlign: 'center', color: theme.textMuted, backgroundColor: theme.cardBg, borderRadius: '16px', border: `1px dashed ${theme.cardBorder}` }}>
              No active hazards assigned to your agency. Safe operations! 🟢
            </div>
          )}
        </div>
      </div>

    </div>
  );
};

export default ContractorDashboard;
