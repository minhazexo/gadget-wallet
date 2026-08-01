import { create } from "zustand";
import api from "../lib/api";
import { showToast } from "./useToastStore";
import { useAuthStore } from "./useAuthStore";

export interface WishlistItem {
  id: string;
  productId: string;
  name: string;
  slug: string;
  price: number;
  discountPrice?: number;
  stock: number;
  rating: number;
  reviewCount: number;
  image?: string;
}

interface WishlistStore {
  items: WishlistItem[];
  isLoading: boolean;
  load: () => Promise<void>;
  toggle: (productId: string) => Promise<boolean>;
  remove: (productId: string) => Promise<void>;
  moveToCart: (productId: string) => Promise<void>;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  isLoading: false,
  load: async () => {
    const user = useAuthStore.getState().user;
    if (!user) return;
    set({ isLoading: true });
    try {
      const { data } = await api.get("/wishlist");
      set({ items: data.data || [] });
    } catch {
      set({ items: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  toggle: async (productId) => {
    const user = useAuthStore.getState().user;
    if (!user) {
      showToast("Please sign in to save products", "info");
      return false;
    }
    const existing = get().items.some((i) => i.productId === productId);
    if (existing) {
      await get().remove(productId);
      return false;
    }
    await api.post("/wishlist/add", { productId });
    showToast("Added to wishlist");
    await get().load();
    return true;
  },
  remove: async (productId) => {
    await api.delete("/wishlist/remove", { data: { productId } });
    set({ items: get().items.filter((i) => i.productId !== productId) });
    showToast("Removed from wishlist", "info");
  },
  moveToCart: async (productId) => {
    await api.post("/wishlist/move-to-cart", { productId });
    set({ items: get().items.filter((i) => i.productId !== productId) });
    showToast("Moved to cart");
    const { useCartStore } = await import("./useCartStore");
    await useCartStore.getState().load();
  },
}));
