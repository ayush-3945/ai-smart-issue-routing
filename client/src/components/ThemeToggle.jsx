import React from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeToggle = ({ style = {} }) => {
  const { themeMode, toggleTheme, theme } = useTheme();

  return (
    <button
      type="button"
      onClick={toggleTheme}
      title={`Switch to ${themeMode === 'dark' ? 'Light' : 'Dark'} Mode`}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '6px',
        padding: '8px 14px',
        borderRadius: '12px',
        border: `1px solid ${theme.cardBorder}`,
        backgroundColor: theme.badgeBg,
        color: theme.textPrimary,
        fontSize: '13px',
        fontWeight: '600',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        ...style,
      }}
    >
      <span>{themeMode === 'dark' ? '🌙 Dark' : '☀️ Light'}</span>
    </button>
  );
};

export default ThemeToggle;
