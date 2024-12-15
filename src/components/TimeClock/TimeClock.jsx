import React, { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Clock, 
  BookOpen, 
  Tag, 
  AlertCircle, 
  LogIn, 
  LogOut, 
  Coffee 
} from 'lucide-react';
import { useSettings } from '../SettingsContext/SettingsContext';
import { useAuth } from '../AuthContext/AuthContext';
import './TimeClock.css';

const SHIFT_CATEGORIES = [
  { id: 'regular', label: 'Regular Shift', color: 'var(--primary-500)' },
  { id: 'overtime', label: 'Overtime', color: 'var(--warning-500)' },
  { id: 'remote', label: 'Remote Work', color: 'var(--success-500)' },
  { id: 'training', label: 'Training', color: 'var(--info-500)' }
];

const TimeClock = () => {
  const { user, token } = useAuth();
  const { settings } = useSettings();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [clockState, setClockState] = useState({
    status: 'OUT',
    lastClockIn: null,
    lastClockOut: null,
    elapsedTime: 0,
    isOnBreak: false,
    breakStartTime: null,
    totalBreakTime: 0,
    breaks: [],
    category: 'regular',
    shiftNotes: '',
    alerts: []
  });
  
  const [showNotes, setShowNotes] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch last entry and break state on component mount
  useEffect(() => {
    const fetchLastEntry = async () => {
      try {
        const response = await fetch('http://localhost:3000/api/time-entries/last', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        });

        if (response.ok) {
          const data = await response.json();
          if (data.lastEntry) {
            // Restore clock state based on last entry and break state
            setClockState(prev => ({
              ...prev,
              status: data.lastEntry.action === 'IN' ? 'IN' : 'OUT',
              lastClockIn: data.lastEntry.action === 'IN' ? data.lastEntry.timestamp : prev.lastClockIn,
              category: data.lastEntry.category || 'regular',
              // Restore break state if available
              ...(data.breakState && {
                isOnBreak: data.breakState.isOnBreak,
                breakStartTime: data.breakState.breakStartTime,
                totalBreakTime: data.breakState.totalBreakTime,
                breaks: data.breakState.breaks || []
              })
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching last entry:', error);
      }
    };

    if (user && token) {
      fetchLastEntry();
    }
  }, [user, token]);

  // Timer logic for tracking elapsed time and breaks
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
      if (clockState.status === 'IN' && clockState.lastClockIn) {
        const elapsed = Math.floor((new Date() - new Date(clockState.lastClockIn)) / 1000);
        const totalBreakTime = clockState.isOnBreak 
          ? clockState.totalBreakTime + Math.floor((new Date() - new Date(clockState.breakStartTime)) / 1000)
          : clockState.totalBreakTime;
          
        setClockState(prev => ({ 
          ...prev, 
          elapsedTime: elapsed - totalBreakTime 
        }));

        // Overtime alert logic
        if (elapsed - totalBreakTime > 8 * 3600 && 
            !clockState.alerts.some(alert => alert.type === 'overtime')) {
          setClockState(prev => ({
            ...prev,
            alerts: [...prev.alerts, {
              type: 'overtime',
              message: 'You have worked over 8 hours',
              timestamp: new Date().toISOString()
            }]
          }));
        }
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [clockState.status, clockState.lastClockIn, clockState.isOnBreak, 
      clockState.breakStartTime, clockState.totalBreakTime, clockState.alerts]);

  // Handle Clock In/Out Action
  const handleClockAction = async (action) => {
    setIsLoading(true);
    try {
      const timestamp = new Date().toISOString();

      const response = await fetch('http://localhost:3000/api/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          action,
          timestamp,
          category: clockState.category,
          notes: clockState.shiftNotes,
          userId: user.id
        }),
      });

      if (response.ok) {
        setClockState(prev => ({
          ...prev,
          status: action,
          [action === 'IN' ? 'lastClockIn' : 'lastClockOut']: timestamp,
          elapsedTime: action === 'OUT' ? 0 : prev.elapsedTime,
          isOnBreak: false,
          breakStartTime: null,
          totalBreakTime: action === 'IN' ? 0 : prev.totalBreakTime,
          breaks: action === 'IN' ? [] : prev.breaks,
          alerts: action === 'IN' ? [] : prev.alerts,
          shiftNotes: action === 'IN' ? '' : prev.shiftNotes
        }));
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Break Action
  const handleBreak = async () => {
    setIsLoading(true);
    try {
      const timestamp = new Date().toISOString();
      const action = clockState.isOnBreak ? 'BREAK_END' : 'BREAK_START';

      const response = await fetch('http://localhost:3000/api/time-entries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          action, 
          timestamp,
          userId: user.id
        }),
      });

      if (response.ok) {
        if (clockState.isOnBreak) {
          const breakDuration = Math.floor(
            (new Date() - new Date(clockState.breakStartTime)) / 1000
          );
          
          setClockState(prev => ({
            ...prev,
            isOnBreak: false,
            breakStartTime: null,
            totalBreakTime: prev.totalBreakTime + breakDuration,
            breaks: [...prev.breaks, {
              start: prev.breakStartTime,
              end: timestamp,
              duration: breakDuration
            }]
          }));
        } else {
          setClockState(prev => ({
            ...prev,
            isOnBreak: true,
            breakStartTime: timestamp
          }));
        }
      }
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Format elapsed time
  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const remainingSeconds = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
  };

  // Handle category change
  const handleCategoryChange = (categoryId) => {
    if (clockState.status === 'OUT') {
      setClockState(prev => ({
        ...prev,
        category: categoryId
      }));
    }
  };

  // Handle notes change
  const handleNotesChange = (event) => {
    setClockState(prev => ({
      ...prev,
      shiftNotes: event.target.value
    }));
  };

  return (
    <div className="time-clock-container">
      {/* User Welcome Section */}
      <div className="user-info">
        <span>Welcome, {user?.firstName || user?.username}</span>
      </div>

      {/* Time Display Section */}
      <div className="time-display-section">
        <div className="current-time">
          <Clock className="time-icon" />
          {format(currentTime, 'HH:mm:ss')}
        </div>
        <div className="date">
          {format(currentTime, 'EEEE, MMMM d, yyyy')}
        </div>
      </div>

      {/* Status and Actions Section */}
      <div className="status-and-actions">
        <div className="status-display">
          <div className="status-label">Current Status</div>
          <div className={`status-badge ${clockState.status.toLowerCase()}`}>
            <div className="status-dot"></div>
            <span>{clockState.status}</span>
            {clockState.isOnBreak && (
              <span className="break-indicator">On Break</span>
            )}
          </div>
        </div>

        <div className="clock-actions">
          <button
            className="clock-button clock-in"
            onClick={() => handleClockAction('IN')}
            disabled={isLoading || clockState.status === 'IN'}
          >
            <LogIn size={20} />
            Clock In
          </button>
          <button
            className="clock-button clock-out"
            onClick={() => handleClockAction('OUT')}
            disabled={isLoading || clockState.status === 'OUT'}
          >
            <LogOut size={20} />
            Clock Out
          </button>
        </div>
      </div>

      {/* Categories Section */}
      <div className="categories-section">
        <div className="section-title">Shift Category</div>
        <div className="categories-list">
          {SHIFT_CATEGORIES.map(category => (
            <button
              key={category.id}
              className={`category-button ${clockState.category === category.id ? 'active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
              style={{'--category-color': category.color}}
              disabled={clockState.status === 'IN'}
            >
              <Tag className="category-icon" />
              {category.label}
            </button>
          ))}
        </div>
      </div>

      {/* Alerts Section */}
      {clockState.alerts.length > 0 && (
        <div className="alerts-section">
          {clockState.alerts.map((alert, index) => (
            <div key={index} className={`alert ${alert.type}`}>
              <AlertCircle className="alert-icon" />
              {alert.message}
            </div>
          ))}
        </div>
      )}

      {/* Time Info and Break Section */}
      {clockState.status === 'IN' && (
        <div className="time-tracking-section">
          <div className="time-info">
            <div className="info-item elapsed-time">
              <div className="info-label">Time Worked</div>
              <div className="info-value">{formatTime(clockState.elapsedTime)}</div>
            </div>
            <div className="info-item break-time">
              <div className="info-label">Break Time</div>
              <div className="info-value">{formatTime(clockState.totalBreakTime)}</div>
            </div>
          </div>

          <button
            className={`break-button ${clockState.isOnBreak ? 'end-break' : 'start-break'}`}
            onClick={handleBreak}
            disabled={isLoading}
          >
            <Coffee className="break-icon" />
            {isLoading ? 'Processing...' : clockState.isOnBreak ? 'End Break' : 'Start Break'}
          </button>
        </div>
      )}

      {/* Notes Section */}
      <div className="notes-section">
        <button
          className="notes-toggle"
          onClick={() => setShowNotes(!showNotes)}
        >
          <BookOpen className="notes-icon" />
          {showNotes ? 'Hide Notes' : 'Add Shift Notes'}
        </button>

        {showNotes && (
          <textarea
            className="shift-notes"
            value={clockState.shiftNotes}
            onChange={handleNotesChange}
            placeholder="Add notes about your shift..."
            disabled={clockState.status === 'OUT'}
            rows="4"
          />
        )}
      </div>

      {/* Break History */}
      {clockState.breaks.length > 0 && (
        <div className="breaks-summary">
          <h3>Break History</h3>
          <div className="breaks-list">
            {clockState.breaks.map((breakItem, index) => (
              <div key={index} className="break-item">
                <div className="break-time-range">
                  {format(new Date(breakItem.start), 'HH:mm')} - {format(new Date(breakItem.end), 'HH:mm')}
                </div>
                <div className="break-duration">
                  {formatTime(breakItem.duration)}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Shift Summary */}
      <div className="shift-summary">
        {clockState.lastClockIn && (
          <div className="summary-item">
            <span className="summary-label">Started:</span>
            <span className="summary-value">
              {format(new Date(clockState.lastClockIn), 'hh:mm a')}
            </span>
          </div>
        )}
        {clockState.category !== 'regular' && (
          <div className="summary-item">
            <span className="summary-label">Category:</span>
            <span className="summary-value">
              {SHIFT_CATEGORIES.find(c => c.id === clockState.category)?.label}
            </span>
          </div>
        )}
        {clockState.shiftNotes && (
          <div className="summary-item notes">
            <span className="summary-label">Notes:</span>
            <span className="summary-value">{clockState.shiftNotes}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeClock;
