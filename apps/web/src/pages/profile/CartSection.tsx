import { motion } from "framer-motion";
import { ShoppingBag, Trash2, Minus, Plus, ArrowRight } from "lucide-react";
import { Button } from "@gadget-wallet/ui";
import { useCartStore, selectCartSummary } from "../../store/useCartStore";
import { showToast } from "../../store/useToastStore";
import { SectionHeader, EmptyState, money } from "./shared";

export function CartSection() {
  const items = useCartStore((s) => s.items);
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);
  const { count, subtotal } = selectCartSummary(items);
  const recent = [...items].slice(0, 5);

  const handleQuantity = async (productId: string, qty: number) => {
    if (qty < 1) return;
    try {
      await updateQuantity(productId, qty);
    } catch {
      showToast("Failed to update cart", "error");
    }
  };

  const handleRemove = async (productId: string) => {
    try {
      await removeItem(productId);
      showToast("Item removed from cart", "info");
    } catch {
      showToast("Failed to remove item", "error");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SectionHeader title="Shopping Cart" subtitle="Your cart stays in sync with the store" />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2">
          {items.length === 0 ? (
            <div className="gw-panel-category">
              <EmptyState
                icon={<ShoppingBag className="w-16 h-16" />}
                title="Your cart is empty"
                subtitle="Add products from the shop and they will appear here"
                action={<a href="/shop"><Button variant="primary">Browse Products</Button></a>}
              />
            </div>
          ) : (
            <div className="space-y-3">
              {items.map((item) => (
                <motion.div
                  key={item.id}
                  layout
                  className="gw-panel-category p-4"
                >
                  <div className="flex items-center gap-4">
                    <a href={`/product/${item.slug}`} className="shrink-0">
                      <div className="w-16 h-16 rounded-xl bg-white border border-gw-border p-1.5 overflow-hidden">
                        <img
                          src={item.image || `https://picsum.photos/seed/${item.slug}/200/200`}
                          alt={item.name}
                          className="w-full h-full object-contain"
                        />
                      </div>
                    </a>
                    <div className="flex-1 min-w-0">
                      <a href={`/product/${item.slug}`}>
                        <p className="gw-heading-sm truncate hover:text-gw-red transition-colors">
                          {item.name}
                        </p>
                      </a>
                      <p className="text-sm font-bold text-gw-red mt-0.5">{money(Number(item.discountPrice || item.price))}</p>
                    </div>
                    <div className="flex items-center border border-gw-border dark:border-gray-700 rounded-xl">
                      <button
                        onClick={() => handleQuantity(item.productId, item.quantity - 1)}
                        className="p-1.5 text-gw-gray-500 hover:text-gw-red"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-2 gw-heading-sm">{item.quantity}</span>
                      <button
                        onClick={() => handleQuantity(item.productId, item.quantity + 1)}
                        className="p-1.5 text-gw-gray-500 hover:text-gw-red"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <p className="w-20 text-right gw-heading-sm">
                      {money(Number(item.discountPrice || item.price) * item.quantity)}
                    </p>
                    <button
                      onClick={() => handleRemove(item.productId)}
                      className="p-1.5 text-gw-gray-300 hover:text-gw-red transition-colors"
                      aria-label="Remove"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div>
          <div className="gw-panel-category p-5 lg:sticky lg:top-[148px]">
            <h4 className="gw-heading mb-4">Cart Summary</h4>
            <div className="space-y-2 gw-muted-sm">
              <div className="flex justify-between">
                <span>Total items</span>
                <span className="font-medium gw-text-body">{count}</span>
              </div>
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span className="font-medium gw-text-body">{money(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Shipping</span>
                <span className="font-medium text-gw-green">Free</span>
              </div>
              <div className="border-t border-gw-border dark:border-gray-700 pt-3 flex justify-between font-bold text-base">
                <span className="gw-text-body">Total</span>
                <span className="text-gw-red">{money(subtotal)}</span>
              </div>
            </div>
            <div className="mt-5 space-y-2">
              <a href="/checkout">
                <Button variant="primary" className="w-full h-11">
                  Checkout <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </a>
              <a href="/cart">
                <Button variant="outline" className="w-full h-11">
                  Go to Cart
                </Button>
              </a>
            </div>
          </div>

          {recent.length > 0 && (
            <div className="gw-panel-category p-5 mt-4">
              <h4 className="gw-heading-sm mb-3">Recently Added</h4>
              <div className="space-y-3">
                {recent.map((item) => (
                  <a key={item.id} href={`/product/${item.slug}`} className="flex items-center gap-3 group">
                    <div className="w-10 h-10 rounded-lg bg-white border border-gw-border p-1 overflow-hidden shrink-0">
                      <img src={item.image || `https://picsum.photos/seed/${item.slug}/100/100`} alt={item.name} className="w-full h-full object-contain" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-medium gw-text-body truncate group-hover:text-gw-red transition-colors">{item.name}</p>
                      <p className="gw-muted-xs">Qty {item.quantity}</p>
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
}
