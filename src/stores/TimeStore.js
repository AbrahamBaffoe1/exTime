import { create } from 'zustand';
import { format, parseISO, differenceInSeconds, startOfWeek, startOfMonth } from 'date-fns';

const useTimeStore = create((set, get) => ({
  entries: [],
  authHistory: [],
  loading: true,
  filter: 'week',
  token: null,
  summary: {
    totalHours: 0,
    averageHoursPerDay: 0,
    daysWorked: 0,
    mostFrequentClockIn: '',
    mostFrequentClockOut: ''
  },

  setFilter: (filter) => {
    set({ filter });
    const state = get();
    if (state.token) {
      state.fetchData(state.token);
    }
  },

  setToken: (token) => {
    set({ token });
    if (token) {
      get().fetchData(token);
    }
  },

  calculateSummary: (entries) => {
    let totalHours = 0;
    const clockInTimes = [];
    const clockOutTimes = [];

    entries.forEach(day => {
      totalHours += day.totalHours;
      
      day.entries.forEach(entry => {
        const time = format(parseISO(entry.timestamp), 'HH:mm');
        if (entry.action === 'IN') clockInTimes.push(time);
        if (entry.action === 'OUT') clockOutTimes.push(time);
      });
    });

    const getMostFrequent = (arr) => {
      if (!arr.length) return 'N/A';
      const frequency = arr.reduce((acc, val) => {
        acc[val] = (acc[val] || 0) + 1;
        return acc;
      }, {});
      return Object.entries(frequency)
        .sort((a, b) => b[1] - a[1])[0][0];
    };

    set({
      summary: {
        totalHours: totalHours.toFixed(2),
        averageHoursPerDay: entries.length > 0 
          ? (totalHours / entries.length).toFixed(2) 
          : '0.00',
        daysWorked: entries.length,
        mostFrequentClockIn: getMostFrequent(clockInTimes),
        mostFrequentClockOut: getMostFrequent(clockOutTimes)
      }
    });
  },

  fetchData: async (token) => {
    if (!token) {
      set({ loading: false, entries: [], authHistory: [] });
      return;
    }

    try {
      set({ loading: true, token });
      const filter = get().filter;
      const now = new Date();

      // Fetch time entries
      let url = 'http://localhost:3000/api/time-entries';
      if (filter === 'week') {
        url += `?after=${startOfWeek(now).toISOString()}`;
      } else if (filter === 'month') {
        url += `?after=${startOfMonth(now).toISOString()}`;
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

      // Fetch auth history
      const authUrl = 'http://localhost:3000/api/auth-history';
      const authResponse = await fetch(authUrl + (filter === 'week' ? `?after=${startOfWeek(now).toISOString()}` : 
                                               filter === 'month' ? `?after=${startOfMonth(now).toISOString()}` : ''), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!authResponse.ok) {
        throw new Error('Failed to fetch auth history');
      }

      const authData = await authResponse.json();

      set({ entries: sortedEntries, authHistory: authData });
      get().calculateSummary(sortedEntries);
    } catch (error) {
      console.error('Error fetching data:', error);
    } finally {
      set({ loading: false });
    }
  }
}));

export default useTimeStore;
