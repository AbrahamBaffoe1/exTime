import React, { createContext, useState, useContext, useEffect } from 'react';

// Define theme types
const THEMES = {
  LIGHT: 'light',
  DARK: 'dark',
  SYSTEM: 'system'
};

// Create context
const ThemeContext = createContext({
  theme: THEMES.LIGHT,
  setTheme: () => {},
  toggleTheme: () => {},
});

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState(() => {
    // First, check localStorage
    const savedTheme = localStorage.getItem('app-theme');
    if (savedTheme && Object.values(THEMES).includes(savedTheme)) {
      return savedTheme;
    }
    
    // If no saved theme, check system preference
    const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches 
      ? THEMES.DARK 
      : THEMES.LIGHT;
    
    return systemTheme;
  });

  // Effect to apply theme to document
  useEffect(() => {
    // Remove previous theme classes
    document.documentElement.classList.remove(
      THEMES.LIGHT, 
      THEMES.DARK
    );

    // Apply current theme
    if (theme === THEMES.DARK) {
      document.documentElement.classList.add(THEMES.DARK);
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.add(THEMES.LIGHT);
      document.documentElement.style.colorScheme = 'light';
    }

    // Save to localStorage
    localStorage.setItem('app-theme', theme);
  }, [theme]);

  // Toggle theme function
  const toggleTheme = () => {
    setTheme(prevTheme => {
      switch(prevTheme) {
        case THEMES.LIGHT: return THEMES.DARK;
        case THEMES.DARK: return THEMES.LIGHT;
        default: return THEMES.LIGHT;
      }
    });
  };

  return (
    <ThemeContext.Provider value={{ 
      theme, 
      setTheme, 
      toggleTheme,
      themes: THEMES 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

// Custom hook to use theme context
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};