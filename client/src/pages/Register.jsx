import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import { useTheme } from '../context/ThemeContext';

const Register = () => {
  const { theme } = useTheme();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
  const [authorityType, setAuthorityType] = useState('DGMS');
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
      if (savedUser.role === 'admin') navigate('/admin');
      else if (savedUser.role === 'regulatoryAuthority') navigate('/regulatory-dashboard');
      else navigate('/dashboard');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const payload = {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role
      };
      
      if (role === 'regulatoryAuthority') {
        payload.authorityType = authorityType;
      }

      const res = await API.post('/auth/register', payload);
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      if (res.data.user?.role === 'admin') {
        navigate('/admin');
      } else if (res.data.user?.role === 'regulatoryAuthority') {
        navigate('/regulatory-dashboard');
      } else {
        navigate('/dashboard');
      }
    } catch (err) {
      const serverMsg = err.response?.data?.errors?.join(', ') || err.response?.data?.message || err.message || 'Registration failed.';
      setError(serverMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: theme.background,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      padding: '20px',
      position: 'relative',
      overflow: 'hidden'
    }}>
      <div style={{
        position: 'absolute',
        top: '20%',
        left: '25%',
        width: '350px',
        height: '350px',
        backgroundColor: '#f59e0b',
        filter: 'blur(140px)',
        opacity: 0.14,
        borderRadius: '50%'
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: theme.isDark ? 'rgba(11, 15, 25, 0.92)' : 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'blur(20px)',
        border: `1px solid ${theme.cardBorder}`,
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8), 0 0 30px rgba(245, 158, 11, 0.15)',
        zIndex: 1
      }}>
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

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div style={{ width: '80px', height: '80px', borderRadius: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1)', overflow: 'hidden', background: '#fff' }}>
            <img src="/coaldarpan_logo.png" alt="CoalDarpan Logo" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          </div>
          <h1 style={{ color: theme.textPrimary, fontSize: '24px', fontWeight: '800', margin: '0 0 6px' }}>
            Register Field Officer
          </h1>
          <p style={{ color: theme.textSecondary, fontSize: '13px', margin: 0 }}>
            Join CoalDarpan Smart Mining Compliance Hub
          </p>
        </div>

        {error && (
          <div style={{
            backgroundColor: 'rgba(239, 68, 68, 0.15)',
            border: '1px solid rgba(239, 68, 68, 0.3)',
            color: '#f87171',
            padding: '12px 16px',
            borderRadius: '12px',
            fontSize: '13px',
            marginBottom: '20px'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: theme.textSecondary, fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Inspector Rajesh Verma"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                border: `1px solid ${theme.cardBorder}`,
                color: theme.textPrimary,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: theme.textSecondary, fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="officer@mine.gov.in"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                border: `1px solid ${theme.cardBorder}`,
                color: theme.textPrimary,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: theme.textSecondary, fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.6)' : '#ffffff',
                border: `1px solid ${theme.cardBorder}`,
                color: theme.textPrimary,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: theme.textSecondary, fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
              Account Type / Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                border: `1px solid ${theme.cardBorder}`,
                color: theme.textPrimary,
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box',
                cursor: 'pointer'
              }}
            >
              <option value="admin">Mine Official</option>
              <option value="user">Field Inspector</option>
              <option value="regulatoryAuthority">Regulatory Authority (Sarkaari Adhikari)</option>
            </select>
          </div>

          {role === 'regulatoryAuthority' && (
            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', color: theme.textSecondary, fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
                Authority Type
              </label>
              <select
                value={authorityType}
                onChange={(e) => setAuthorityType(e.target.value)}
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  backgroundColor: theme.isDark ? 'rgba(15, 23, 42, 0.8)' : '#ffffff',
                  border: `1px solid ${theme.cardBorder}`,
                  color: theme.textPrimary,
                  fontSize: '14px',
                  outline: 'none',
                  boxSizing: 'border-box',
                  cursor: 'pointer'
                }}
              >
                <option value="DGMS">DGMS Inspector (Safety)</option>
                <option value="MoEFCC">MoEFCC Officer (Environment)</option>
                <option value="State Pollution Control Board">State Pollution Control Board</option>
                <option value="Ministry of Coal">Ministry of Coal (Production)</option>
                <option value="Labour Department">Labour Department (Worker Affairs)</option>
              </select>
            </div>
          )}

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
              boxShadow: '0 15px 35px -5px rgba(245, 158, 11, 0.5), 0 0 20px rgba(234, 88, 12, 0.3)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {loading ? 'Registering...' : 'Register Field Credentials ➔'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
            Already have credentials?{' '}
            <Link to="/login" style={{ color: '#f59e0b', fontWeight: '700', textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;