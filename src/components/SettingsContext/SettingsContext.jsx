import React, { createContext, useState, useContext, useEffect } from 'react';

// Define default settings
const DEFAULT_SETTINGS = {
  theme: 'light', // Add theme to default settings
  timeFormat: '24', // 24-hour format by default
  breakReminders: true,
  overtimeAlerts: true,
  breakReminderInterval: 60, // minutes
  overtimeThreshold: 8, // hours
};

// Create context
const SettingsContext = createContext({
  settings: DEFAULT_SETTINGS,
  updateSettings: () => {},
  resetSettings: () => {},
});

// Settings provider component
export const SettingsProvider = ({ children }) => {
  const [settings, setSettings] = useState(() => {
    // Try to load settings from localStorage
    const savedSettings = localStorage.getItem('app-settings');
    return savedSettings 
      ? { ...DEFAULT_SETTINGS, ...JSON.parse(savedSettings) }  // Merge with defaults
      : { ...DEFAULT_SETTINGS };
  });

  // Effect to save settings to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem('app-settings', JSON.stringify(settings));
    
    // Apply theme to body
    document.body.setAttribute('data-theme', settings.theme);
  }, [settings]);

  // Function to update specific settings
  const updateSettings = (newSettings) => {
    setSettings(prevSettings => ({
      ...prevSettings,
      ...newSettings
    }));
  };

  // Function to reset to default settings
  const resetSettings = () => {
    setSettings({ ...DEFAULT_SETTINGS });
    localStorage.removeItem('app-settings');
  };

  return (
    <SettingsContext.Provider value={{ 
      settings, 
      updateSettings, 
      resetSettings 
    }}>
      {children}
    </SettingsContext.Provider>
  );
};

// Custom hook to use settings context
export const useSettings = () => {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};

// Export the default settings for potential use elsewhere
export const getDefaultSettings = () => ({ ...DEFAULT_SETTINGS });
