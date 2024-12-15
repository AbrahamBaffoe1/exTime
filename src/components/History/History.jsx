import React, { useState, useEffect } from 'react';
import { format, parseISO, differenceInSeconds, startOfWeek, startOfMonth } from 'date-fns';
import { 
  Clock, 
  Download, 
  FileText, 
  FileSpreadsheet, 
  TrendingUp, 
  TrendingDown,
  Calendar,
  Clock3,
  Edit3,
  Save,
  X,
  MessageSquare
} from 'lucide-react';
import { useAuth } from '../AuthContext/AuthContext';
import './History.css';

const History = () => {
  const { token } = useAuth();
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('week');
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');
  const [summary, setSummary] = useState({
    totalHours: 0,
    averageHoursPerDay: 0,
    daysWorked: 0,
    mostFrequentClockIn: '',
    mostFrequentClockOut: ''
  });

  useEffect(() => {
    if (!token) {
      setLoading(false);
      return;
    }

    const fetchTimeEntries = async () => {
      try {
        let url = 'http://localhost:3000/api/time-entries';
        const now = new Date();

        // Add date filtering based on selected filter
        if (filter === 'week') {
          const weekStart = startOfWeek(now);
          url += `?after=${weekStart.toISOString()}`;
        } else if (filter === 'month') {
          const monthStart = startOfMonth(now);
          url += `?after=${monthStart.toISOString()}`;
        }

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (!response.ok) {
          throw new Error('Failed to fetch time entries');
        }

        const data = await response.json();

        // Group entries by date
        const groupedEntries = data.reduce((acc, entry) => {
          const date = format(parseISO(entry.timestamp), 'yyyy-MM-dd');
          
          if (!acc[date]) {
            acc[date] = {
              date,
              entries: [],
              totalHours: 0
            };
          }
          
          acc[date].entries.push(entry);
          
          // Calculate total hours for the day
          if (entry.action === 'OUT') {
            const clockIn = acc[date].entries.find(e => 
              e.action === 'IN' && 
              parseISO(e.timestamp) < parseISO(entry.timestamp)
            );
            
            if (clockIn) {
              const duration = differenceInSeconds(
                parseISO(entry.timestamp),
                parseISO(clockIn.timestamp)
              ) / 3600;
              acc[date].totalHours += duration;
            }
          }
          
          return acc;
        }, {});

        // Convert to array and sort by date
        const sortedEntries = Object.values(groupedEntries).sort(
          (a, b) => parseISO(b.date) - parseISO(a.date)
        );

        setEntries(sortedEntries);
        calculateSummary(sortedEntries);
      } catch (error) {
        console.error('Error fetching time entries:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchTimeEntries();
  }, [token, filter]);

  const handleEditNote = (entryId, currentNote) => {
    setEditingNote(entryId);
    setNoteText(currentNote || '');
  };

  const handleSaveNote = async (entryId) => {
    try {
      const response = await fetch(`http://localhost:3000/api/time-entries/${entryId}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ notes: noteText })
      });

      if (!response.ok) {
        throw new Error('Failed to save note');
      }

      // Update local state
      setEntries(entries.map(day => ({
        ...day,
        entries: day.entries.map(entry => 
          entry.id === entryId 
            ? { ...entry, note: noteText }
            : entry
        )
      })));

      setEditingNote(null);
      setNoteText('');
    } catch (error) {
      console.error('Error saving note:', error);
    }
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

  const exportData = (exportFormat) => {
    // Create a more detailed export format
    const formattedData = entries.map(day => {
      const dailyData = {
        date: format(parseISO(day.date), 'MMMM d, yyyy'),
        totalHours: formatDuration(day.totalHours),
        entries: day.entries.map(entry => ({
          time: format(parseISO(entry.timestamp), 'HH:mm'),
          action: entry.action,
          category: entry.category || 'regular',
          note: entry.note || ''
        }))
      };

      // Calculate durations for each clock-in/out pair
      let lastClockIn = null;
      dailyData.entries.forEach((entry, index) => {
        if (entry.action === 'IN') {
          lastClockIn = entry;
        } else if (entry.action === 'OUT' && lastClockIn) {
          const duration = differenceInSeconds(
            parseISO(entry.timestamp),
            parseISO(lastClockIn.timestamp)
          ) / 3600;
          entry.duration = formatDuration(duration);
          lastClockIn = null;
        }
      });

      return dailyData;
    });

    let content = '';

    if (exportFormat === 'csv') {
      // CSV Header
      content = 'Date,Time,Action,Category,Duration,Notes\n';
      
      // CSV Data
      formattedData.forEach(day => {
        day.entries.forEach(entry => {
          content += `${day.date},${entry.time},${entry.action},${entry.category},${entry.duration || ''},${entry.note.replace(/"/g, '""')}\n`;
        });
        // Add a blank line between days for readability
        content += '\n';
      });
    } else {
      // Text Format
      formattedData.forEach(day => {
        content += `\n=== ${day.date} ===\n`;
        content += `Total Hours: ${day.totalHours}\n\n`;
        
        day.entries.forEach(entry => {
          content += `${entry.time} - ${entry.action}`;
          if (entry.category !== 'regular') {
            content += ` (${entry.category})`;
          }
          if (entry.duration) {
            content += ` - Duration: ${entry.duration}`;
          }
          content += '\n';
          if (entry.note) {
            content += `Note: ${entry.note}\n`;
          }
          content += '\n';
        });
        content += '----------------------------------------\n';
      });

      // Add summary at the end
      content += '\nSUMMARY\n';
      content += `Total Days Worked: ${summary.daysWorked}\n`;
      content += `Total Hours: ${formatDuration(parseFloat(summary.totalHours))}\n`;
      content += `Average Hours per Day: ${formatDuration(parseFloat(summary.averageHoursPerDay))}\n`;
      content += `Typical Schedule: ${summary.mostFrequentClockIn} - ${summary.mostFrequentClockOut}\n`;
    }

    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `timesheet-${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
    a.click();
    URL.revokeObjectURL(url);
    setShowExportMenu(false);
  };

  if (!token) {
    return (
      <div className="history-container">
        <div className="login-prompt">
          <Clock size={64} className="text-primary-600" />
          <h2>Please log in to view your time history</h2>
          <p>Track your time and view detailed reports</p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="history-container">
        <div className="loading">
          <Clock size={48} className="text-primary-600 animate-spin" />
          <p>Loading your time entries...</p>
        </div>
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="history-container">
        <div className="no-entries-prompt">
          <Clock size={64} className="text-primary-600" />
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
          <Clock size={36} className="text-primary-600" />
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
              onBlur={() => setTimeout(() => setShowExportMenu(false), 200)}
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
            <Clock3 size={24} className="text-primary-500" />
            {summary.mostFrequentClockIn} - {summary.mostFrequentClockOut}
          </div>
        </div>
      </div>

      <div className="history-entries">
        {entries.map((day) => (
          <div key={day.date} className="day-entry">
            <div className="day-header">
              <h2>
                <Calendar size={20} className="inline-block mr-2 text-primary-500" />
                {format(parseISO(day.date), 'EEEE, MMMM d')}
              </h2>
              <span className="total-hours">
                <Clock3 size={16} className="inline-block mr-1" />
                Total: {formatDuration(day.totalHours)}
              </span>
            </div>
            <div className="entries-table">
              <div className="table-header">
                <div>Time</div>
                <div>Action</div>
                <div>Duration</div>
                <div>Notes</div>
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
                    <div className="note-cell">
                      {editingNote === entry.id ? (
                        <div className="note-edit">
                          <textarea
                            value={noteText}
                            onChange={(e) => setNoteText(e.target.value)}
                            placeholder="Add a note..."
                            className="note-textarea"
                          />
                          <div className="note-actions">
                            <button
                              className="note-button save"
                              onClick={() => handleSaveNote(entry.id)}
                            >
                              <Save size={16} />
                            </button>
                            <button
                              className="note-button cancel"
                              onClick={() => setEditingNote(null)}
                            >
                              <X size={16} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <div className="note-display">
                          {entry.note ? (
                            <>
                              <MessageSquare size={16} className="note-icon" />
                              <span className="note-text">{entry.note}</span>
                            </>
                          ) : null}
                          <button
                            className="edit-note-button"
                            onClick={() => handleEditNote(entry.id, entry.note)}
                          >
                            <Edit3 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
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
