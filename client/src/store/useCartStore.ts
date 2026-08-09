import { create } from "zustand";
import api from "../lib/api";
import { useAuthStore } from "./useAuthStore";

export interface CartLineItem {
  id: string;
  productId: string;
  quantity: number;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  stock: number;
  image?: string;
}

interface CartStore {
  items: CartLineItem[];
  isLoading: boolean;
  load: () => Promise<void>;
  addItem: (productId: string, quantity?: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  clearCart: () => void;
  mergeGuestCart: () => Promise<void>;
}

function sessionId() {
  const existing = localStorage.getItem("sessionId");
  if (existing) return existing;
  const id = crypto.randomUUID();
  localStorage.setItem("sessionId", id);
  return id;
}

export const useCartStore = create<CartStore>((set, get) => ({
  items: [],
  isLoading: false,
  load: async () => {
    const user = useAuthStore.getState().user;
    set({ isLoading: true });
    try {
      if (user) {
        const { data } = await api.get(`/cart/user/${user.id}`);
        set({ items: data.data?.items || [] });
      } else if (localStorage.getItem("sessionId")) {
        const { data } = await api.get(`/cart/${localStorage.getItem("sessionId")}`);
        set({ items: data.data?.items || [] });
      } else {
        set({ items: [] });
      }
    } catch {
      set({ items: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  addItem: async (productId, quantity = 1) => {
    const user = useAuthStore.getState().user;
    const body = user
      ? { productId, quantity, userId: user.id }
      : { productId, quantity, sessionId: sessionId() };
    await api.post("/cart/add", body);
    await get().load();
  },
  removeItem: async (productId) => {
    const user = useAuthStore.getState().user;
    const body = user
      ? { productId, userId: user.id }
      : { productId, sessionId: localStorage.getItem("sessionId") || sessionId() };
    await api.delete("/cart/remove", { data: body });
    await get().load();
  },
  updateQuantity: async (productId, quantity) => {
    const user = useAuthStore.getState().user;
    const body = user
      ? { productId, quantity, userId: user.id }
      : { productId, quantity, sessionId: localStorage.getItem("sessionId") || sessionId() };
    await api.patch("/cart/update", body);
    await get().load();
  },
  clearCart: () => set({ items: [] }),
  mergeGuestCart: async () => {
    const user = useAuthStore.getState().user;
    const sid = localStorage.getItem("sessionId");
    if (!user || !sid) return;
    try {
      await api.post("/cart/merge", { sessionId: sid, userId: user.id });
      localStorage.removeItem("sessionId");
      await get().load();
    } catch {
      await get().load();
    }
  },
}));

export const selectCartSummary = (items: CartLineItem[]) => {
  const count = items.reduce((sum, it) => sum + it.quantity, 0);
  const subtotal = items.reduce((sum, it) => sum + Number(it.discountPrice || it.price) * it.quantity, 0);
  return { count, subtotal };
};
