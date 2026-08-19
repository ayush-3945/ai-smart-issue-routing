import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { useTheme } from '../context/ThemeContext';

const LanguageToggle = () => {
  const { lang, setLang } = useLanguage();
  const { theme } = useTheme();

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'hi' : 'en')}
      title={lang === 'en' ? 'Switch to Hindi (हिन्दी)' : 'Switch to English'}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '12px',
        border: `1px solid ${theme.isDark ? 'rgba(139, 92, 246, 0.3)' : '#cbd5e1'}`,
        backgroundColor: theme.isDark ? 'rgba(139, 92, 246, 0.12)' : 'rgba(255, 255, 255, 0.9)',
        color: theme.isDark ? '#c084fc' : '#7c3aed',
        cursor: 'pointer',
        fontSize: '12px',
        fontWeight: '800',
        transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
        backdropFilter: 'blur(8px)',
        boxShadow: theme.isDark ? '0 0 15px -3px rgba(139, 92, 246, 0.25)' : '0 2px 4px rgba(0,0,0,0.05)'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'scale(1.05)';
        e.currentTarget.style.borderColor = '#8b5cf6';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'scale(1)';
        e.currentTarget.style.borderColor = theme.isDark ? 'rgba(139, 92, 246, 0.3)' : '#cbd5e1';
      }}
    >
      <span style={{ fontSize: '14px' }}>🌐</span>
      <span>{lang === 'en' ? 'हिन्दी' : 'English'}</span>
    </button>
  );
};

export default LanguageToggle;
