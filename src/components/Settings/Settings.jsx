import React, { useState } from 'react';
import { SettingsProvider, useSettings } from '../../components/SettingsContext/SettingsContext';

import './Settings.css';

const Settings = () => {
  const { settings, updateSetting } = useSettings();

  const [theme, setTheme] = useState(settings.theme || 'light');
  const [timeFormat, setTimeFormat] = useState(settings.timeFormat || '24');
  const [breakReminders, setBreakReminders] = useState(settings.breakReminders || true);
  const [overtimeAlerts, setOvertimeAlerts] = useState(settings.overtimeAlerts || true);
  

  const handleThemeChange = (e) => {
    setTheme(e.target.value);
    // TODO: Implement theme change logic
    updateSetting('theme', e.target.value);
  };

  const handleTimeFormatChange = (e) => {
    setTimeFormat(e.target.value);
    // TODO: Implement time format change logic
    updateSetting('timeFormat', e.target.value);
  };

  const handleBreakRemindersToggle = () => {
    setBreakReminders(!breakReminders);
    // TODO: Implement break reminders toggle logic
    updateSetting('breakReminders', !breakReminders);

  };

  const handleOvertimeAlertsToggle = () => {
    setOvertimeAlerts(!overtimeAlerts);
    // TODO: Implement overtime alerts toggle logic
    updateSetting('overtimeAlerts', !overtimeAlerts);

  };

  return (
    <div className="settings-placeholder">
      <div className="card">
        <h1>Settings</h1>
        <div className="settings-content">
          <div className="settings-section">
            <h2>App Settings</h2>
            <div className="setting-item">
              <span>Theme</span>
              <select 
                value={theme} 
                onChange={handleThemeChange}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
            <div className="setting-item">
              <span>Time Format</span>
              <select 
                value={timeFormat} 
                onChange={handleTimeFormatChange}
              >
                <option value="12">12-hour</option>
                <option value="24">24-hour</option>
              </select>
            </div>
          </div>
          <div className="settings-section">
            <h2>Notifications</h2>
            <div className="setting-item">
              <span>Break Reminders</span>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={breakReminders} 
                  onChange={handleBreakRemindersToggle} 
                />
                <span className="slider"></span>
              </label>
            </div>
            <div className="setting-item">
              <span>Overtime Alerts</span>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={overtimeAlerts} 
                  onChange={handleOvertimeAlertsToggle} 
                />
                <span className="slider"></span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;