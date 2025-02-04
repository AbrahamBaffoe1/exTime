import React, { useState, useEffect } from 'react';
import { useSettings } from '../SettingsContext/SettingsContext';
import { useTheme } from '../ThemeContext/ThemeContext';
import { useLocation } from 'react-router-dom';
import { 
  Settings as SettingsIcon, Clock, Bell, Sun, 
  RotateCcw, Crown, Lock, ChevronRight, Shield, 
  Zap, Activity, PlayCircle
} from 'lucide-react';
import './Settings.css';

const Settings = () => {
  const location = useLocation();
  const { settings, updateSettings, resetSettings, errors } = useSettings();
  const { theme, setTheme, themes: THEMES } = useTheme();
  const [activeSection, setActiveSection] = useState('premium');
  const [isScrolled, setIsScrolled] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notification, setNotification] = useState(null);

  // Handle scroll effects
  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Handle payment status
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const paymentStatus = params.get('payment');
    const sessionId = params.get('session_id');

    if (paymentStatus === 'success' && sessionId) {
      updateSettings({ isPremium: true });
      setNotification({
        type: 'success',
        message: 'Successfully upgraded to Premium!'
      });
      window.history.replaceState({}, document.title, '/settings');
    } else if (paymentStatus === 'cancelled') {
      setNotification({
        type: 'info',
        message: 'Payment cancelled. You can try again when ready.'
      });
      window.history.replaceState({}, document.title, '/settings');
    }
  }, [location, updateSettings]);

  const sections = [
    {
      id: 'premium',
      icon: Crown,
      title: 'Premium Features',
      description: 'Upgrade your experience'
    },
    {
      id: 'appearance',
      icon: Sun,
      title: 'Appearance',
      description: 'Customize your interface'
    },
    {
      id: 'time',
      icon: Clock,
      title: 'Time Settings',
      description: 'Manage your schedule'
    },
    {
      id: 'notifications',
      icon: Bell,
      title: 'Notifications',
      description: 'Control your alerts'
    }
  ];

  const premiumFeatures = [
    {
      icon: Shield,
      title: 'Advanced Security',
      description: 'Enterprise-grade data protection'
    },
    {
      icon: Zap,
      title: 'Smart Automation',
      description: 'AI-powered workflow optimization'
    },
    {
      icon: Activity,
      title: 'Advanced Analytics',
      description: 'Deep productivity insights'
    },
    {
      icon: PlayCircle,
      title: 'Priority Support',
      description: '24/7 dedicated assistance'
    }
  ];

  const handleSettingChange = async (key, value) => {
    setLoading(true);
    try {
      const success = await updateSettings({ [key]: value });
      if (!success && errors[key]) {
        setNotification({
          type: 'error',
          message: errors[key]
        });
      }
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to update setting'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpgradeClick = async () => {
    setLoading(true);
    try {
      await initiateCheckout();
    } catch (error) {
      setNotification({
        type: 'error',
        message: 'Failed to initiate checkout. Please try again.'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="settings-container">
      {/* Header */}
      <header className={`settings-header ${isScrolled ? 'scrolled' : ''}`}>
        <h1>Settings</h1>
      </header>

      <main className="settings-main">
        {/* Notification */}
        {notification && (
          <div className={`notification-toast ${notification.type}`}>
            {notification.message}
          </div>
        )}

        {/* Navigation Cards */}
        <div className="settings-nav">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <div
                key={section.id}
                className={`nav-card ${activeSection === section.id ? 'active' : ''}`}
                onClick={() => setActiveSection(section.id)}
              >
                <div className="nav-card-content">
                  <Icon className="nav-card-icon" />
                  <div className="nav-card-text">
                    <h3>{section.title}</h3>
                    <p>{section.description}</p>
                  </div>
                  <ChevronRight className="nav-card-arrow" />
                </div>
                <div className="nav-card-backdrop"></div>
              </div>
            );
          })}
        </div>

        {/* Main Content */}
        <div className="settings-content">
          {activeSection === 'premium' && (
            <div className="premium-section">
              {!settings.isPremium ? (
                <div className="premium-upgrade">
                  <div className="premium-header">
                    <Crown className="premium-icon" />
                    <h2>Unlock Premium Features</h2>
                    <p>Take your experience to the next level</p>
                  </div>

                  <div className="premium-features">
                    {premiumFeatures.map((feature, index) => {
                      const FeatureIcon = feature.icon;
                      return (
                        <div key={index} className="premium-feature-card">
                          <FeatureIcon className="feature-icon" />
                          <h3>{feature.title}</h3>
                          <p>{feature.description}</p>
                        </div>
                      );
                    })}
                  </div>

                  <div className="premium-pricing">
                    <div className="price-tag">
                      <span className="price">$9.99</span>
                      <span className="period">/month</span>
                    </div>
                    <button 
                      className="upgrade-button"
                      onClick={handleUpgradeClick}
                      disabled={loading}
                    >
                      <span>Upgrade Now</span>
                      <div className="button-glow"></div>
                    </button>
                  </div>
                </div>
              ) : (
                <div className="premium-features-enabled">
                  <div className="premium-header">
                    <Crown className="premium-icon" />
                    <h2>Premium Features</h2>
                  </div>

                  <div className="settings-group">
                    <div className="notification-option">
                      <div className="notification-info">
                        <h3>Auto Clock In/Out</h3>
                        <p>Automatically track your work hours</p>
                      </div>
                      <div 
                        className={`toggle-switch ${settings.autoClockSettings?.enabled ? 'active' : ''}`}
                        onClick={() => handleSettingChange('autoClockSettings', {
                          ...settings.autoClockSettings,
                          enabled: !settings.autoClockSettings?.enabled
                        })}
                      />
                    </div>

                    {settings.autoClockSettings?.enabled && (
                      <div className="subsettings">
                        <div className="workdays-grid">
                          {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                            <button
                              key={day}
                              className={`workday-button ${
                                settings.autoClockSettings.workdays?.[day] ? 'active' : ''
                              }`}
                              onClick={() => {
                                const newWorkdays = {
                                  ...settings.autoClockSettings.workdays,
                                  [day]: !settings.autoClockSettings.workdays?.[day]
                                };
                                handleSettingChange('autoClockSettings', {
                                  ...settings.autoClockSettings,
                                  workdays: newWorkdays
                                });
                              }}
                            >
                              {day}
                            </button>
                          ))}
                        </div>

                        <div className="time-inputs">
                          <div className="time-input">
                            <label>Clock In Time</label>
                            <input
                              type="time"
                              className="settings-input"
                              value={settings.autoClockSettings.clockInTime}
                              onChange={(e) => 
                                handleSettingChange('autoClockSettings', {
                                  ...settings.autoClockSettings,
                                  clockInTime: e.target.value
                                })
                              }
                            />
                          </div>
                          <div className="time-input">
                            <label>Clock Out Time</label>
                            <input
                              type="time"
                              className="settings-input"
                              value={settings.autoClockSettings.clockOutTime}
                              onChange={(e) => 
                                handleSettingChange('autoClockSettings', {
                                  ...settings.autoClockSettings,
                                  clockOutTime: e.target.value
                                })
                              }
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}

          {activeSection === 'appearance' && (
            <div className="appearance-section">
              <h2>Theme Selection</h2>
              <div className="theme-options">
                <button
                  className={`theme-button ${theme === THEMES.LIGHT ? 'active' : ''}`}
                  onClick={() => setTheme(THEMES.LIGHT)}
                >
                  Light
                </button>
                <button
                  className={`theme-button ${theme === THEMES.DARK ? 'active' : ''}`}
                  onClick={() => setTheme(THEMES.DARK)}
                >
                  Dark
                </button>
                <button
                  className={`theme-button ${theme === THEMES.SYSTEM ? 'active' : ''}`}
                  onClick={() => setTheme(THEMES.SYSTEM)}
                >
                  System
                </button>
              </div>
            </div>
          )}

          {activeSection === 'time' && (
            <div className="time-settings">
              <div className="setting-group">
                <div className="time-format-toggle">
                  <span>24-Hour Format</span>
                  <div 
                    className={`toggle-switch ${settings.timeFormat === '24' ? 'active' : ''}`}
                    onClick={() => 
                      handleSettingChange('timeFormat', 
                        settings.timeFormat === '24' ? '12' : '24'
                      )
                    }
                  />
                </div>
              </div>
            </div>
          )}

          {activeSection === 'notifications' && (
            <div className="notification-settings">
              <div className="notification-option">
                <div className="notification-info">
                  <h3>Break Reminders</h3>
                  <p>Get reminded to take breaks</p>
                </div>
                <div 
                  className={`toggle-switch ${settings.breakReminders ? 'active' : ''}`}
                  onClick={() => handleSettingChange('breakReminders', !settings.breakReminders)}
                />
              </div>

              {settings.breakReminders && (
                <div className="notification-option subsetting">
                  <div className="notification-info">
                    <h3>Reminder Interval</h3>
                    <p>Minutes between reminders</p>
                  </div>
                  <input
                    type="number"
                    className="settings-input"
                    value={settings.breakReminderInterval}
                    onChange={(e) => 
                      handleSettingChange('breakReminderInterval', 
                        parseInt(e.target.value)
                      )
                    }
                    min="15"
                    max="120"
                  />
                </div>
              )}

              <div className="notification-option">
                <div className="notification-info">
                  <h3>Overtime Alerts</h3>
                  <p>Get notified about overtime</p>
                </div>
                <div 
                  className={`toggle-switch ${settings.overtimeAlerts ? 'active' : ''}`}
                  onClick={() => handleSettingChange('overtimeAlerts', !settings.overtimeAlerts)}
                />
              </div>

              {settings.overtimeAlerts && (
                <div className="notification-option subsetting">
                  <div className="notification-info">
                    <h3>Daily Limit</h3>
                    <p>Hours before overtime</p>
                  </div>
                  <input
                    type="number"
                    className="settings-input"
                    value={settings.overtimeThreshold}
                    onChange={(e) => 
                      handleSettingChange('overtimeThreshold', 
                        parseInt(e.target.value)
                      )
                    }
                    min="4"
                    max="12"
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="settings-footer">
          <button 
            className="reset-button"
            onClick={() => setShowResetConfirm(true)}
            disabled={loading}
          >
            <RotateCcw className="reset-icon" />
            Reset to Defaults
          </button>
        </div>

        {/* Reset Confirmation Dialog */}
        {showResetConfirm && (
          <div className="modal-overlay">
            <div className="modal-content">
              <h2>Reset Settings</h2>
              <p>This will reset all settings to their default values. This action cannot be undone.</p>
              <div className="modal-actions">
                <button 
                  className="modal-button cancel"
                  onClick={() => setShowResetConfirm(false)}
                  disabled={loading}
                >
                  Cancel
                </button>
                <button 
                  className="modal-button confirm"
                  onClick={handleResetSettings}
                  disabled={loading}
                >
                  Reset Settings
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="loading-overlay">
            <div className="loading-spinner" />
          </div>
        )}
      </main>
    </div>
  );
};

export default Settings;
