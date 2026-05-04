import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Website } from '../../types';

interface SiteState {
  sites: Website[];
  loading: boolean;
}

const initialState: SiteState = {
  sites: [],
  loading: false,
};

const getSiteId = (site: Partial<Website> & { _id?: string; id?: string }) => site.id || site._id || '';

const siteSlice = createSlice({
  name: 'sites',
  initialState,
  reducers: {
    setSites: (state, action: PayloadAction<Website[]>) => {
      state.sites = action.payload;
    },
    updateSiteInList: (state, action: PayloadAction<Partial<Website> & { id?: string; _id?: string }>) => {
      const nextId = getSiteId(action.payload);
      const index = state.sites.findIndex((site) => getSiteId(site as Website & { _id?: string }) === nextId);
      if (index !== -1) {
        state.sites[index] = { ...state.sites[index], ...action.payload } as Website;
      }
    },
    addSite: (state, action: PayloadAction<Website>) => {
      state.sites = [action.payload, ...state.sites];
    },
    removeSite: (state, action: PayloadAction<string>) => {
      state.sites = state.sites.filter((site) => getSiteId(site as Website & { _id?: string }) !== action.payload);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setSites, updateSiteInList, addSite, removeSite, setLoading } = siteSlice.actions;
export default siteSlice.reducer;
