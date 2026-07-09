import { create } from "zustand";
import axios from "axios";

interface User {
  id: string;
  email: string;
}

interface AuthState {
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkMe: () => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  token: localStorage.getItem("membrain_token"),
  user: null,
  isAuthenticated: !!localStorage.getItem("membrain_token"),
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post("/api/auth/login", { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem("membrain_token", token);
      set({ token, user, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Login failed. Please check your credentials.";
      set({ error: errorMsg, isLoading: false, isAuthenticated: false });
      return false;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.post("/api/auth/register", { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem("membrain_token", token);
      set({ token, user, isAuthenticated: true, isLoading: false, error: null });
      return true;
    } catch (err: any) {
      const errorMsg = err.response?.data?.error || "Registration failed. Email might be in use.";
      set({ error: errorMsg, isLoading: false, isAuthenticated: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem("membrain_token");
    set({ token: null, user: null, isAuthenticated: false, error: null });
  },

  checkMe: async () => {
    const token = get().token;
    if (!token) {
      set({ isAuthenticated: false, isLoading: false });
      return;
    }

    set({ isLoading: true });
    try {
      const response = await axios.get("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem("membrain_token");
      set({ token: null, user: null, isAuthenticated: false, isLoading: false });
    }
  },

  clearError: () => set({ error: null })
}));

// Configure axios interceptor for requests automatically
axios.interceptors.request.use((config) => {
  const token = localStorage.getItem("membrain_token");
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
