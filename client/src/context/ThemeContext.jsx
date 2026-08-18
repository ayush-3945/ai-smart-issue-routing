import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  dark: {
    bg: '#08090d',
    cardBg: 'rgba(15, 17, 26, 0.78)',
    cardBorder: 'rgba(139, 92, 246, 0.18)',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    navBg: 'rgba(8, 9, 13, 0.88)',
    inputBg: 'rgba(18, 21, 33, 0.75)',
    tableHeaderBg: 'rgba(14, 16, 26, 0.65)',
    tableRowBorder: 'rgba(139, 92, 246, 0.08)',
    badgeBg: 'rgba(139, 92, 246, 0.12)',
    accentPrimary: '#8b5cf6',
    accentCyan: '#06b6d4',
    accentGlow: '0 0 25px -5px rgba(139, 92, 246, 0.35)',
    isDark: true,
  },
  light: {
    bg: '#f8fafc',
    cardBg: '#ffffff',
    cardBorder: '#e2e8f0',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    navBg: 'rgba(255, 255, 255, 0.95)',
    inputBg: '#ffffff',
    tableHeaderBg: '#f1f5f9',
    tableRowBorder: '#e2e8f0',
    badgeBg: '#ede9fe',
    accentPrimary: '#7c3aed',
    accentCyan: '#0891b2',
    accentGlow: '0 4px 14px 0 rgba(124, 58, 237, 0.15)',
    isDark: false,
  },
};

export const ThemeProvider = ({ children }) => {
  const [themeMode, setThemeMode] = useState(() => {
    return localStorage.getItem('themeMode') || 'dark';
  });

  useEffect(() => {
    localStorage.setItem('themeMode', themeMode);
    document.body.style.backgroundColor = themes[themeMode].bg;
    document.body.style.color = themes[themeMode].textPrimary;
  }, [themeMode]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  const currentTheme = themes[themeMode];

  return (
    <ThemeContext.Provider value={{ themeMode, toggleTheme, theme: currentTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};
