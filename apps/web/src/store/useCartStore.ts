import { create } from "zustand";
import api from "../lib/api";

interface CartItem {
  id: string;
  productId: string;
  quantity: number;
}

interface CartStore {
  items: CartItem[];
  isOpen: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  toggleCart: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isOpen: false,
  addItem: async (productId, quantity = 1) => {
    const sessionId = localStorage.getItem("sessionId") || crypto.randomUUID();
    localStorage.setItem("sessionId", sessionId);
    await api.post("/cart/add", { productId, quantity, sessionId });
    const { data } = await api.get(`/cart/${sessionId}`);
    set({ items: data.items || [] });
  },
  removeItem: async (productId) => {
    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) return;
    await api.delete("/cart/remove", { data: { productId, sessionId } });
    const { data } = await api.get(`/cart/${sessionId}`);
    set({ items: data.items || [] });
  },
  updateQuantity: async (productId, quantity) => {
    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) return;
    await api.patch("/cart/update", { productId, quantity, sessionId });
  },
  toggleCart: () => set((s) => ({ isOpen: !s.isOpen })),
  clearCart: () => set({ items: [] }),
}));
