import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('admin');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await axios.post(
        'https://ai-smart-issue-routing-production.up.railway.app/api/auth/register',
        { name, email, password, role }
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
      setError(err.response?.data?.message || 'Registration failed.');
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
        backgroundColor: '#6366f1',
        filter: 'blur(140px)',
        opacity: 0.25,
        borderRadius: '50%'
      }}></div>

      <div style={{
        width: '100%',
        maxWidth: '440px',
        backgroundColor: 'rgba(17, 24, 39, 0.75)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255, 255, 255, 0.1)',
        borderRadius: '24px',
        padding: '40px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        zIndex: 1
      }}>
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <h1 style={{ color: '#ffffff', fontSize: '26px', fontWeight: '800', margin: '0 0 8px' }}>
            Create Account
          </h1>
          <p style={{ color: '#94a3b8', fontSize: '14px', margin: 0 }}>
            Join AI Smart Issue Routing Platform
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
              padding: '14px',
              borderRadius: '12px',
              border: 'none',
              background: 'linear-gradient(135deg, #6366f1, #8b5cf6)',
              color: '#ffffff',
              fontSize: '15px',
              fontWeight: '700',
              cursor: loading ? 'not-allowed' : 'pointer',
              boxShadow: '0 10px 20px -5px rgba(99, 102, 241, 0.4)'
            }}
          >
            {loading ? 'Creating...' : 'Create Account ➔'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '24px' }}>
          <p style={{ color: '#64748b', fontSize: '13px', margin: 0 }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: '#818cf8', fontWeight: '600', textDecoration: 'none' }}>
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Register;