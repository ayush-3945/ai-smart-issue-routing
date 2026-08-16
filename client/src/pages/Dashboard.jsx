import React, { useState, useEffect } from 'react';
import api from '../utils/api';
import { ToastContainer, useToast } from '../components/Toast';

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const { toasts, addToast, removeToast } = useToast();

  const user = JSON.parse(localStorage.getItem('user') || '{}');

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

  const handleCreate = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (image) formData.append('image', image);

      const res = await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTitle('');
      setDescription('');
      setImage(null);
      addToast(`🤖 "${res.data.complaint?.title || title}" — AI analyzed & submitted!`, 'success', 5000);
      fetchMyComplaints();
    } catch (err) {
      addToast(err.response?.data?.message || 'Failed to create complaint', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: "'Inter', system-ui, sans-serif", padding: '32px 20px' }}>
      <ToastContainer toasts={toasts} removeToast={removeToast} />
      <div style={{ maxWidth: '900px', margin: '0 auto' }}>
        
        {/* Top Navbar */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '32px', borderBottom: '1px solid rgba(255,255,255,0.08)', paddingBottom: '20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ background: 'linear-gradient(135deg, #6366f1, #a855f7)', padding: '8px 12px', borderRadius: '10px', fontSize: '18px' }}>⚡</div>
            <div>
              <h1 style={{ margin: 0, fontSize: '22px', fontWeight: '800' }}>SmartIssue Portal</h1>
              <p style={{ margin: '2px 0 0', color: '#94a3b8', fontSize: '13px' }}>AI-Powered Automated Categorization & Fast Resolution</p>
            </div>
          </div>
          
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            {/* User Avatar */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 14px', borderRadius: '12px', backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)' }}>
              <div style={{ width: '32px', height: '32px', borderRadius: '10px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '14px', fontWeight: '800', color: '#fff' }}>
                {user.name ? user.name.charAt(0).toUpperCase() : 'U'}
              </div>
              <span style={{ fontSize: '13px', fontWeight: '600', color: '#e2e8f0' }}>{user.name || 'User'}</span>
            </div>

            <button
              onClick={() => window.location.href = '/admin'}
              style={{ backgroundColor: '#6366f1', border: 'none', color: '#fff', padding: '9px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '700', boxShadow: '0 4px 12px rgba(99,102,241,0.3)' }}
            >
              👑 Admin Center ➔
            </button>
            <button
              onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
              style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '9px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px' }}
            >
              Logout
            </button>
          </div>
        </div>

        {/* Issue Submission Form */}
        <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '32px', marginBottom: '36px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>🚀 Raise a New Issue</h2>
          <p style={{ margin: '0 0 20px', color: '#94a3b8', fontSize: '13px' }}>Describe your problem. Google Gemini AI will instantly analyze, prioritize, and route it.</p>

          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Issue Title</label>
              <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. WiFi connection completely down on 3rd floor office"
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', backgroundColor: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Detailed Problem Description</label>
              <textarea required rows={4} value={description} onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what is happening, which systems are affected, and what urgency is needed..."
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', backgroundColor: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', resize: 'vertical' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Attach Screenshot (Optional)</label>
              <input type="file" accept="image/*" onChange={(e) => setImage(e.target.files[0])} style={{ color: '#94a3b8', fontSize: '13px' }} />
            </div>

            <button type="submit" disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)', opacity: loading ? 0.7 : 1 }}
            >
              {loading ? '🤖 Google Gemini AI Analyzing & Routing...' : 'Submit Issue to AI ➔'}
            </button>
          </form>
        </div>

        {/* Submitted Issues List */}
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#ffffff' }}>📜 My Submitted Issues ({complaints.length})</h2>
        
        {fetching ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[1, 2, 3].map((i) => (
              <div key={i} style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', borderRadius: '16px', padding: '24px', animation: 'pulse 1.5s ease-in-out infinite' }}>
                <div style={{ height: '18px', width: '60%', backgroundColor: 'rgba(255,255,255,0.06)', borderRadius: '8px', marginBottom: '12px' }}></div>
                <div style={{ height: '14px', width: '90%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '8px', marginBottom: '8px' }}></div>
                <div style={{ height: '14px', width: '40%', backgroundColor: 'rgba(255,255,255,0.04)', borderRadius: '8px' }}></div>
              </div>
            ))}
            <style>{`@keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }`}</style>
          </div>
        ) : complaints.length === 0 ? (
          <p style={{ color: '#64748b' }}>No issues filed yet. Submit your first issue above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {complaints.map((c) => (
              <div key={c._id} style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px', transition: 'border-color 0.2s, transform 0.2s', cursor: 'default' }}
                onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'rgba(99,102,241,0.3)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.transform = 'translateY(0)'; }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <h3 style={{ margin: 0, fontSize: '16px', color: '#ffffff', fontWeight: '600' }}>{c.title}</h3>
                  <span style={{ fontSize: '12px', fontWeight: '700', padding: '4px 12px', borderRadius: '20px', backgroundColor: c.status === 'Resolved' ? '#10b981' : c.status === 'In Progress' ? '#3b82f6' : '#f59e0b', color: '#fff' }}>
                    {c.status}
                  </span>
                </div>
                
                <p style={{ margin: '0 0 14px', color: '#94a3b8', fontSize: '13px', lineHeight: '1.5' }}>{c.description}</p>
                
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', fontSize: '13px', color: '#cbd5e1', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '12px' }}>
                  <span>🏷️ Category: <strong style={{ color: '#818cf8' }}>{c.category}</strong></span>
                  <span>⚡ Priority: <strong style={{ color: c.priority === 'Critical' ? '#f87171' : '#60a5fa' }}>{c.priority}</strong></span>
                  <span>🎯 Confidence: <strong style={{ color: '#34d399' }}>{c.aiConfidence}%</strong></span>
                </div>
                
                {c.aiSummary && (
                  <div style={{ marginTop: '12px', fontSize: '12px', color: '#c084fc', backgroundColor: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)', padding: '8px 14px', borderRadius: '10px' }}>
                    ✨ <strong>AI Summary:</strong> {c.aiSummary}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

      </div>
    </div>
  );
};

export default Dashboard;