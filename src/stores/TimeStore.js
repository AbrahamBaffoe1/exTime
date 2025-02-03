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

  calculateFrequentTimes: (entries) => {
    const clockInTimes = [];
    const clockOutTimes = [];

    entries.forEach(day => {
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

    return {
      mostFrequentClockIn: getMostFrequent(clockInTimes),
      mostFrequentClockOut: getMostFrequent(clockOutTimes)
    };
  },

  fetchData: async (token) => {
    if (!token) {
      set({ loading: false, entries: [], authHistory: [] });
      return;
    }

    try {
      set({ loading: true });
      const filter = get().filter;

      // Fetch time entries
      const url = `http://localhost:3000/api/time-entries?filter=${filter}`;
      const response = await fetch(url, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        throw new Error('Failed to fetch time entries');
      }

      const responseData = await response.json();
      
      // Validate response format
      if (!responseData || !responseData.entries || !responseData.stats) {
        console.error('Invalid response format:', responseData);
        throw new Error('Invalid response format from server');
      }

      const { entries: data, stats } = responseData;

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
        return acc;
      }, {});

      // Convert to array and sort by date
      const sortedEntries = Object.values(groupedEntries).sort(
        (a, b) => parseISO(b.date) - parseISO(a.date)
      );

      // Fetch auth history
      const authUrl = `http://localhost:3000/api/auth-history?filter=${filter}`;
      const authResponse = await fetch(authUrl, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!authResponse.ok) {
        throw new Error('Failed to fetch auth history');
      }

      const authData = await authResponse.json();

      // Calculate frequent times
      const { mostFrequentClockIn, mostFrequentClockOut } = get().calculateFrequentTimes(sortedEntries);

      set({ 
        entries: sortedEntries, 
        authHistory: authData,
        summary: {
          totalHours: stats.totalHours.toFixed(2),
          averageHoursPerDay: stats.averageHoursPerDay.toFixed(2),
          daysWorked: stats.daysWorked,
          mostFrequentClockIn,
          mostFrequentClockOut
        }
      });
    } catch (error) {
      console.error('Error fetching data:', error);
      // Set default values on error
      set({ 
        entries: [], 
        authHistory: [],
        summary: {
          totalHours: '0.00',
          averageHoursPerDay: '0.00',
          daysWorked: 0,
          mostFrequentClockIn: 'N/A',
          mostFrequentClockOut: 'N/A'
        }
      });
    } finally {
      set({ loading: false });
    }
  }
}));

export default useTimeStore;
