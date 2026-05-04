import { configureStore } from '@reduxjs/toolkit';
import authReducer from './slices/authSlice';
import incidentReducer from './slices/incidentSlice';
import siteReducer from './slices/siteSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    incidents: incidentReducer,
    sites: siteReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: { ignoredActions: ['auth/setCredentials', 'auth/setAuth'] } }),
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

export default store;
