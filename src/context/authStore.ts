import { create } from 'zustand';
import type { User } from '../types';
import * as authApi from '../api/auth';
import { getAccessToken } from '../api/client';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name?: string) => Promise<void>;
  logout: () => Promise<void>;
  loadUser: () => Promise<void>;
  setUser: (user: User | null) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isLoading: true,
  isAuthenticated: false,

  login: async (email, password) => {
    const res = await authApi.login(email, password);
    set({
      user: res.user ?? null,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  register: async (email, password, name) => {
    const res = await authApi.register(email, password, name);
    set({
      user: res.user ?? null,
      isAuthenticated: true,
      isLoading: false,
    });
  },

  logout: async () => {
    await authApi.logout();
    set({ user: null, isAuthenticated: false, isLoading: false });
  },

  loadUser: async () => {
    try {
      const token = await getAccessToken();
      if (!token) {
        set({ user: null, isAuthenticated: false, isLoading: false });
        return;
      }
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },

  setUser: (user) => set({ user, isAuthenticated: !!user }),
}));
