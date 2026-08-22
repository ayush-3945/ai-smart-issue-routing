import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user');
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
      const res = await API.post('/auth/register', {
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password: password.trim(),
        role
      });
      localStorage.setItem('accessToken', res.data.accessToken);
      localStorage.setItem('refreshToken', res.data.refreshToken);
      localStorage.setItem('user', JSON.stringify(res.data.user));

      if (res.data.user?.role === 'admin') {
        navigate('/admin');
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
      backgroundColor: '#090d16',
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
        backgroundColor: '#0ea5e9',
        filter: 'blur(140px)',
        opacity: 0.15,
        borderRadius: '50%'
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'rgba(11, 14, 22, 0.85)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.08)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
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
            onMouseEnter={(e) => e.currentTarget.style.color = '#38bdf8'}
            onMouseLeave={(e) => e.currentTarget.style.color = '#94a3b8'}
          >
            <span>←</span> Back to Home
          </Link>
        </div>

        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ color: '#ffffff', fontSize: '26px', fontWeight: '800', margin: '0 0 8px' }}>
            Create Account
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            Join Dispatch OS Autonomous Operations Hub
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
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
              Full Name
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ayush Pandey"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@mycompany.com"
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '16px' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
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
                backgroundColor: 'rgba(15, 23, 42, 0.6)',
                border: '1px solid rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            />
          </div>

          <div style={{ marginBottom: '24px' }}>
            <label style={{ display: 'block', color: '#cbd5e1', fontSize: '13px', fontWeight: '600', marginBottom: '6px' }}>
              Account Type / Role
            </label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              style={{
                width: '100%',
                padding: '12px 16px',
                borderRadius: '12px',
                backgroundColor: 'rgba(15, 23, 42, 0.8)',
                border: '1px solid rgba(255, 255, 255, 0.15)',
                color: '#ffffff',
                fontSize: '14px',
                outline: 'none',
                boxSizing: 'border-box'
              }}
            >
              <option value="admin">Admin (Manage & AI Routing)</option>
              <option value="user">User (Raise Complaints)</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '16px',
              borderRadius: '16px',
              border: 'none',
              background: 'linear-gradient(135deg, #0284c7 0%, #2563eb 100%)',
              color: '#ffffff',
              fontSize: '16px',
              fontWeight: '800',
              letterSpacing: '-0.02em',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 15px 35px -5px rgba(14, 165, 233, 0.5), 0 0 20px rgba(37, 99, 235, 0.3)',
              transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
            }}
          >
            {loading ? 'Creating...' : 'Create Account ➔'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#38bdf8', fontWeight: '700', textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;