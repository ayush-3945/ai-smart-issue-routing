import React, { useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const CodeHelpSidebar = ({ activeTab, setActiveTab, currentUser, onOpenSearch }) => {
  const { theme } = useTheme();
  const { t } = useLanguage();
  const [collapsed, setCollapsed] = useState(false);

  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊', path: '/admin' },
    { id: 'issues', label: 'Active Queue', icon: '📋', path: '/admin' },
    { id: 'predictions', label: 'AI Forecasting', icon: '🔮', path: '/admin' },
    { id: 'userView', label: 'Raise Issue (User)', icon: '🚀', path: '/dashboard' },
  ];

  return (
    <div
      className="sidebar-desktop"
      style={{
        width: collapsed ? '80px' : '260px',
        minHeight: '100vh',
        backgroundColor: theme.isDark ? '#090b11' : '#ffffff',
        borderRight: `1px solid ${theme.isDark ? 'rgba(255, 255, 255, 0.08)' : '#e2e8f0'}`,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        padding: '24px 16px',
        transition: 'width 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}
    >
      {/* Top Brand Logo */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: collapsed ? 'center' : 'space-between',
            marginBottom: '32px',
            padding: '0 8px'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                background: 'linear-gradient(135deg, #0ea5e9, #2563eb)',
                width: '38px',
                height: '38px',
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '18px',
                boxShadow: '0 0 20px -3px rgba(14, 165, 233, 0.5)',
                color: '#ffffff'
              }}
            >
              ⚡
            </div>
            {!collapsed && (
              <div>
                <div style={{ fontSize: '18px', fontWeight: '900', color: theme.textPrimary, letterSpacing: '-0.5px' }}>
                  Dispatch <span className="gradient-text">OS</span>
                </div>
                <div style={{ fontSize: '11px', color: theme.textMuted, fontWeight: '700', letterSpacing: '0.2px' }}>Autonomous Incident Engine</div>
              </div>
            )}
          </div>

          <button
            onClick={() => setCollapsed(!collapsed)}
            style={{
              background: 'none',
              border: 'none',
              color: theme.textMuted,
              cursor: 'pointer',
              fontSize: '16px',
              padding: '4px'
            }}
          >
            {collapsed ? '▶' : '◀'}
          </button>
        </div>

        {/* Quick Search Spotlight Button (Ctrl + K) */}
        {!collapsed && (
          <div
            onClick={onOpenSearch}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '10px 14px',
              borderRadius: '12px',
              backgroundColor: theme.isDark ? 'rgba(18, 21, 33, 0.8)' : '#f1f5f9',
              border: `1px solid ${theme.cardBorder}`,
              color: theme.textMuted,
              fontSize: '13px',
              cursor: 'pointer',
              marginBottom: '24px',
              transition: 'border-color 0.2s'
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span>🔍</span>
              <span>Quick Search...</span>
            </div>
            <span
              style={{
                fontSize: '10px',
                fontWeight: '800',
                padding: '2px 6px',
                borderRadius: '6px',
                backgroundColor: theme.isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0',
                color: theme.textPrimary
              }}
            >
              Ctrl K
            </span>
          </div>
        )}

        {/* Navigation Menu */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => {
                  if (item.path !== window.location.pathname) {
                    window.location.href = item.path;
                  } else {
                    setActiveTab(item.id);
                    // Smooth scroll to target section if on admin page
                    if (item.id === 'dashboard') {
                      document.getElementById('section-overview')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (item.id === 'issues') {
                      document.getElementById('section-queue')?.scrollIntoView({ behavior: 'smooth' });
                    } else if (item.id === 'predictions') {
                      (document.getElementById('section-ai-forecast') || document.getElementById('section-forecasting'))?.scrollIntoView({ behavior: 'smooth' });
                    }
                  }
                }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  width: '100%',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  border: isActive ? '1px solid rgba(14, 165, 233, 0.3)' : '1px solid transparent',
                  backgroundColor: isActive
                    ? theme.isDark
                      ? 'rgba(14, 165, 233, 0.12)'
                      : '#e0f2fe'
                    : 'transparent',
                  color: isActive ? (theme.isDark ? '#38bdf8' : '#0284c7') : theme.textSecondary,
                  fontSize: '14px',
                  fontWeight: isActive ? '800' : '600',
                  cursor: 'pointer',
                  justifyContent: collapsed ? 'center' : 'flex-start',
                  transition: 'all 0.15s ease',
                  boxShadow: isActive ? '0 0 15px -3px rgba(14, 165, 233, 0.2)' : 'none'
                }}
              >
                <span style={{ fontSize: '18px' }}>{item.icon}</span>
                {!collapsed && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Bottom User Profile Card (Love Babbar CodeHelp Style) */}
      <div
        style={{
          padding: '12px',
          borderRadius: '16px',
          backgroundColor: theme.isDark ? 'rgba(18, 21, 33, 0.9)' : '#f8fafc',
          border: `1px solid ${theme.cardBorder}`,
          display: 'flex',
          alignItems: 'center',
          gap: '12px',
          cursor: 'pointer'
        }}
        onClick={() => {
          if (window.confirm('Do you want to log out?')) {
            localStorage.clear();
            window.location.href = '/login';
          }
        }}
      >
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '12px',
            background: 'linear-gradient(135deg, #8b5cf6, #06b6d4)',
            color: '#fff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '16px',
            fontWeight: '800',
            flexShrink: 0
          }}
        >
          {currentUser?.name ? currentUser.name.charAt(0).toUpperCase() : 'A'}
        </div>

        {!collapsed && (
          <div style={{ overflow: 'hidden', flex: 1 }}>
            <div
              style={{
                fontSize: '13px',
                fontWeight: '800',
                color: theme.textPrimary,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {currentUser?.name || 'Ayush Pandey'}
            </div>
            <div
              style={{
                fontSize: '11px',
                color: theme.textMuted,
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {currentUser?.email || 'admin@smartissue.ai'}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CodeHelpSidebar;
