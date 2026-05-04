import { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext({ dark: false, toggle: () => {} });

export function ThemeProvider({ children }) {
  const [dark, setDark] = useState(() => {
    const saved = localStorage.getItem('fixflow-theme');
    if (saved) return saved === 'dark';
    // Sync with OS preference on first visit
    return window.matchMedia('(prefers-color-scheme: dark)').matches;
  });

  useEffect(() => {
    localStorage.setItem('fixflow-theme', dark ? 'dark' : 'light');
    // Apply to <html> for CSS variable switching
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  }, [dark]);

  // Also listen to OS preference changes live
  useEffect(() => {
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const handler = (e) => {
      // Only auto-switch if user hasn't manually set a preference
      if (!localStorage.getItem('fixflow-theme-manual')) {
        setDark(e.matches);
      }
    };
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  const toggle = () => {
    localStorage.setItem('fixflow-theme-manual', '1'); // Mark as manually set
    setDark(d => !d);
  };

  return (
    <ThemeContext.Provider value={{ dark, toggle }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);
