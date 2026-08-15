import React, { useState, useEffect } from 'react';
import api from '../utils/api';

const Dashboard = () => {
  const [complaints, setComplaints] = useState([]);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [image, setImage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [message, setMessage] = useState('');

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
    setMessage('');

    try {
      const formData = new FormData();
      formData.append('title', title);
      formData.append('description', description);
      if (image) formData.append('image', image);

      await api.post('/complaints', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      setTitle('');
      setDescription('');
      setImage(null);
      setMessage('✅ Complaint analyzed by AI and submitted successfully!');
      fetchMyComplaints();
    } catch (err) {
      setMessage('❌ Failed: ' + (err.response?.data?.message || 'Error creating complaint'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', color: '#f8fafc', fontFamily: 'system-ui, sans-serif', padding: '32px 20px' }}>
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
          <button
            onClick={() => { localStorage.clear(); window.location.href = '/login'; }}
            style={{ backgroundColor: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', color: '#cbd5e1', padding: '8px 16px', borderRadius: '10px', cursor: 'pointer', fontSize: '13px', fontWeight: '600' }}
          >
            Logout ➔
          </button>
        </div>

        {/* 📝 Issue Submission Form Card */}
        <div style={{ backgroundColor: 'rgba(17, 24, 39, 0.75)', backdropFilter: 'blur(20px)', border: '1px solid rgba(255, 255, 255, 0.1)', borderRadius: '20px', padding: '32px', marginBottom: '36px', boxShadow: '0 20px 40px -15px rgba(0,0,0,0.5)' }}>
          <h2 style={{ margin: '0 0 8px', fontSize: '18px', fontWeight: '700', color: '#ffffff' }}>🚀 Raise a New Issue</h2>
          <p style={{ margin: '0 0 20px', color: '#94a3b8', fontSize: '13px' }}>Describe your problem. Google Gemini AI will instantly analyze, prioritize, and route it.</p>
          
          {message && (
            <div style={{ padding: '12px 16px', borderRadius: '10px', marginBottom: '20px', backgroundColor: message.includes('✅') ? 'rgba(16,185,129,0.15)' : 'rgba(239,68,68,0.15)', color: message.includes('✅') ? '#34d399' : '#f87171', border: `1px solid ${message.includes('✅') ? 'rgba(16,185,129,0.3)' : 'rgba(239,68,68,0.3)'}`, fontSize: '14px' }}>
              {message}
            </div>
          )}

          <form onSubmit={handleCreate}>
            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Issue Title</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. WiFi connection completely down on 3rd floor office"
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', backgroundColor: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '18px' }}>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Detailed Problem Description</label>
              <textarea
                required
                rows={4}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Explain what is happening, which systems are affected, and what urgency is needed..."
                style={{ width: '100%', padding: '14px 16px', borderRadius: '12px', backgroundColor: 'rgba(15,23,42,0.6)', border: '1px solid rgba(255,255,255,0.12)', color: '#fff', fontSize: '14px', outline: 'none', boxSizing: 'border-box' }}
              />
            </div>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px' }}>Attach Screenshot (Optional)</label>
              <input
                type="file"
                accept="image/*"
                onChange={(e) => setImage(e.target.files[0])}
                style={{ color: '#94a3b8', fontSize: '13px' }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              style={{ width: '100%', padding: '14px', borderRadius: '12px', border: 'none', background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#fff', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: '0 10px 25px -5px rgba(99, 102, 241, 0.4)' }}
            >
              {loading ? '🤖 Google Gemini AI Analyzing & Routing...' : 'Submit Issue to AI ➔'}
            </button>
          </form>
        </div>

        {/* 📜 User's Submitted Issues List */}
        <h2 style={{ fontSize: '18px', fontWeight: '700', marginBottom: '16px', color: '#ffffff' }}>📜 My Submitted Issues ({complaints.length})</h2>
        
        {fetching ? (
          <p style={{ color: '#94a3b8' }}>Loading your issues...</p>
        ) : complaints.length === 0 ? (
          <p style={{ color: '#64748b' }}>No issues filed yet. Submit your first issue above!</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {complaints.map((c) => (
              <div key={c._id} style={{ backgroundColor: 'rgba(30, 41, 59, 0.7)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '16px', padding: '20px' }}>
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