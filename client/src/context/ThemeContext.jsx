import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const themes = {
  dark: {
    bg: '#090d16',
    cardBg: 'rgba(17, 24, 39, 0.75)',
    cardBorder: 'rgba(255, 255, 255, 0.1)',
    textPrimary: '#ffffff',
    textSecondary: '#94a3b8',
    textMuted: '#64748b',
    navBg: 'rgba(9, 13, 22, 0.85)',
    inputBg: 'rgba(15, 23, 42, 0.6)',
    tableHeaderBg: 'rgba(15, 23, 42, 0.4)',
    tableRowBorder: 'rgba(255, 255, 255, 0.04)',
    badgeBg: 'rgba(255, 255, 255, 0.05)',
    isDark: true,
  },
  light: {
    bg: '#f1f5f9',
    cardBg: '#ffffff',
    cardBorder: '#cbd5e1',
    textPrimary: '#0f172a',
    textSecondary: '#475569',
    textMuted: '#64748b',
    navBg: 'rgba(255, 255, 255, 0.95)',
    inputBg: '#ffffff',
    tableHeaderBg: '#f8fafc',
    tableRowBorder: '#e2e8f0',
    badgeBg: '#e2e8f0',
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
