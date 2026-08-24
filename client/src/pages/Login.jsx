import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import { useTheme } from '../context/ThemeContext';

const Login = () => {
  const { theme } = useTheme();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('accessToken');
    let savedUser = {};
    try {
      const raw = localStorage.getItem('user');
      if (raw && raw !== 'undefined') savedUser = JSON.parse(raw);
    } catch (e) {}
    if (token) {
      if (savedUser.role === 'admin') {
        navigate('/admin');
      } else if (savedUser.role === 'regulatoryAuthority') {
        navigate('/regulatory-dashboard');
      } else if (savedUser.role === 'contractor') {
        navigate('/contractor');
      } else {
        navigate('/dashboard');
      }
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await API.post('/auth/login', {
        email: email.trim().toLowerCase(),
        password: password.trim()
      });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      if (res.data.user?.role === 'admin') {
        navigate('/admin');
      } else if (res.data.user?.role === 'regulatoryAuthority') {
        navigate('/regulatory-dashboard');
      } else if (res.data.user?.role === 'contractor') {
        navigate('/contractor');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: theme.background, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif", padding: '20px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Animated Ambient Orbs */}
      <div style={{ position: 'absolute', top: '15%', left: '20%', width: '400px', height: '400px', backgroundColor: '#f59e0b', filter: 'blur(160px)', opacity: 0.14, borderRadius: '50%', animation: 'float1 8s ease-in-out infinite' }}></div>
      <div style={{ position: 'absolute', bottom: '15%', right: '20%', width: '350px', height: '350px', backgroundColor: '#ea580c', filter: 'blur(140px)', opacity: 0.12, borderRadius: '50%', animation: 'float2 10s ease-in-out infinite' }}></div>
      <div style={{ position: 'absolute', top: '60%', left: '60%', width: '250px', height: '250px', backgroundColor: '#d97706', filter: 'blur(120px)', opacity: 0.08, borderRadius: '50%', animation: 'float1 12s ease-in-out infinite reverse' }}></div>

      {/* Glass Card */}
      <div style={{ width: '100%', maxWidth: '440px', backgroundColor: theme.isDark ? 'rgba(11, 15, 25, 0.92)' : 'rgba(255, 255, 255, 0.92)', backdropFilter: 'blur(24px)', border: `1px solid ${theme.cardBorder}`, borderRadius: '28px', padding: '44px 40px', boxShadow: theme.isDark ? '0 32px 64px -16px rgba(0, 0, 0, 0.8), 0 0 40px -10px rgba(245, 158, 11, 0.15)' : '0 10px 40px -10px rgba(0, 0, 0, 0.1), 0 0 40px -10px rgba(245, 158, 11, 0.1)', zIndex: 1, animation: 'fadeUp 0.6s ease-out' }}>
        
        {/* Back to Home Link */}
        <div style={{ marginBottom: '16px' }}>
          <Link
            to="/"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              color: '#94a3b8',
              textDecoration: 'none',
              fontSize: '12px',
              fontWeight: '600',
              transition: 'color 0.2s ease'
            }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#fbbf24'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <span>←</span> Back to Home
          </Link>
        </div>

        {/* Logo + Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', background: 'linear-gradient(135deg, #f59e0b, #ea580c)', borderRadius: '18px', fontSize: '28px', marginBottom: '20px', boxShadow: '0 12px 28px -5px rgba(245, 158, 11, 0.5)', animation: 'float3 3s ease-in-out infinite', color: '#fff' }}>
            ⛏️
          </div>
          <h1 style={{ color: theme.textPrimary, fontSize: '28px', fontWeight: '800', margin: '0 0 8px', letterSpacing: '-0.7px' }}>
            CoalGuard
          </h1>
          <p style={{ color: theme.textSecondary, fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
            Sign in to Mine Operations & Compliance Command
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.12)', border: '1px solid rgba(239, 68, 68, 0.25)', color: '#f87171', padding: '12px 16px', borderRadius: '12px', fontSize: '13px', marginBottom: '24px', display: 'flex', alignItems: 'center', gap: '8px', animation: 'shake 0.4s ease-out' }}>
            <span>⚠️</span> {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: theme.textSecondary, fontSize: '13px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.3px' }}>
              Field Officer / Admin Email
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', opacity: 0.4 }}>✉️</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@mine.gov.in"
                style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff', border: `1px solid ${theme.cardBorder}`, color: theme.textPrimary, fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(245, 158, 11, 0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.2)'; }}
                onBlur={(e) => { e.target.style.borderColor = theme.cardBorder; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <label style={{ color: theme.textSecondary, fontSize: '13px', fontWeight: '600', letterSpacing: '0.3px' }}>
                Password
              </label>
            </div>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', opacity: 0.4 }}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '14px 48px 14px 44px', borderRadius: '12px', backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff', border: `1px solid ${theme.cardBorder}`, color: theme.textPrimary, fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(245, 158, 11, 0.6)'; e.target.style.boxShadow = '0 0 0 3px rgba(245, 158, 11, 0.2)'; }}
                onBlur={(e) => { e.target.style.borderColor = theme.cardBorder; e.target.style.boxShadow = 'none'; }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '16px', padding: '4px' }}
              >
                {showPassword ? '🙈' : '👁️'}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              background: loading ? 'rgba(245, 158, 11, 0.5)' : 'linear-gradient(135deg, #f59e0b 0%, #ea580c 100%)',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: loading ? 'none' : '0 15px 35px -5px rgba(245, 158, 11, 0.5), 0 0 20px rgba(234, 88, 12, 0.3)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
              position: 'relative',
              overflow: 'hidden'
            }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }}></span>
                Authenticating...
              </span>
            ) : 'Access CoalGuard Hub ➔'}
          </button>
        </form>

        {/* Divider */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', margin: '28px 0' }}>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }}></div>
          <span style={{ color: '#475569', fontSize: '12px', fontWeight: '600' }}>OR</span>
          <div style={{ flex: 1, height: '1px', backgroundColor: 'rgba(255,255,255,0.08)' }}></div>
        </div>

        {/* Create Account Link */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Need Field Credentials?{' '}
            <Link to="/register" style={{ color: '#f59e0b', fontWeight: '700', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#fbbf24'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#f59e0b'}
            >
              Register Field Officer
            </Link>
          </p>
        </div>
      </div>

      {/* CSS Animations */}
      <style>{`
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float1 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(30px, -20px); }
        }
        @keyframes float2 {
          0%, 100% { transform: translate(0, 0); }
          50% { transform: translate(-25px, 15px); }
        }
        @keyframes float3 {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          25% { transform: translateX(-6px); }
          75% { transform: translateX(6px); }
        }
        @keyframes spin {
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
};

export default Login;