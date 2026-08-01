import { create } from "zustand";
import api from "../lib/api";

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  role: string;
  isActive: boolean;
  tokenVersion: number;
  twoFactorEnabled: boolean;
  phone?: string | null;
  avatar?: string | null;
  createdAt: string;
}

interface AuthStore {
  user: AuthUser | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, name: string, password: string) => Promise<void>;
  logout: () => void;
  logoutAll: () => Promise<void>;
  checkAuth: () => Promise<void>;
  updateUser: (user: Partial<AuthUser>) => void;
  fetchProfile: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
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
  logoutAll: async () => {
    await api.post("/auth/logout-all");
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
  updateUser: (patch) => {
    const current = get().user;
    if (current) set({ user: { ...current, ...patch } });
  },
  fetchProfile: async () => {
    const { data } = await api.get("/profile");
    const u = data.data?.user;
    if (u) set({ user: u });
  },
  changePassword: async (currentPassword, newPassword) => {
    await api.put("/profile/password", { currentPassword, newPassword });
  },
}));
