import { create } from 'zustand';
import { login as apiLogin } from '../api/users';

interface AuthState {
  user: { email: string } | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
}

export const useAuth = create<AuthState>((set) => ({
  user: null,
  login: async (email, password) => {
    const { token } = await apiLogin(email, password);
    localStorage.setItem('token', token);
    set({ user: { email } });
  },
  logout: () => {
    localStorage.removeItem('token');
    set({ user: null });
  }
}));