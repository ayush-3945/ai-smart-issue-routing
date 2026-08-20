import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  dark: {
    bg: '#07090e',
    cardBg: 'rgba(13, 17, 26, 0.82)',
    cardBorder: 'rgba(255, 255, 255, 0.08)',
    textPrimary: '#f8fafc',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    navBg: 'rgba(7, 9, 14, 0.88)',
    inputBg: 'rgba(18, 23, 36, 0.85)',
    tableHeaderBg: 'rgba(11, 14, 22, 0.9)',
    tableRowBorder: 'rgba(255, 255, 255, 0.05)',
    badgeBg: 'rgba(14, 165, 233, 0.1)',
    accentPrimary: '#0ea5e9',
    accentCyan: '#06b6d4',
    accentGlow: '0 0 25px -5px rgba(14, 165, 233, 0.25)',
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
    badgeBg: '#e0f2fe',
    accentPrimary: '#0284c7',
    accentCyan: '#0891b2',
    accentGlow: '0 4px 14px 0 rgba(2, 132, 199, 0.15)',
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

export const useTheme = () => useContext(ThemeContext);
