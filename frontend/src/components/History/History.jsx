import React, { useState, useEffect } from 'react';
import { format, parseISO, differenceInSeconds } from 'date-fns';
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
  MessageSquare,
  FileType
} from 'lucide-react';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useAuth } from '../AuthContext/AuthContext';
import useTimeStore from '../../stores/timeStore';
import './History.css';

const History = () => {
  const { token } = useAuth();
  const { entries, authHistory, loading, filter, summary, setFilter, setToken } = useTimeStore();
  const [showExportMenu, setShowExportMenu] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    if (token) {
      setToken(token);
    }
  }, [token, setToken]);

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

      // Refresh data after saving note
      setToken(token);
      setEditingNote(null);
      setNoteText('');
    } catch (error) {
      console.error('Error saving note:', error);
    }
  };

  const formatDuration = (hours) => {
    const h = Math.floor(hours);
    const m = Math.round((hours - h) * 60);
    return `${h}h ${m}m`;
  };

  const exportData = async (exportFormat) => {
    // Create a more detailed export format
    const formattedData = entries.map(day => {
      if (!day || !day.date) return null;
      
      const dailyData = {
        date: format(parseISO(day.date), 'MMMM d, yyyy'),
        totalHours: formatDuration(day.totalHours || 0),
        entries: day.entries
          .filter(entry => entry && entry.timestamp)
          .map(entry => ({
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
          try {
            const duration = differenceInSeconds(
              parseISO(entry.timestamp),
              parseISO(lastClockIn.timestamp)
            ) / 3600;
            entry.duration = formatDuration(duration);
          } catch (error) {
            console.error('Error calculating duration:', error);
            entry.duration = '0h 0m';
          }
          lastClockIn = null;
        }
      });

      return dailyData;
    }).filter(Boolean);

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

    if (exportFormat === 'pdf') {
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Time History Report', 15, 15);
      doc.setFontSize(12);
      doc.text(`Generated on: ${format(new Date(), 'MMMM d, yyyy')}`, 15, 25);

      // Add summary section
      doc.setFontSize(16);
      doc.text('Summary', 15, 40);
      doc.setFontSize(12);
      doc.text(`Total Hours: ${formatDuration(summary.totalHours)}`, 20, 50);
      doc.text(`Average Daily Hours: ${formatDuration(summary.averageHoursPerDay)}`, 20, 57);
      doc.text(`Days Worked: ${summary.daysWorked}`, 20, 64);
      doc.text(`Typical Schedule: ${summary.mostFrequentClockIn} - ${summary.mostFrequentClockOut}`, 20, 71);

      // Prepare data for table
      const tableData = [];
      entries.forEach(day => {
        if (day && day.date && day.entries) {
          day.entries.forEach(entry => {
            if (entry && entry.timestamp) {
              try {
                tableData.push([
                  format(parseISO(day.date), 'MMM d, yyyy'),
                  format(parseISO(entry.timestamp), 'HH:mm'),
                  entry.action,
                  entry.category || 'regular',
                  entry.note || ''
                ]);
              } catch (error) {
                console.error('Error formatting table data:', error);
              }
            }
          });
        }
      });

      // Add table
      doc.autoTable({
        startY: 80,
        head: [['Date', 'Time', 'Action', 'Category', 'Notes']],
        body: tableData,
        theme: 'grid',
        styles: { fontSize: 10 },
        headStyles: { fillColor: [41, 128, 185] },
        alternateRowStyles: { fillColor: [245, 245, 245] }
      });

      doc.save(`timesheet-${format(new Date(), 'yyyy-MM-dd')}.pdf`);
    } else {
      const blob = new Blob([content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `timesheet-${format(new Date(), 'yyyy-MM-dd')}.${exportFormat}`;
      a.click();
      URL.revokeObjectURL(url);
    }
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
                <div className="download-option" onClick={() => exportData('pdf')}>
                  <FileType size={18} />
                  Export as PDF
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

      <div className="auth-history">
        <h2 className="section-title">
          <Clock size={24} className="text-primary-600" />
          Login/Logout History
        </h2>
        <div className="auth-entries">
          {authHistory.map((entry, index) => (
            <div key={index} className="auth-entry">
              <div className={`status-badge ${entry.type.toLowerCase()}`}>
                <span className="status-dot"></span>
                {entry.type}
              </div>
              <div className="timestamp">
                {format(parseISO(entry.timestamp), 'MMM d, yyyy HH:mm')}
              </div>
            </div>
          ))}
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
