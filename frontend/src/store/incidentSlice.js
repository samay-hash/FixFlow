import { createSlice } from '@reduxjs/toolkit';

const incidentSlice = createSlice({
  name: 'incidents',
  initialState: {
    list: [],
    activeIncident: null,
    stats: { total: 0, open: 0, inProgress: 0, resolved: 0, critical: 0, avgMttrSeconds: 0 },
    loading: false,
    lastFetched: null,
  },
  reducers: {
    setIncidents: (state, action) => {
      state.list = action.payload;
      state.lastFetched = Date.now();
      state.loading = false;
    },
    setStats: (state, action) => { state.stats = action.payload; },
    setLoading: (state, action) => { state.loading = action.payload; },
    setActiveIncident: (state, action) => { state.activeIncident = action.payload; },
    // Socket.io: prepend new incident to list (real-time)
    addIncidentRealtime: (state, action) => {
      const exists = state.list.find(i => i._id === action.payload._id);
      if (!exists) {
        state.list = [action.payload, ...state.list];
        state.stats.open += 1;
        state.stats.total += 1;
        if (action.payload.severity === 'critical') state.stats.critical += 1;
      }
    },
    // Socket.io: update existing incident
    updateIncidentRealtime: (state, action) => {
      const idx = state.list.findIndex(i => i._id === action.payload._id);
      if (idx !== -1) state.list[idx] = { ...state.list[idx], ...action.payload };
      if (state.activeIncident?._id === action.payload._id) {
        state.activeIncident = { ...state.activeIncident, ...action.payload };
      }
    },
  },
});

export const { setIncidents, setStats, setLoading, setActiveIncident, addIncidentRealtime, updateIncidentRealtime } = incidentSlice.actions;
export default incidentSlice.reducer;
