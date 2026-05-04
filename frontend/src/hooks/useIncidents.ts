import { useCallback } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { setIncidents, setCurrentIncident, setLoading, setError } from '../store/slices/incidentSlice';
import apiClient from '../api/client';
import toast from 'react-hot-toast';

export const useIncidents = () => {
  const dispatch = useAppDispatch();
  const { incidents, currentIncident, loading, error } = useAppSelector((state) => state.incidents);

  const fetchIncidents = useCallback(async (params?: any) => {
    dispatch(setLoading(true));
    try {
      const { data } = await apiClient.get('/incidents', { params });
      dispatch(setIncidents(data.incidents));
    } catch (err: any) {
      const msg = err.response?.data?.message || 'Failed to fetch incidents';
      dispatch(setError(msg));
      toast.error(msg);
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const fetchIncidentById = useCallback(async (id: string) => {
    dispatch(setLoading(true));
    try {
      const { data } = await apiClient.get(`/incidents/${id}`);
      dispatch(setCurrentIncident(data.incident));
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to fetch incident');
    } finally {
      dispatch(setLoading(false));
    }
  }, [dispatch]);

  const createIncident = async (formData: any) => {
    try {
      const { data } = await apiClient.post('/incidents', formData);
      toast.success('Incident reported successfully');
      return data.incident;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create incident');
      throw err;
    }
  };

  const updateIncident = async (id: string, updates: any) => {
    try {
      const { data } = await apiClient.put(`/incidents/${id}`, updates);
      toast.success('Incident updated');
      return data.incident;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Update failed');
      throw err;
    }
  };

  const addTimelineUpdate = async (id: string, entry: any) => {
    try {
      await apiClient.post(`/incidents/${id}/timeline`, entry);
      toast.success('Update added to timeline');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add update');
    }
  };

  return {
    incidents,
    currentIncident,
    loading,
    error,
    fetchIncidents,
    fetchIncidentById,
    createIncident,
    updateIncident,
    addTimelineUpdate,
  };
};
