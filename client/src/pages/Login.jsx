import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
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
      navigate(savedUser.role === 'admin' ? '/admin' : '/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(
        'https://ai-smart-issue-routing-production.up.railway.app/api/auth/login',
        { email, password }
      );
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      if (res.data.user?.role === 'admin') {
        navigate('/admin');
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
    <div style={{ minHeight: '100vh', backgroundColor: '#090d16', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Inter', system-ui, sans-serif", padding: '20px', position: 'relative', overflow: 'hidden' }}>
      
      {/* Animated Ambient Orbs */}
      <div style={{ position: 'absolute', top: '15%', left: '20%', width: '400px', height: '400px', backgroundColor: '#6366f1', filter: 'blur(160px)', opacity: 0.2, borderRadius: '50%', animation: 'float1 8s ease-in-out infinite' }}></div>
      <div style={{ position: 'absolute', bottom: '15%', right: '20%', width: '350px', height: '350px', backgroundColor: '#a855f7', filter: 'blur(140px)', opacity: 0.15, borderRadius: '50%', animation: 'float2 10s ease-in-out infinite' }}></div>
      <div style={{ position: 'absolute', top: '60%', left: '60%', width: '250px', height: '250px', backgroundColor: '#ec4899', filter: 'blur(120px)', opacity: 0.1, borderRadius: '50%', animation: 'float1 12s ease-in-out infinite reverse' }}></div>

      {/* Glass Card */}
      <div style={{ width: '100%', maxWidth: '440px', backgroundColor: 'rgba(17, 24, 39, 0.7)', backdropFilter: 'blur(24px)', border: '1px solid rgba(255, 255, 255, 0.08)', borderRadius: '28px', padding: '44px 40px', boxShadow: '0 32px 64px -16px rgba(0, 0, 0, 0.7)', zIndex: 1, animation: 'fadeUp 0.6s ease-out' }}>
        
        {/* Logo + Header */}
        <div style={{ textAlign: 'center', marginBottom: '36px' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '60px', height: '60px', background: 'linear-gradient(135deg, #6366f1, #a855f7)', borderRadius: '18px', fontSize: '28px', marginBottom: '20px', boxShadow: '0 12px 28px -5px rgba(99, 102, 241, 0.5)', animation: 'float3 3s ease-in-out infinite' }}>
            ⚡
          </div>
          <h1 style={{ color: '#ffffff', fontSize: '28px', fontWeight: '800', margin: '0 0 8px', letterSpacing: '-0.7px' }}>
            Welcome Back
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0, lineHeight: 1.5 }}>
            Sign in to your AI Smart Issue Routing account
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
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.3px' }}>
              Email Address
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', opacity: 0.4 }}>✉️</span>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@company.com"
                style={{ width: '100%', padding: '14px 16px 14px 44px', borderRadius: '12px', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
              />
            </div>
          </div>

          {/* Password */}
          <div style={{ marginBottom: '28px' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '8px', letterSpacing: '0.3px' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '16px', opacity: 0.4 }}>🔒</span>
              <input
                type={showPassword ? 'text' : 'password'}
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                style={{ width: '100%', padding: '14px 50px 14px 44px', borderRadius: '12px', backgroundColor: 'rgba(15, 23, 42, 0.5)', border: '1px solid rgba(255, 255, 255, 0.1)', color: '#ffffff', fontSize: '14px', outline: 'none', boxSizing: 'border-box', transition: 'border-color 0.3s, box-shadow 0.3s' }}
                onFocus={(e) => { e.target.style.borderColor = 'rgba(99,102,241,0.5)'; e.target.style.boxShadow = '0 0 0 3px rgba(99,102,241,0.1)'; }}
                onBlur={(e) => { e.target.style.borderColor = 'rgba(255,255,255,0.1)'; e.target.style.boxShadow = 'none'; }}
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
            style={{ width: '100%', padding: '15px', borderRadius: '14px', border: 'none', background: loading ? 'rgba(99,102,241,0.5)' : 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: '#ffffff', fontSize: '15px', fontWeight: '700', cursor: loading ? 'not-allowed' : 'pointer', boxShadow: loading ? 'none' : '0 12px 24px -6px rgba(99, 102, 241, 0.4)', transition: 'all 0.3s', letterSpacing: '0.3px', position: 'relative', overflow: 'hidden' }}
            onMouseEnter={(e) => { if (!loading) e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            {loading ? (
              <span style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
                <span style={{ width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.3)', borderTopColor: '#fff', borderRadius: '50%', display: 'inline-block', animation: 'spin 0.8s linear infinite' }}></span>
                Authenticating...
              </span>
            ) : 'Sign In ➔'}
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
            Don't have an account?{' '}
            <Link to="/register" style={{ color: '#818cf8', fontWeight: '700', textDecoration: 'none', transition: 'color 0.2s' }}
              onMouseEnter={(e) => e.currentTarget.style.color = '#a78bfa'}
              onMouseLeave={(e) => e.currentTarget.style.color = '#818cf8'}
            >
              Create Account
            </Link>
          </p>
        </div>

        {/* Back to Home */}
        <div style={{ textAlign: 'center', marginTop: '16px' }}>
          <Link to="/" style={{ color: '#475569', fontSize: '13px', textDecoration: 'none', fontWeight: '500' }}
            onMouseEnter={(e) => e.currentTarget.style.color = '#94a3b8'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#475569'}
          >
            ← Back to Home
          </Link>
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