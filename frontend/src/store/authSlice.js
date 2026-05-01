import { createSlice } from '@reduxjs/toolkit';

const stored = localStorage.getItem('simrs_user');
const storedToken = localStorage.getItem('simrs_token');

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: stored ? JSON.parse(stored) : null,
    token: storedToken || null,
    company: null,
    isAuthenticated: !!storedToken,
  },
  reducers: {
    setCredentials: (state, action) => {
      const { user, token, company } = action.payload;
      state.user = user;
      state.token = token;
      state.company = company;
      state.isAuthenticated = true;
      localStorage.setItem('simrs_token', token);
      localStorage.setItem('simrs_user', JSON.stringify(user));
    },
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.company = null;
      state.isAuthenticated = false;
      localStorage.removeItem('simrs_token');
      localStorage.removeItem('simrs_user');
    },
    updateUser: (state, action) => {
      state.user = { ...state.user, ...action.payload };
      localStorage.setItem('simrs_user', JSON.stringify(state.user));
    },
  },
});

export const { setCredentials, logout, updateUser } = authSlice.actions;
export default authSlice.reducer;
