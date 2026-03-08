import { createContext, useState, useContext } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
  const [isDark, setIsDark] = useState(
    localStorage.getItem('theme') !== 'light'
  );

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const theme = {
    isDark,
    bg: isDark ? '#0f0f1a' : '#f0f2f5',
    card: isDark ? '#1a1a2e' : '#ffffff',
    text: isDark ? '#ffffff' : '#1a1a2e',
    subtext: isDark ? '#aaaaaa' : '#666666',
    border: isDark ? '#333333' : '#e0e0e0',
    input: isDark ? '#0f0f1a' : '#f8f8f8',
    primary: '#7c6fcd',
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);