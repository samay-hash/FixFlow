import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Incident } from '../../types';

interface IncidentStats {
  total: number;
  open: number;
  inProgress: number;
  resolved: number;
  critical: number;
  avgMttrSeconds: number;
}

interface IncidentState {
  incidents: Incident[];
  list: Incident[];
  currentIncident: Incident | null;
  activeIncident: Incident | null;
  stats: IncidentStats;
  loading: boolean;
  error: string | null;
  lastFetched: number | null;
}

const initialStats: IncidentStats = {
  total: 0,
  open: 0,
  inProgress: 0,
  resolved: 0,
  critical: 0,
  avgMttrSeconds: 0,
};

const initialState: IncidentState = {
  incidents: [],
  list: [],
  currentIncident: null,
  activeIncident: null,
  stats: initialStats,
  loading: false,
  error: null,
  lastFetched: null,
};

const getIncidentId = (incident: Partial<Incident> & { _id?: string; id?: string }) => incident.id || incident._id || '';

const incidentSlice = createSlice({
  name: 'incidents',
  initialState,
  reducers: {
    setIncidents: (state, action: PayloadAction<Incident[]>) => {
      state.incidents = action.payload;
      state.list = action.payload;
      state.lastFetched = Date.now();
      state.loading = false;
      state.error = null;
    },
    setStats: (state, action: PayloadAction<IncidentStats>) => {
      state.stats = { ...initialStats, ...action.payload };
    },
    setCurrentIncident: (state, action: PayloadAction<Incident | null>) => {
      state.currentIncident = action.payload;
      state.activeIncident = action.payload;
    },
    setActiveIncident: (state, action: PayloadAction<Incident | null>) => {
      state.currentIncident = action.payload;
      state.activeIncident = action.payload;
    },
    addIncident: (state, action: PayloadAction<Incident>) => {
      const id = getIncidentId(action.payload as Incident & { _id?: string });
      const exists = state.incidents.some((incident) => getIncidentId(incident as Incident & { _id?: string }) === id);
      if (!exists) {
        state.incidents.unshift(action.payload);
        state.list.unshift(action.payload);
      }
    },
    addIncidentRealtime: (state, action: PayloadAction<Incident>) => {
      const id = getIncidentId(action.payload as Incident & { _id?: string });
      const exists = state.incidents.some((incident) => getIncidentId(incident as Incident & { _id?: string }) === id);
      if (!exists) {
        state.incidents.unshift(action.payload);
        state.list.unshift(action.payload);
        state.stats.open += 1;
        state.stats.total += 1;
        if (action.payload.severity === 'critical') state.stats.critical += 1;
      }
    },
    updateIncidentInList: (state, action: PayloadAction<Incident>) => {
      const id = getIncidentId(action.payload as Incident & { _id?: string });
      const updateOne = (items: Incident[]) => {
        const index = items.findIndex((incident) => getIncidentId(incident as Incident & { _id?: string }) === id);
        if (index !== -1) items[index] = { ...items[index], ...action.payload };
      };
      updateOne(state.incidents);
      updateOne(state.list);
      if (state.currentIncident && getIncidentId(state.currentIncident as Incident & { _id?: string }) === id) {
        state.currentIncident = { ...state.currentIncident, ...action.payload };
        state.activeIncident = state.currentIncident;
      }
    },
    updateIncidentRealtime: (state, action: PayloadAction<Incident>) => {
      const id = getIncidentId(action.payload as Incident & { _id?: string });
      const updateOne = (items: Incident[]) => {
        const index = items.findIndex((incident) => getIncidentId(incident as Incident & { _id?: string }) === id);
        if (index !== -1) items[index] = { ...items[index], ...action.payload };
      };
      updateOne(state.incidents);
      updateOne(state.list);
      if (state.currentIncident && getIncidentId(state.currentIncident as Incident & { _id?: string }) === id) {
        state.currentIncident = { ...state.currentIncident, ...action.payload };
        state.activeIncident = state.currentIncident;
      }
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
    },
  },
});

export const {
  setIncidents,
  setStats,
  setCurrentIncident,
  setActiveIncident,
  addIncident,
  addIncidentRealtime,
  updateIncidentInList,
  updateIncidentRealtime,
  setLoading,
  setError,
} = incidentSlice.actions;

export default incidentSlice.reducer;
