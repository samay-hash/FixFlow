import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Company, User } from '../../types';

interface AuthState {
  user: User | null;
  company: Company | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const storedUser = localStorage.getItem('simrs_user');
const storedCompany = localStorage.getItem('simrs_company');
const storedToken = localStorage.getItem('simrs_token');

const initialState: AuthState = {
  user: storedUser ? JSON.parse(storedUser) : null,
  company: storedCompany ? JSON.parse(storedCompany) : null,
  token: storedToken,
  isAuthenticated: !!storedToken,
  loading: false,
};

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action: PayloadAction<{ user: User; company: Company; token: string }>) => {
      const { user, company, token } = action.payload;
      state.user = user;
      state.company = company;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('simrs_token', token);
      localStorage.setItem('simrs_user', JSON.stringify(user));
      localStorage.setItem('simrs_company', JSON.stringify(company));
    },
    setAuth: (state, action: PayloadAction<{ user: User; company: Company; token: string }>) => {
      const { user, company, token } = action.payload;
      state.user = user;
      state.company = company;
      state.token = token;
      state.isAuthenticated = true;
      localStorage.setItem('simrs_token', token);
      localStorage.setItem('simrs_user', JSON.stringify(user));
      localStorage.setItem('simrs_company', JSON.stringify(company));
    },
    logout: (state) => {
      state.user = null;
      state.company = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('simrs_token');
      localStorage.removeItem('simrs_user');
      localStorage.removeItem('simrs_company');
    },
    updateUser: (state, action: PayloadAction<Partial<User>>) => {
      state.user = state.user ? { ...state.user, ...action.payload } : null;
      if (state.user) localStorage.setItem('simrs_user', JSON.stringify(state.user));
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const { setAuth, setCredentials, logout, updateUser, setLoading } = authSlice.actions;
export default authSlice.reducer;
