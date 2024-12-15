import React from 'react';
import { useSettings } from '../SettingsContext/SettingsContext';
import { Settings as SettingsIcon, Clock, Bell, Sun, Moon, RotateCcw } from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const { settings, updateSettings, resetSettings } = useSettings();

  const handleSettingChange = (key, value) => {
    updateSettings({ [key]: value });
  };

  const handleBreakReminderIntervalChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      handleSettingChange('breakReminderInterval', value);
    }
  };

  const handleOvertimeThresholdChange = (e) => {
    const value = parseInt(e.target.value, 10);
    if (!isNaN(value) && value > 0) {
      handleSettingChange('overtimeThreshold', value);
    }
  };

  return (
    <div className="settings-container">
      <div className="settings-card">
        <div className="settings-header">
          <SettingsIcon className="settings-icon" />
          <h1>Settings</h1>
        </div>

        <div className="settings-content">
          <div className="settings-section">
            <h2>
              <Sun className="section-icon" />
              Appearance
            </h2>
            <div className="setting-item">
              <div className="setting-info">
                <label>Theme</label>
                <span className="setting-description">Choose your preferred color theme</span>
              </div>
              <select 
                value={settings.theme} 
                onChange={(e) => handleSettingChange('theme', e.target.value)}
                className="theme-select"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
                <option value="system">System</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h2>
              <Clock className="section-icon" />
              Time Settings
            </h2>
            <div className="setting-item">
              <div className="setting-info">
                <label>Time Format</label>
                <span className="setting-description">Display time in 12 or 24-hour format</span>
              </div>
              <select 
                value={settings.timeFormat} 
                onChange={(e) => handleSettingChange('timeFormat', e.target.value)}
              >
                <option value="12">12-hour</option>
                <option value="24">24-hour</option>
              </select>
            </div>
          </div>

          <div className="settings-section">
            <h2>
              <Bell className="section-icon" />
              Notifications
            </h2>
            <div className="setting-item">
              <div className="setting-info">
                <label>Break Reminders</label>
                <span className="setting-description">Get reminded to take breaks during work</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={settings.breakReminders} 
                  onChange={(e) => handleSettingChange('breakReminders', e.target.checked)} 
                />
                <span className="slider"></span>
              </label>
            </div>

            {settings.breakReminders && (
              <div className="setting-item subsetting">
                <div className="setting-info">
                  <label>Reminder Interval</label>
                  <span className="setting-description">Minutes between break reminders</span>
                </div>
                <input
                  type="number"
                  min="15"
                  max="120"
                  value={settings.breakReminderInterval}
                  onChange={handleBreakReminderIntervalChange}
                  className="number-input"
                />
              </div>
            )}

            <div className="setting-item">
              <div className="setting-info">
                <label>Overtime Alerts</label>
                <span className="setting-description">Get notified when exceeding regular hours</span>
              </div>
              <label className="switch">
                <input 
                  type="checkbox" 
                  checked={settings.overtimeAlerts} 
                  onChange={(e) => handleSettingChange('overtimeAlerts', e.target.checked)} 
                />
                <span className="slider"></span>
              </label>
            </div>

            {settings.overtimeAlerts && (
              <div className="setting-item subsetting">
                <div className="setting-info">
                  <label>Overtime Threshold</label>
                  <span className="setting-description">Hours before overtime alert</span>
                </div>
                <input
                  type="number"
                  min="1"
                  max="12"
                  value={settings.overtimeThreshold}
                  onChange={handleOvertimeThresholdChange}
                  className="number-input"
                />
              </div>
            )}
          </div>

          <div className="settings-footer">
            <button className="reset-button" onClick={resetSettings}>
              <RotateCcw size={16} />
              Reset to Defaults
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;
