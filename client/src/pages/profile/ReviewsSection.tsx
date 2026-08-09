import { motion } from "framer-motion";
import { useCallback, useEffect, useState } from "react";
import { Star, Pencil, Trash2, Plus } from "lucide-react";
import { Button, Input } from "@gadget-wallet/ui";
import api from "../../lib/api";
import { showToast } from "../../store/useToastStore";
import { SectionHeader, EmptyState, Modal, Stars, formatDate } from "./shared";
import type { ReviewItem, Order } from "./types";
import { cn } from "@gadget-wallet/ui";

export function ReviewsSection() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [purchased, setPurchased] = useState<{ productId: string; name: string; image?: string; slug?: string }[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<ReviewItem | null>(null);
  const [rateTarget, setRateTarget] = useState<{ productId: string; name: string; image?: string } | null>(null);
  const [rating, setRating] = useState(5);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [reviewRes, orderRes] = await Promise.all([api.get("/reviews/user"), api.get("/orders")]);
      const myReviews: ReviewItem[] = reviewRes.data.data || [];
      setReviews(myReviews);

      const orders: Order[] = orderRes.data.data || [];
      const reviewedIds = new Set(myReviews.map((r) => r.productId));
      const items = orders
        .filter((o) => o.status === "delivered")
        .flatMap((o) => o.items || [])
        .filter((i) => !reviewedIds.has(i.productId));
      const seen = new Set<string>();
      const unique = items
        .filter((i) => (seen.has(i.productId) ? false : (seen.add(i.productId), true)))
        .map((i) => ({ productId: i.productId, name: i.name || "Product", image: i.image, slug: i.slug }));
      setPurchased(unique);
    } catch {
      setReviews([]);
      setPurchased([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openAdd = (product?: { productId: string; name: string; image?: string }) => {
    setEditing(null);
    setRating(5);
    setTitle("");
    setComment("");
    setRateTarget(product || null);
    setModalOpen(true);
  };

  const openEdit = (review: ReviewItem) => {
    setEditing(review);
    setRateTarget(null);
    setRating(review.rating);
    setTitle(review.title);
    setComment(review.comment);
    setModalOpen(true);
  };

  const save = async () => {
    if (comment.length < 5) {
      showToast("Please write a short comment", "error");
      return;
    }
    try {
      if (editing) {
        await api.put(`/reviews/${editing.id}`, { rating, title, comment });
        showToast("Review updated successfully");
      } else if (rateTarget) {
        await api.post("/reviews", { productId: rateTarget.productId, rating, title, comment });
        showToast("Review submitted — pending approval");
      } else {
        showToast("No product selected", "error");
        return;
      }
      setModalOpen(false);
      load();
    } catch {
      showToast("Failed to save review", "error");
    }
  };

  const remove = async (review: ReviewItem) => {
    try {
      await api.delete(`/reviews/${review.id}`);
      showToast("Review deleted", "info");
      load();
    } catch {
      showToast("Failed to delete review", "error");
    }
  };

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
      <SectionHeader
        title="Reviews & Ratings"
        subtitle="Your submitted reviews and products you can rate"
        action={
          purchased.length > 0 ? (
            <Button variant="primary" size="sm" onClick={() => openAdd()}>
              <Plus className="w-4 h-4 mr-1.5" /> Rate a Product
            </Button>
          ) : undefined
        }
      />

      {/* Rate purchased products */}
      {purchased.length > 0 && (
        <div className="gw-panel-category p-5 mb-5">
          <h4 className="gw-heading-sm mb-3">Rate Your Purchases</h4>
          <div className="flex gap-3 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {purchased.map((p) => (
              <button
                key={p.productId}
                onClick={() => openAdd(p)}
                className="shrink-0 w-40 text-left group"
              >
                <div className="rounded-xl border border-gw-border dark:border-gray-700 p-3 group-hover:border-gw-red/50 transition-colors">
                  <div className="w-full aspect-square rounded-btn bg-white overflow-hidden mb-2">
                    <img src={p.image || `https://picsum.photos/seed/${p.slug || p.productId}/200/200`} alt={p.name} className="w-full h-full object-contain" />
                  </div>
                  <p className="text-xs font-medium gw-text-body truncate">{p.name}</p>
                  <span className="text-[11px] text-gw-red font-semibold">Write a review →</span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {loading ? (
        <div className="space-y-4">
          {[1, 2].map((i) => (
            <div key={i} className="animate-pulse gw-panel-category h-28" />
          ))}
        </div>
      ) : reviews.length === 0 ? (
        <div className="gw-panel-category">
          <EmptyState
            icon={<Star className="w-16 h-16" />}
            title="No reviews yet"
            subtitle="Review products you've purchased to help others"
          />
        </div>
      ) : (
        <div className="space-y-4">
          {reviews.map((review) => (
            <motion.div
              key={review.id}
              layout
              className="gw-panel-category p-5"
            >
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-xl bg-white border border-gw-border p-1.5 overflow-hidden shrink-0">
                  <img
                    src={review.productImage || `https://picsum.photos/seed/${review.productSlug || review.productId}/200/200`}
                    alt={review.productName}
                    className="w-full h-full object-contain"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <a href={`/product/${review.productSlug}`}>
                    <p className="gw-heading-sm truncate hover:text-gw-red transition-colors">
                      {review.productName}
                    </p>
                  </a>
                  <div className="flex items-center gap-2 mt-0.5">
                    <Stars rating={review.rating} />
                    <span className="gw-muted-xs">{formatDate(review.createdAt)}</span>
                  </div>
                </div>
                <div className="flex gap-1">
                  <button onClick={() => openEdit(review)} className="p-1.5 text-gw-gray-300 hover:text-gw-red transition-colors" aria-label="Edit review">
                    <Pencil className="w-4 h-4" />
                  </button>
                  <button onClick={() => remove(review)} className="p-1.5 text-gw-gray-300 hover:text-gw-red transition-colors" aria-label="Delete review">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="font-medium gw-text-body text-sm mt-3">{review.title}</p>
              <p className="gw-muted-sm mt-1">{review.comment}</p>
              <p className="text-[11px] text-gw-gray-300 dark:text-gray-600 mt-2">
                {review.isApproved ? "Approved" : "Pending approval"}
              </p>
            </motion.div>
          ))}
        </div>
      )}

      <Modal open={modalOpen} title={editing ? "Edit Review" : "Write a Review"} onClose={() => setModalOpen(false)}>
        <div className="space-y-4">
          {rateTarget && (
            <div className="flex items-center gap-3 bg-gw-bg dark:bg-gray-800 rounded-xl p-3">
              <div className="w-12 h-12 rounded-btn bg-white overflow-hidden shrink-0">
                <img src={rateTarget.image || `https://picsum.photos/seed/${rateTarget.productId}/100/100`} alt={rateTarget.name} className="w-full h-full object-contain" />
              </div>
              <p className="text-sm font-medium gw-text-body">{rateTarget.name}</p>
            </div>
          )}
          <div>
            <p className="text-sm font-medium text-gw-gray-700 dark:text-gray-300 mb-2">Your Rating</p>
            <div className="flex gap-1">
              {[1, 2, 3, 4, 5].map((s) => (
                <button key={s} onClick={() => setRating(s)} aria-label={`${s} stars`}>
                  <Star className={cn("w-8 h-8 transition-all", s <= rating ? "fill-gw-yellow text-gw-yellow scale-110" : "text-gw-gray-300")} />
                </button>
              ))}
            </div>
          </div>
          <Input label="Title" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Great product!" />
          <div>
            <label className="block text-sm font-medium text-gw-gray-700 dark:text-gray-300 mb-1.5">Comment</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              placeholder="Share your experience..."
              className="w-full px-4 py-3 bg-white dark:bg-gray-800 border border-gw-border dark:border-gray-700 rounded-btn text-gw-black dark:text-white placeholder:text-gw-gray-300 focus:outline-none focus:ring-2 focus:ring-gw-red/20 focus:border-gw-red transition-all"
            />
          </div>
          <div className="flex gap-3">
            <Button variant="primary" className="flex-1" onClick={save}>
              {editing ? "Update Review" : "Submit Review"}
            </Button>
            <Button variant="outline" onClick={() => setModalOpen(false)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </motion.div>
  );
}
