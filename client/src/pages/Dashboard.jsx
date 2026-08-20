import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ToastContainer, useToast } from '../components/Toast';
import ThemeToggle from '../components/ThemeToggle';
import LanguageToggle from '../components/LanguageToggle';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import IssueDetailModal from '../components/IssueDetailModal';
import NotificationBell from '../components/NotificationBell';

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [duplicates, setDuplicates] = useState([]);
  const [dismissDuplicateWarning, setDismissDuplicateWarning] = useState(false);
  const { toasts, addToast, removeToast } = useToast();
  const { t } = useLanguage();

  let user = {};
  try {
    const raw = localStorage.getItem('user');
    if (raw && raw !== 'undefined') user = JSON.parse(raw);
  } catch (e) {
    user = {};
  }

  const fetchMyComplaints = async () => {
    try {
      const res = await api.get('/complaints/my');
      setComplaints(res.data.complaints || []);
    } catch (err) {
      console.error(err);
    } finally {
      setFetching(false);
    }
  };

  useEffect(() => {
    fetchMyComplaints();
  }, []);

  // Debounced AI Duplicate Detection
  useEffect(() => {
    if (!title || title.trim().length < 5 || dismissDuplicateWarning) {
      setDuplicates([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        const res = await api.post('/complaints/check-duplicate', { title });
        if (res.data?.hasDuplicates) {
          setDuplicates(res.data.duplicates);
        } else {
          setDuplicates([]);
        }
      } catch (err) {
        console.error('Duplicate check error:', err);
      }
    }, 600);

    return () => clearTimeout(timer);
  }, [title, dismissDuplicateWarning]);

  const handleFileChange = (e) => {
    if (e.target.files) {
      setSelectedFiles(Array.from(e.target.files));
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      
      if (selectedFiles.length > 0) {
        selectedFiles.forEach((file) => {
          formData.append('files', file);
        });
      }

      const res = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTitle('');
      setDescription('');
      setSelectedFiles([]);
      addToast(`🤖 "${res.data.complaint?.title || title}" — AI analyzed & submitted!`, 'success', 5000);
      fetchMyComplaints();
    } catch (err) {
      const serverMsg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || err.message || 'Failed to create complaint';
      addToast(`❌ ${serverMsg}`, 'error', 6000);
    } finally {
      setLoading(false);
    }
  };

  const { theme } = useTheme();

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.bg, color: theme.textPrimary, fontFamily: "'Inter', system-ui, sans-serif", padding: '32px 20px', transition: 'all 0.3s ease' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Top Navbar Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: `1px solid ${theme.cardBorder}`, paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '8px 12px', borderRadius: '10px', fontSize: '18px' }}>⚡</div>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800', color: theme.textPrimary }}>{t('appTitle')}</h1>
              <p style={{ margin: '2px 0 0', color: theme.textSecondary, fontSize: '13px' }}>{t('appSubtitle')}</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <LanguageToggle />
            <ThemeToggle />
            <NotificationBell onSelectComplaint={(complaint) => setSelectedComplaint(complaint)} />

            {/* User Avatar */}
            <div title={`${user.name || 'User'} (${user.role || 'Member'})`} style={{ width: '36px', height: '36px', borderRadius: '12px', background: 'linear-gradient(135deg, #0ea5e9, #2563eb)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '15px', fontWeight: '800', color: '#fff', cursor: 'default', boxShadow: '0 0 15px rgba(14, 165, 233, 0.4)' }}>
              {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>

            <button
              title={t('adminView')}
              onClick={() => window.location.href = '/admin'}
              style={{ background: 'linear-gradient(135deg, #0284c7, #2563eb)', border: 'none', color: '#fff', width: '38px', height: '38px', borderRadius: '12px', cursor: 'pointer', fontSize: '18px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 4px 12px rgba(14,165,233,0.35)', transition: 'transform 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.1)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
            >
              👑
            </button>
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

        {/* Raise Issue Form Card */}
        <div className={theme.isDark ? 'glass-panel' : ''} style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '24px', padding: '32px', marginBottom: '40px', boxShadow: theme.isDark ? 'none' : '0 10px 25px -5px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <span style={{ fontSize: '20px' }}>🚀</span>
            <h2 className="gradient-text" style={{ margin: 0, fontSize: '20px', fontWeight: '800' }}>{t('raiseIssueTitle')}</h2>
          </div>
          <p style={{ color: theme.textSecondary, fontSize: '14px', margin: '0 0 24px' }}>{t('raiseIssueSubtitle')}</p>

          <form onSubmit={handleCreate} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '8px' }}>{t('issueTitleLabel')}</label>
              <input
                type="text"
                placeholder={t('issueTitlePlaceholder')}
                value={title}
                onChange={(e) => {
                  setTitle(e.target.value);
                  setDismissDuplicateWarning(false);
                }}
                required
                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', backgroundColor: theme.inputBg, border: `1px solid ${theme.cardBorder}`, color: theme.textPrimary, fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />

              {/* AI Duplicate Detection Warning Banner */}
              {duplicates.length > 0 && !dismissDuplicateWarning && (
                <div style={{
                  marginTop: '12px',
                  padding: '14px 18px',
                  borderRadius: '14px',
                  backgroundColor: theme.isDark ? 'rgba(245, 158, 11, 0.12)' : 'rgba(245, 158, 11, 0.08)',
                  border: '1px solid rgba(245, 158, 11, 0.3)',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      {t('duplicateAlertTitle')}
                    </span>
                    <button
                      type="button"
                      onClick={() => setDismissDuplicateWarning(true)}
                      style={{
                        background: 'none',
                        border: 'none',
                        color: theme.textMuted,
                        fontSize: '11px',
                        fontWeight: '600',
                        cursor: 'pointer',
                        textDecoration: 'underline'
                      }}
                    >
                      {t('dismissContinue')}
                    </button>
                  </div>
                  <p style={{ margin: 0, fontSize: '12px', color: theme.textSecondary, lineHeight: 1.4 }}>
                    {t('duplicateAlertDesc')}
                  </p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                    {duplicates.map((dup) => (
                      <div key={dup._id} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        backgroundColor: theme.isDark ? 'rgba(18, 21, 33, 0.8)' : '#ffffff',
                        padding: '10px 14px',
                        borderRadius: '10px',
                        border: `1px solid ${theme.cardBorder}`
                      }}>
                        <div>
                          <div style={{ fontSize: '13px', fontWeight: '700', color: theme.textPrimary }}>{dup.title}</div>
                          <div style={{ fontSize: '11px', color: theme.textMuted, marginTop: '2px' }}>
                            📁 {dup.category} • ⚡ {dup.priority} • Status: <span style={{ color: '#f59e0b', fontWeight: '600' }}>{dup.status}</span>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => setSelectedComplaint(dup)}
                          style={{
                            backgroundColor: 'transparent',
                            border: 'none',
                            color: '#8b5cf6',
                            fontSize: '12px',
                            fontWeight: '700',
                            cursor: 'pointer'
                          }}
                        >
                          {t('viewMatch')}
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '8px' }}>{t('problemDescriptionLabel')}</label>
              <textarea
                placeholder={t('problemDescriptionPlaceholder')}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={4}
                style={{ width: '100%', padding: '14px 18px', borderRadius: '12px', backgroundColor: theme.inputBg, border: `1px solid ${theme.cardBorder}`, color: theme.textPrimary, fontSize: '14px', outline: 'none', resize: 'vertical', boxSizing: 'border-box' }}
              />
            </div>

            {/* Multi-File Upload Component */}
            <div>
              <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: theme.textSecondary, marginBottom: '8px' }}>
                📎 {t('attachmentsLabel')}
              </label>
              <input
                type="file"
                multiple
                accept="image/*,.pdf,.doc,.docx,.txt"
                onChange={handleFileChange}
                style={{
                  width: '100%',
                  padding: '10px',
                  borderRadius: '12px',
                  backgroundColor: theme.inputBg,
                  border: `1px dashed ${theme.cardBorder}`,
                  color: theme.textSecondary,
                  fontSize: '13px',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{
                width: '100%',
                padding: '14px',
                borderRadius: '14px',
                border: 'none',
                backgroundColor: loading ? '#64748b' : '#8b5cf6',
                color: '#ffffff',
                fontSize: '15px',
                fontWeight: '700',
                cursor: loading ? 'not-allowed' : 'pointer',
                boxShadow: loading ? 'none' : '0 10px 25px -5px rgba(139, 92, 246, 0.4)',
                transition: 'all 0.2s ease'
              }}
            >
              {loading ? t('submittingButton') : t('submitButton')}
            </button>
          </form>
        </div>

        {/* My Submitted Issues Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px' }}>
          <span style={{ fontSize: '20px' }}>📜</span>
          <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '800', color: theme.textPrimary }}>{t('mySubmittedIssues')} ({complaints.length})</h2>
        </div>
        
        {fetching ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ backgroundColor: theme.cardBg, borderRadius: '16px', padding: '24px', animation: 'pulse 1.5s ease-in-out infinite' }}>
                <div style={{ height: '18px', width: '60%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '8px', marginBottom: '12px' }}></div>
                <div style={{ height: '14px', width: '90%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '8px', marginBottom: '8px' }}></div>
              </div>
            ))}
          </div>
        ) : complaints.length === 0 ? (
          <p style={{ color: theme.textMuted }}>No issues filed yet. Submit your first issue above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {complaints.map((c) => (
              <div key={c._id} style={{ backgroundColor: theme.cardBg, border: `1px solid ${theme.cardBorder}`, borderRadius: '16px', padding: '20px', transition: 'border-color 0.2s, transform 0.2s', cursor: 'pointer', boxShadow: theme.isDark ? 'none' : '0 4px 6px -1px rgba(0,0,0,0.05)' }}
                onClick={() => setSelectedComplaint(c)}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.5)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = theme.cardBorder; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: theme.textPrimary, fontWeight: '600' }}>
                    {c.title}
                    {c.comments && c.comments.length > 0 && (
                      <span style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(99, 102, 241, 0.15)', color: '#818cf8' }}>
                        💬 {c.comments.length}
                      </span>
                    )}
                    {c.attachments && c.attachments.length > 0 && (
                      <span style={{ marginLeft: '8px', fontSize: '11px', padding: '2px 8px', borderRadius: '12px', backgroundColor: 'rgba(16, 185, 129, 0.15)', color: '#10b981' }}>
                        📎 {c.attachments.length} files
                      </span>
                    )}
                  </h3>
                  <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', backgroundColor: c.status === 'Resolved' ? '#10b981' : c.status === 'In Progress' ? '#3b82f6' : '#f59e0b', color: '#fff' }}>
                    {c.status}
                  </span>
                </div>
                
                <p style={{ margin: '0 0 14px', color: theme.textSecondary, fontSize: '13px', lineHeight: '1.5' }}>{c.description}</p>
                
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: theme.textSecondary, borderTop: `1px solid ${theme.cardBorder}`, paddingTop: '12px' }}>
                  <span>🏷️ Category: <strong style={{ color: '#818cf8' }}>{c.category}</strong></span>
                  <span>⚡ Priority: <strong style={{ color: c.priority === 'Critical' ? '#f87171' : '#60a5fa' }}>{c.priority}</strong></span>
                  <span>🎯 Confidence: <strong style={{ color: '#34d399' }}>{c.aiConfidence}%</strong></span>
                  <span style={{ marginLeft: 'auto', color: '#818cf8', fontWeight: '600', fontSize: '12px' }}>Click to view details & chat ➔</span>
                </div>
                
                {c.aiSummary && (
                  <div style={{ marginTop: '12px', fontSize: '12px', color: theme.isDark ? '#c084fc' : '#7c3aed', backgroundColor: theme.isDark ? 'rgba(168,85,247,0.1)' : 'rgba(124,58,237,0.08)', border: '1px solid rgba(168,85,247,0.2)', padding: '8px 14px', borderRadius: '10px' }}>
                    ✨ <strong>AI Summary:</strong> {c.aiSummary}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Issue Detail & Chat Modal */}
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

export default Dashboard;