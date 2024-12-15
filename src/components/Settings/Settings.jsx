import React from 'react';
import { useSettings } from '../SettingsContext/SettingsContext';
import { Settings as SettingsIcon, Clock, Bell, Sun, Moon, RotateCcw, Crown, Lock } from 'lucide-react';
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

  const handleWorkdayChange = (day) => {
    const newWorkdays = {
      ...settings.autoClockSettings.workdays,
      [day]: !settings.autoClockSettings.workdays[day]
    };
    handleSettingChange('autoClockSettings', {
      ...settings.autoClockSettings,
      workdays: newWorkdays
    });
  };

  const handleTimeChange = (type, value) => {
    handleSettingChange('autoClockSettings', {
      ...settings.autoClockSettings,
      [type]: value
    });
  };

  const handleUpgradeClick = () => {
    // TODO: Implement Stripe checkout
    console.log('Upgrade to premium clicked');
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
              <Crown className="section-icon" />
              Premium Features
              {!settings.isPremium && <Lock className="lock-icon" size={16} />}
            </h2>
            {!settings.isPremium ? (
              <div className="premium-upgrade">
                <div className="premium-info">
                  <h3>Upgrade to Premium</h3>
                  <p>Get access to advanced features like automatic clock in/out and more!</p>
                  <ul className="premium-features-list">
                    <li>✓ Automatic clock in/out</li>
                    <li>✓ Custom work schedules</li>
                    <li>✓ Advanced reporting</li>
                  </ul>
                </div>
                <button className="upgrade-button" onClick={handleUpgradeClick}>
                  Upgrade Now
                </button>
              </div>
            ) : (
              <>
                <div className="setting-item">
                  <div className="setting-info">
                    <label>Auto Clock In/Out</label>
                    <span className="setting-description">Automatically track your work hours</span>
                  </div>
                  <label className="switch">
                    <input 
                      type="checkbox" 
                      checked={settings.autoClockSettings.enabled} 
                      onChange={(e) => handleSettingChange('autoClockSettings', {
                        ...settings.autoClockSettings,
                        enabled: e.target.checked
                      })} 
                    />
                    <span className="slider"></span>
                  </label>
                </div>

                {settings.autoClockSettings.enabled && (
                  <>
                    <div className="setting-item subsetting">
                      <div className="setting-info">
                        <label>Work Days</label>
                        <span className="setting-description">Select your working days</span>
                      </div>
                      <div className="workdays-grid">
                        {Object.entries(settings.autoClockSettings.workdays).map(([day, isEnabled]) => (
                          <button
                            key={day}
                            className={`workday-button ${isEnabled ? 'active' : ''}`}
                            onClick={() => handleWorkdayChange(day)}
                          >
                            {day.charAt(0).toUpperCase()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="setting-item subsetting">
                      <div className="setting-info">
                        <label>Work Hours</label>
                        <span className="setting-description">Set your daily work schedule</span>
                      </div>
                      <div className="work-hours">
                        <div className="time-input">
                          <label>Clock In</label>
                          <input
                            type="time"
                            value={settings.autoClockSettings.clockInTime}
                            onChange={(e) => handleTimeChange('clockInTime', e.target.value)}
                          />
                        </div>
                        <div className="time-input">
                          <label>Clock Out</label>
                          <input
                            type="time"
                            value={settings.autoClockSettings.clockOutTime}
                            onChange={(e) => handleTimeChange('clockOutTime', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}
          </div>

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
