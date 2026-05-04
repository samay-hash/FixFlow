import { useCallback, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import apiClient from '../api/client';
import { setCredentials, logout as logoutAction } from '../store/authSlice';
import { useAppDispatch, useAppSelector } from '../store/hooks';

interface LoginCredentials {
  email: string;
  password: string;
}

interface RegisterForm {
  name: string;
  email: string;
  password: string;
  companyName: string;
  category: string;
  preferences: string;
}

type ApiError = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

export function useAuth() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { user, company, isAuthenticated } = useAppSelector((state) => state.auth);

  const login = useCallback(
    async (credentials: LoginCredentials) => {
      setLoading(true);
      try {
        const { data } = await apiClient.post('/auth/login', credentials);
        dispatch(setCredentials({ user: data.user, token: data.token, company: data.company }));
        toast.success(`Welcome back, ${data.user.name}!`);
        navigate('/dashboard');
      } catch (err) {
        toast.error((err as ApiError).response?.data?.message || 'Login failed');
      } finally {
        setLoading(false);
      }
    },
    [dispatch, navigate],
  );

  const register = useCallback(
    async (form: RegisterForm) => {
      setLoading(true);
      try {
        const payload = {
          ...form,
          preferences: form.preferences
            .split(',')
            .map((item) => item.trim())
            .filter(Boolean),
        };
        const { data } = await apiClient.post('/auth/register', payload);
        dispatch(setCredentials({ user: data.user, token: data.token, company: data.company }));
        toast.success(`Workspace "${data.company.name}" created!`);
        navigate('/dashboard');
      } catch (err) {
        toast.error((err as ApiError).response?.data?.message || 'Registration failed');
      } finally {
        setLoading(false);
      }
    },
    [dispatch, navigate],
  );

  const logout = useCallback(() => {
    dispatch(logoutAction());
    navigate('/login');
  }, [dispatch, navigate]);

  return { user, company, isAuthenticated, loading, login, register, logout };
}
