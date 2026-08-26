import { create } from 'zustand';
import api from '../services/api';
import { getSocket } from '../services/socket';

export const useAuthStore = create((set, get) => ({
  user: null,
  token: null,
  isAuthenticated: false,
  isLoading: true,
  error: null,

  // Hydrate auth state from localStorage
  initAuth: async () => {
    if (typeof window === 'undefined') return;
    const token = localStorage.getItem('agentflow_token');
    const userStr = localStorage.getItem('agentflow_user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        set({ user, token, isAuthenticated: true, isLoading: false });

        // Connect socket user room
        const socket = getSocket();
        if (socket && user.id) {
          socket.emit('join:user', user.id);
        }

        // Fetch fresh profile in background
        const res = await api.get('/auth/me');
        if (res.data?.data?.user) {
          set({ user: res.data.data.user });
          localStorage.setItem('agentflow_user', JSON.stringify(res.data.data.user));
        }
      } catch (err) {
        localStorage.removeItem('agentflow_token');
        localStorage.removeItem('agentflow_user');
        set({ user: null, token: null, isAuthenticated: false, isLoading: false });
      }
    } else {
      set({ user: null, token: null, isAuthenticated: false, isLoading: false });
    }
  },

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/login', { email, password });
      const { user, token } = res.data.data;

      localStorage.setItem('agentflow_token', token);
      localStorage.setItem('agentflow_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false, error: null });

      const socket = getSocket();
      if (socket && user.id) {
        socket.emit('join:user', user.id);
      }

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || err.message || 'Login failed';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  register: async (name, email, password, role = 'operator') => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.post('/auth/register', { name, email, password, role });
      const { user, token } = res.data.data;

      localStorage.setItem('agentflow_token', token);
      localStorage.setItem('agentflow_user', JSON.stringify(user));

      set({ user, token, isAuthenticated: true, isLoading: false, error: null });

      const socket = getSocket();
      if (socket && user.id) {
        socket.emit('join:user', user.id);
      }

      return { success: true };
    } catch (err) {
      const message = err.response?.data?.error?.message || err.message || 'Registration failed';
      set({ isLoading: false, error: message });
      return { success: false, error: message };
    }
  },

  logout: () => {
    localStorage.removeItem('agentflow_token');
    localStorage.removeItem('agentflow_user');
    set({ user: null, token: null, isAuthenticated: false, error: null });
  },

  clearError: () => set({ error: null })
}));
