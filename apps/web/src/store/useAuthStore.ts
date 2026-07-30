import { create } from "zustand";
import api from "../lib/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: string;
}

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set) => ({
  user: null,
  isLoading: true,
  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("token", data.data.token);
    set({ user: data.data.user });
  },
  register: async (email, name, password) => {
    const { data } = await api.post("/auth/register", { email, name, password });
    localStorage.setItem("token", data.data.token);
    set({ user: data.data.user });
  },
  logout: () => {
    localStorage.removeItem("token");
    set({ user: null });
  },
  checkAuth: async () => {
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data.data, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },
}));
