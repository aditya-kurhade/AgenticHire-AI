import { create } from 'zustand';
import api from '../lib/api';

const getInitialUser = () => {
  try {
    const userString = localStorage.getItem('agentichire_user');
    return userString ? JSON.parse(userString) : null;
  } catch (err) {
    console.error('Error reading user from localStorage:', err);
    return null;
  }
};

export const useAuthStore = create((set) => ({
  user: getInitialUser(),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/login', { email, password });
      const userData = response.data.data;
      
      localStorage.setItem('agentichire_user', JSON.stringify(userData));
      set({ user: userData, loading: false });
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Login failed. Please try again.';
      set({ error: errorMsg, loading: false });
      return false;
    }
  },

  signup: async (name, email, password) => {
    set({ loading: true, error: null });
    try {
      const response = await api.post('/auth/signup', { name, email, password });
      const userData = response.data.data;
      
      localStorage.setItem('agentichire_user', JSON.stringify(userData));
      set({ user: userData, loading: false });
      return true;
    } catch (err) {
      const errorMsg = err.response?.data?.error || 'Signup failed. Please try again.';
      set({ error: errorMsg, loading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('agentichire_user');
    set({ user: null, error: null });
  },

  clearError: () => set({ error: null })
}));
