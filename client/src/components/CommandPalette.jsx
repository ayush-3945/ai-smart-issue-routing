import React, { useState, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';

const CommandPalette = ({ isOpen, onClose, complaints, onSelectComplaint }) => {
  const [query, setQuery] = useState('');
  const { theme } = useTheme();
  const { t } = useLanguage();

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        onClose(!isOpen);
      }
      if (e.key === 'Escape' && isOpen) {
        onClose(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const filtered = complaints.filter(
    (c) =>
      c.title.toLowerCase().includes(query.toLowerCase()) ||
      c.category.toLowerCase().includes(query.toLowerCase()) ||
      (c.mineSite && c.mineSite.toLowerCase().includes(query.toLowerCase())) ||
      (c.assignedTo && c.assignedTo.toLowerCase().includes(query.toLowerCase()))
  );

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(10px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: '12vh'
      }}
      onClick={() => onClose(false)}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '620px',
          backgroundColor: theme.isDark ? '#0f121d' : '#ffffff',
          borderRadius: '20px',
          border: `1px solid ${theme.isDark ? 'rgba(14, 165, 233, 0.35)' : '#e2e8f0'}`,
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.6), 0 0 30px rgba(14, 165, 233, 0.25)',
          overflow: 'hidden'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: '18px 24px',
            borderBottom: `1px solid ${theme.cardBorder}`
          }}
        >
          <span style={{ fontSize: '18px' }}>🔍</span>
          <input
            type="text"
            autoFocus
            placeholder="Search mine hazards, pit zones, DGMS leads or status... (ESC to close)"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{
              flex: 1,
              backgroundColor: 'transparent',
              border: 'none',
              outline: 'none',
              fontSize: '15px',
              fontWeight: '600',
              color: theme.textPrimary
            }}
          />
          <span
            style={{
              fontSize: '11px',
              padding: '3px 8px',
              borderRadius: '6px',
              backgroundColor: theme.isDark ? 'rgba(255,255,255,0.08)' : '#f1f5f9',
              color: theme.textMuted,
              fontWeight: '700'
            }}
          >
            ESC
          </span>
        </div>

        {/* Quick Suggestions / Filtered List */}
        <div style={{ maxHeight: '380px', overflowY: 'auto', padding: '12px' }}>
          {filtered.length === 0 ? (
            <div style={{ padding: '32px', textAlign: 'center', color: theme.textMuted, fontSize: '14px' }}>
              No matching mine violations or commands found.
            </div>
          ) : (
            filtered.slice(0, 8).map((c) => (
              <div
                key={c._id}
                onClick={() => {
                  onSelectComplaint(c);
                  onClose(false);
                }}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  backgroundColor: 'transparent'
                }}
                onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = theme.isDark ? 'rgba(14, 165, 233, 0.15)' : '#f8fafc')}
                onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = 'transparent')}
              >
                <div>
                  <div style={{ fontSize: '14px', fontWeight: '700', color: theme.textPrimary }}>
                    {c.title}
                  </div>
                  <div style={{ fontSize: '12px', color: theme.textMuted, marginTop: '2px' }}>
                    {c.mineSite ? `🏭 ${c.mineSite} • ` : ''}📁 {c.category} • 👤 {c.assignedTo || 'Unassigned'} • Status:{' '}
                    <span style={{ color: c.status === 'Resolved' ? '#10b981' : '#f59e0b', fontWeight: '700' }}>
                      {c.status}
                    </span>
                  </div>
                </div>
                <span style={{ fontSize: '12px', color: '#38bdf8', fontWeight: '700' }}>Jump ➔</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default CommandPalette;
