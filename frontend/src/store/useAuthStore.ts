import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User } from '../types';
import { authAPI } from '../lib/api';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  
  login: (username: string, password: string) => Promise<void>;
  register: (username: string, password: string, nickname?: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false,

      login: async (username: string, password: string) => {
        set({ isLoading: true });
        try {
          const result = await authAPI.login(username, password) as any;
          localStorage.setItem('chat_token', result.token);
          set({
            user: result.user,
            token: result.token,
            isAuthenticated: true,
            isLoading: false
          });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      register: async (username: string, password: string, nickname?: string) => {
        set({ isLoading: true });
        try {
          await authAPI.register(username, password, nickname);
          set({ isLoading: false });
        } catch (error: any) {
          set({ isLoading: false });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('chat_token');
        set({
          user: null,
          token: null,
          isAuthenticated: false
        });
      },

      checkAuth: async () => {
        const token = get().token;
        if (!token) {
          return;
        }
        
        try {
          const result = await authAPI.getMe() as any;
          set({ user: result.user, isAuthenticated: true });
        } catch {
          localStorage.removeItem('chat_token');
          set({
            user: null,
            token: null,
            isAuthenticated: false
          });
        }
      }
    }),
    {
      name: 'chat-auth-storage',
      partialize: (state) => ({ token: state.token })
    }
  )
);
