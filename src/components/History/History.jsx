import React, { useState, useEffect } from 'react';
import { format, parseISO, differenceInSeconds } from 'date-fns';
import { Clock, Download, FileText, FileSpreadsheet, TrendingUp, TrendingDown } from 'lucide-react';
import { useAuth } from '../AuthContext/AuthContext';
import './History.css';

const History = () => {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [summary, setSummary] = useState({
    totalHours: 0,
    averageHoursPerDay: 0,
    daysWorked: 0,
    mostFrequentClockIn: '',
    mostFrequentClockOut: ''
  });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('week');
  const [showExportMenu, setShowExportMenu] = useState(false);

  const fetchEntries = async () => {
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await fetch(`http://localhost:3000/api/time-entries?filter=${filter}`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch entries');
      }

      const data = await response.json();
      const groupedEntries = groupEntriesByDate(data);
      setEntries(groupedEntries);
      calculateSummary(groupedEntries);
    } catch (error) {
      console.error('Error fetching entries:', error);
      // Handle error (e.g., show error message to user)
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEntries();
  }, [filter, token]);

  const groupEntriesByDate = (data) => {
    const grouped = {};
    let currentDay = null;
    let clockIn = null;

    data.forEach(entry => {
      const date = format(parseISO(entry.timestamp), 'yyyy-MM-dd');
      
      if (!grouped[date]) {
        grouped[date] = {
          date: date,
          entries: [],
          totalHours: 0,
          breaks: []
        };
      }

      grouped[date].entries.push(entry);

      if (entry.action === 'IN') {
        clockIn = entry.timestamp;
      } else if (entry.action === 'OUT' && clockIn) {
        const duration = differenceInSeconds(parseISO(entry.timestamp), parseISO(clockIn));
        grouped[date].totalHours += duration / 3600;
        clockIn = null;
      }
    });

    return Object.values(grouped);
  };

  const calculateSummary = (groupedEntries) => {
    let totalHours = 0;
    const clockInTimes = [];
    const clockOutTimes = [];

    groupedEntries.forEach(day => {
      totalHours += day.totalHours;
      
      day.entries.forEach(entry => {
        const time = format(parseISO(entry.timestamp), 'HH:mm');
        if (entry.action === 'IN') clockInTimes.push(time);
        if (entry.action === 'OUT') clockOutTimes.push(time);
      });
    });

    setSummary({
      totalHours: totalHours.toFixed(2),
      averageHoursPerDay: groupedEntries.length > 0 
        ? (totalHours / groupedEntries.length).toFixed(2) 
        : '0.00',
      daysWorked: groupedEntries.length,
      mostFrequentClockIn: getMostFrequent(clockInTimes),
      mostFrequentClockOut: getMostFrequent(clockOutTimes)
    });
  };

  const getMostFrequent = (arr) => {
    if (!arr.length) return 'N/A';
    const frequency = arr.reduce((acc, val) => {
      acc[val] = (acc[val] || 0) + 1;
      return acc;
    }, {});
    return Object.entries(frequency)
      .sort((a, b) => b[1] - a[1])[0][0];
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const exportData = (format) => {
    const formattedData = entries.map(day => ({
      date: day.date,
      totalHours: day.totalHours,
      entries: day.entries.map(entry => ({
        time: format(parseISO(entry.timestamp), 'HH:mm'),
        action: entry.action,
        duration: entry.duration || ''
      }))
    }));

    let content = format === 'csv' 
      ? 'Date,Time,Action,Duration\n' 
      : '';

    formattedData.forEach(day => {
      if (format === 'csv') {
        day.entries.forEach(entry => {
          content += `${day.date},${entry.time},${entry.action},${entry.duration}\n`;
        });
      } else {
        content += `\n=== ${day.date} ===\n`;
        content += `Total Hours: ${day.totalHours}\n\n`;
        day.entries.forEach(entry => {
          content += `${entry.time} - ${entry.action} ${entry.duration ? `(${entry.duration})` : ''}\n`;
        });
      }
    });

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `time-history.${format}`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  // If no token, show login prompt
  if (!token) {
    return (
      <div className="history-container">
        <div className="login-prompt">
          <Clock size={48} className="text-primary-600" />
          <h2>Please log in to view your time history</h2>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return <div className="loading">Loading your time entries...</div>;
  }

  // No entries state
  if (entries.length === 0) {
    return (
      <div className="history-container">
        <div className="no-entries-prompt">
          <Clock size={48} className="text-primary-600" />
          <h2>No time entries found</h2>
          <p>Start tracking your time to see your history</p>
        </div>
      </div>
    );
  }

  return (
    <div className="history-container">
      <div className="history-header">
        <div className="header-title">
          <Clock size={32} className="text-primary-600" />
          <h1>Time History</h1>
        </div>
        
        <div className="header-actions">
          <div className="filter-controls">
            <button
              className={`filter-button ${filter === 'week' ? 'active' : ''}`}
              onClick={() => setFilter('week')}
            >
              This Week
            </button>
            <button
              className={`filter-button ${filter === 'month' ? 'active' : ''}`}
              onClick={() => setFilter('month')}
            >
              This Month
            </button>
            <button
              className={`filter-button ${filter === 'all' ? 'active' : ''}`}
              onClick={() => setFilter('all')}
            >
              All Time
            </button>
          </div>

          <div className="export-container">
            <button
              className="export-button"
              onClick={() => setShowExportMenu(!showExportMenu)}
            >
              <Download size={20} />
              Export
            </button>

            {showExportMenu && (
              <div className="download-menu">
                <div className="download-option" onClick={() => exportData('csv')}>
                  <FileSpreadsheet size={18} />
                  Export as CSV
                </div>
                <div className="download-option" onClick={() => exportData('txt')}>
                  <FileText size={18} />
                  Export as Text
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="summary-cards">
        <div className="summary-card">
          <h3>Total Hours</h3>
          <div className="summary-value">
            {formatDuration(summary.totalHours)}
            <span className="trend up">
              <TrendingUp size={16} />
              8%
            </span>
          </div>
        </div>
        <div className="summary-card">
          <h3>Average Daily Hours</h3>
          <div className="summary-value">
            {formatDuration(summary.averageHoursPerDay)}
            <span className="trend up">
              <TrendingUp size={16} />
              5%
            </span>
          </div>
        </div>
        <div className="summary-card">
          <h3>Days Worked</h3>
          <div className="summary-value">
            {summary.daysWorked}
            <span className="trend down">
              <TrendingDown size={16} />
              2%
            </span>
          </div>
        </div>
        <div className="summary-card">
          <h3>Typical Schedule</h3>
          <div className="summary-value schedule">
            {summary.mostFrequentClockIn} - {summary.mostFrequentClockOut}
          </div>
        </div>
      </div>

      <div className="history-entries">
        {entries.map((day) => (
          <div key={day.date} className="day-entry">
            <div className="day-header">
              <h2>{format(parseISO(day.date), 'EEEE, MMMM d')}</h2>
              <span className="total-hours">
                Total: {formatDuration(day.totalHours)}
              </span>
            </div>
            <div className="entries-table">
              <div className="table-header">
                <div>Time</div>
                <div>Action</div>
                <div>Duration</div>
              </div>
              {day.entries.map((entry, index) => {
                const nextEntry = day.entries[index + 1];
                let duration = '';
                
                if (entry.action === 'IN' && nextEntry && nextEntry.action === 'OUT') {
                  const durationHours = differenceInSeconds(
                    parseISO(nextEntry.timestamp),
                    parseISO(entry.timestamp)
                  ) / 3600;
                  duration = formatDuration(durationHours);
                }

                return (
                  <div key={entry.id} className="table-row">
                    <div className="time-cell">{format(parseISO(entry.timestamp), 'HH:mm')}</div>
                    <div className={`status-badge ${entry.action.toLowerCase()}`}>
                      <span className="status-dot"></span>
                      {entry.action}
                    </div>
                    <div className="duration-cell">{duration}</div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default History;