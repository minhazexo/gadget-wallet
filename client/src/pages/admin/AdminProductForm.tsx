import { Container, Button, Input } from "@gadget-wallet/ui";
import { useEffect, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  UploadCloud,
  Trash2,
  Star,
  ChevronUp,
  ChevronDown,
  X,
  ImagePlus,
} from "lucide-react";
import api from "../../lib/api";
import { showToast } from "../../store/useToastStore";
import { SectionReveal } from "../../components/PageTransition";

const MAX_IMAGES = 12;
const inputClass =
  "w-full h-[46px] px-4 bg-white border border-gw-border rounded-btn text-gw-black placeholder:text-gw-gray-300 focus:outline-none focus:ring-2 focus:ring-gw-red/20 focus:border-gw-red transition-all duration-200";

const textareaClass =
  "w-full px-4 py-3 bg-white border border-gw-border rounded-btn text-gw-black placeholder:text-gw-gray-300 focus:outline-none focus:ring-2 focus:ring-gw-red/20 focus:border-gw-red transition-all duration-200 resize-y";

interface ProductImageItem {
  id: string;
  url: string;
  alt: string;
  order: number;
  isPrimary: boolean;
}

interface PendingImage {
  key: string;
  file: File;
  preview: string;
  alt: string;
}

interface Brand {
  id: string;
  name: string;
}

interface Category {
  id: string;
  name: string;
}

interface ProductDetail {
  id: string;
  name: string;
  slug: string;
  shortDescription: string;
  fullDescription: string;
  price: string;
  discountPrice?: string;
  sku: string;
  brandId: string;
  categoryId: string;
  stock: number;
  thumbnailUrl?: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  images: ProductImageItem[];
}

function moveItem<T>(arr: T[], from: number, to: number): T[] {
  const next = [...arr];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

let pendingKey = 0;

export default function AdminProductForm() {
  const { id } = useParams();
  const isEdit = !!id;
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [progress, setProgress] = useState<number | null>(null);
  const [dragOver, setDragOver] = useState(false);

  const [brands, setBrands] = useState<Brand[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [images, setImages] = useState<ProductImageItem[]>([]);
  const [pending, setPending] = useState<PendingImage[]>([]);

  const [form, setForm] = useState({
    name: "",
    slug: "",
    shortDescription: "",
    fullDescription: "",
    price: "",
    discountPrice: "",
    sku: "",
    brandId: "",
    categoryId: "",
    stock: 0,
    isFeatured: false,
    isNewArrival: false,
    isBestSeller: false,
  });
  const [formError, setFormError] = useState("");

  // Revoke any staged preview object URLs when the form unmounts.
  const pendingRef = useRef<PendingImage[]>([]);
  useEffect(() => {
    pendingRef.current = pending;
  }, [pending]);
  useEffect(
    () => () => pendingRef.current.forEach((p) => URL.revokeObjectURL(p.preview)),
    [],
  );

  const set = (key: keyof typeof form, value: string | number | boolean) =>
    setForm((f) => ({ ...f, [key]: value }));

  useEffect(() => {
    api.get("/brands").then((res) => setBrands(res.data.data || [])).catch(() => {});
    api.get("/categories").then((res) => setCategories(res.data.data || [])).catch(() => {});
  }, []);

  const loadProduct = () => {
    if (!id) return;
    setLoading(true);
    api
      .get(`/admin/products/${id}`)
      .then((res) => {
        const p: ProductDetail = res.data.data;
        setForm({
          name: p.name,
          slug: p.slug,
          shortDescription: p.shortDescription,
          fullDescription: p.fullDescription,
          price: String(p.price),
          discountPrice: p.discountPrice ? String(p.discountPrice) : "",
          sku: p.sku,
          brandId: p.brandId,
          categoryId: p.categoryId,
          stock: p.stock,
          isFeatured: p.isFeatured,
          isNewArrival: p.isNewArrival,
          isBestSeller: p.isBestSeller,
        });
        setImages(p.images || []);
        setLoading(false);
      })
      .catch(() => {
        setLoading(false);
        showToast("Failed to load product", "error");
      });
  };

  useEffect(() => {
    if (isEdit) loadProduct();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  // ─── Image helpers ────────────────────────────────────────────

  const acceptFiles = (list: FileList | null) => {
    if (!list) return;
    const files = Array.from(list);
    if (files.length === 0) return;
    const total = isEdit ? images.length + files.length : pending.length + files.length;
    if (total > MAX_IMAGES) {
      showToast(`A product can have at most ${MAX_IMAGES} images`, "error");
      return;
    }
    const invalid = files.find(
      (f) => !["image/jpeg", "image/png", "image/webp"].includes(f.type) || f.size > 5 * 1024 * 1024,
    );
    if (invalid) {
      showToast("Only JPG, PNG or WEBP images under 5MB are allowed", "error");
      return;
    }

    if (isEdit) {
      uploadToServer(files);
    } else {
      const next: PendingImage[] = files.map((file) => ({
        key: `pending-${++pendingKey}`,
        file,
        preview: URL.createObjectURL(file),
        alt: file.name.replace(/\.[^.]+$/, ""),
      }));
      setPending((p) => [...p, ...next]);
    }
  };

  const uploadToServer = async (files: File[]) => {
    setSaving(true);
    setProgress(0);
    try {
      const fd = new FormData();
      files.forEach((f) => fd.append("images", f));
      const res = await api.post(`/admin/products/${id}/images`, fd, {
        onUploadProgress: (e) => {
          if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
        },
      });
      setImages(res.data.data || []);
      showToast(`Uploaded ${files.length} image${files.length > 1 ? "s" : ""}`);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Upload failed", "error");
    } finally {
      setSaving(false);
      setProgress(null);
    }
  };

  const removeImage = async (img: ProductImageItem) => {
    if (!confirm("Delete this image?")) return;
    try {
      await api.delete(`/admin/products/${id}/images/${img.id}`);
      showToast("Image deleted");
      const res = await api.get(`/admin/products/${id}`);
      setImages(res.data.data.images || []);
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to delete image", "error");
    }
  };

  const setPrimary = async (img: ProductImageItem) => {
    try {
      await api.patch(`/admin/products/${id}/images/${img.id}`, { isPrimary: true });
      setImages((prev) =>
        prev.map((i) => ({ ...i, isPrimary: i.id === img.id })),
      );
      showToast("Cover image updated");
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to set cover", "error");
    }
  };

  const setAlt = async (img: ProductImageItem, alt: string) => {
    try {
      await api.patch(`/admin/products/${id}/images/${img.id}`, { alt });
    } catch {
      /* silent — alt is cosmetic */
    }
  };

  // Move a staged image to the front so it becomes the cover.
  const makePendingCover = (key: string) => {
    setPending((p) => {
      const idx = p.findIndex((x) => x.key === key);
      if (idx <= 0) return p;
      return [p[idx], ...p.filter((_, i) => i !== idx)];
    });
  };

  const reorderImages = async (from: number, to: number) => {
    // Optimistically apply the new order; the first image becomes the cover.
    const next = moveItem(images, from, to).map((img, idx) => ({
      ...img,
      isPrimary: idx === 0,
    }));
    setImages(next);
    try {
      await api.patch(`/admin/products/${id}/images/reorder`, {
        imageIds: next.map((i) => i.id),
      });
    } catch (err: any) {
      showToast(err.response?.data?.error || "Reorder failed", "error");
      loadProduct();
    }
  };

  const removePending = (key: string) => {
    setPending((p) => p.filter((x) => x.key !== key));
    // Revoke outside the updater to keep it pure (StrictMode-safe).
    const item = pending.find((x) => x.key === key);
    if (item) URL.revokeObjectURL(item.preview);
  };

  const reorderPending = (from: number, to: number) =>
    setPending((p) => moveItem(p, from, to));

  // ─── Validation ───────────────────────────────────────────────

  const validate = (): string => {
    if (!form.name.trim()) return "Product name is required";
    if (!form.slug.trim()) return "Slug is required";
    if (!form.sku.trim()) return "SKU is required";
    if (!form.brandId) return "Please choose a brand";
    if (!form.categoryId) return "Please choose a category";
    const price = parseFloat(form.price);
    if (isNaN(price) || price <= 0) return "Price must be a positive number";
    if (form.discountPrice && parseFloat(form.discountPrice) >= price) {
      return "Discount price must be lower than the regular price";
    }
    if (form.stock < 0) return "Stock cannot be negative";
    if (!isEdit && pending.length === 0) return "Add at least one product image";
    return "";
  };

  // ─── Submit ───────────────────────────────────────────────────

  const handleSubmit = async () => {
    const err = validate();
    if (err) {
      setFormError(err);
      return;
    }
    setFormError("");
    setSaving(true);

    try {
      if (isEdit) {
        await api.patch(`/admin/products/${id}`, {
          name: form.name,
          slug: form.slug,
          shortDescription: form.shortDescription,
          fullDescription: form.fullDescription,
          price: form.price,
          discountPrice: form.discountPrice || undefined,
          sku: form.sku,
          brandId: form.brandId,
          categoryId: form.categoryId,
          stock: form.stock,
          isFeatured: form.isFeatured,
          isNewArrival: form.isNewArrival,
          isBestSeller: form.isBestSeller,
        });
        showToast("Product updated");
        navigate(`/admin/products/${id}`);
      } else {
        const fd = new FormData();
        fd.append("name", form.name);
        fd.append("slug", form.slug);
        fd.append("shortDescription", form.shortDescription);
        fd.append("fullDescription", form.fullDescription);
        fd.append("price", form.price);
        fd.append("discountPrice", form.discountPrice || "");
        fd.append("sku", form.sku);
        fd.append("brandId", form.brandId);
        fd.append("categoryId", form.categoryId);
        fd.append("stock", String(form.stock));
        fd.append("isFeatured", String(form.isFeatured));
        fd.append("isNewArrival", String(form.isNewArrival));
        fd.append("isBestSeller", String(form.isBestSeller));
        pending.forEach((p) => fd.append("images", p.file));

        const res = await api.post("/admin/products", fd, {
          onUploadProgress: (e) => {
            if (e.total) setProgress(Math.round((e.loaded / e.total) * 100));
          },
        });
        showToast("Product created");
        navigate(`/admin/products/${res.data.data.id}`);
      }
    } catch (err: any) {
      setFormError(err.response?.data?.error || "Failed to save product");
    } finally {
      setSaving(false);
      setProgress(null);
    }
  };

  // ─── Render helpers ───────────────────────────────────────────

  const renderThumbControls = (
    isFirst: boolean,
    isLast: boolean,
    onUp: () => void,
    onDown: () => void,
  ) => (
    <div className="flex flex-col gap-0.5">
      <button
        type="button"
        disabled={isFirst}
        onClick={onUp}
        className="p-0.5 rounded text-gw-gray-300 hover:text-gw-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Move up"
      >
        <ChevronUp className="w-3.5 h-3.5" />
      </button>
      <button
        type="button"
        disabled={isLast}
        onClick={onDown}
        className="p-0.5 rounded text-gw-gray-300 hover:text-gw-black hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
        aria-label="Move down"
      >
        <ChevronDown className="w-3.5 h-3.5" />
      </button>
    </div>
  );

  const dropZone = (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragOver(false);
        acceptFiles(e.dataTransfer.files);
      }}
      onClick={() => fileInputRef.current?.click()}
      className={`cursor-pointer border-2 border-dashed rounded-2xl p-6 md:p-8 text-center transition-all ${
        dragOver
          ? "border-gw-red bg-gw-red/5 scale-[1.01]"
          : "border-gw-gray-300 hover:border-gw-red/60 hover:bg-gray-50"
      }`}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="hidden"
        onChange={(e) => {
          acceptFiles(e.target.files);
          e.target.value = "";
        }}
      />
      <UploadCloud className="w-10 h-10 text-gw-gray-300 mx-auto mb-3" />
      <p className="text-sm font-semibold text-gw-black">
        Drag & drop images here, or click to browse
      </p>
      <p className="text-xs text-gw-gray-500 mt-1">
        JPG, PNG or WEBP · up to {MAX_IMAGES} images · max 5MB each
      </p>
    </div>
  );

  const coverBadge = (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-gw-black text-white text-[10px] font-bold">
      <Star className="w-2.5 h-2.5 fill-current" /> Cover
    </span>
  );

  if (loading) {
    return (
      <Container className="py-8">
        <div className="flex items-center justify-center min-h-[50vh] text-gw-gray-500 animate-pulse">
          Loading product…
        </div>
      </Container>
    );
  }

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.3 }}>
      <Container className="py-8 max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Link
            to={isEdit ? `/admin/products/${id}` : "/admin/products"}
            className="w-10 h-10 rounded-xl border border-gw-border flex items-center justify-center text-gw-gray-300 hover:text-gw-red hover:border-gw-red transition-all"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h2 className="text-2xl font-bold text-gw-black">
              {isEdit ? "Edit Product" : "Add New Product"}
            </h2>
            <p className="text-sm text-gw-gray-500">
              {isEdit ? "Update details and manage images" : "Create a product with images"}
            </p>
          </div>
        </div>

        {formError && (
          <div className="mb-6 rounded-xl border border-gw-red/30 bg-gw-red/5 px-4 py-3 text-sm text-gw-red">
            {formError}
          </div>
        )}

        <div className="space-y-8">
          {/* Details */}
          <SectionReveal>
            <div className="gw-panel-light p-6 space-y-5">
              <h3 className="text-lg font-bold text-gw-black">Product Details</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <Input
                  label="Name *"
                  value={form.name}
                  onChange={(e) => set("name", e.target.value)}
                  placeholder="iPhone 15 Pro"
                />
                <Input
                  label="Slug *"
                  value={form.slug}
                  onChange={(e) => set("slug", e.target.value)}
                  placeholder="iphone-15-pro"
                />
                <Input
                  label="SKU *"
                  value={form.sku}
                  onChange={(e) => set("sku", e.target.value)}
                  placeholder="APL-IP15-256"
                />
                <Input
                  label="Stock *"
                  type="number"
                  min={0}
                  value={form.stock}
                  onChange={(e) => set("stock", Math.max(0, parseInt(e.target.value || "0", 10)))}
                />
                <Input
                  label="Price (BDT) *"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.price}
                  onChange={(e) => set("price", e.target.value)}
                  placeholder="1299.99"
                />
                <Input
                  label="Discount Price"
                  type="number"
                  min={0}
                  step="0.01"
                  value={form.discountPrice}
                  onChange={(e) => set("discountPrice", e.target.value)}
                  placeholder="Optional"
                />
                <div>
                  <label className="block text-sm font-medium text-gw-gray-700 mb-1.5">Brand *</label>
                  <select
                    value={form.brandId}
                    onChange={(e) => set("brandId", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select brand…</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gw-gray-700 mb-1.5">Category *</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => set("categoryId", e.target.value)}
                    className={inputClass}
                  >
                    <option value="">Select category…</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gw-gray-700 mb-1.5">
                    Short Description *
                  </label>
                  <textarea
                    value={form.shortDescription}
                    onChange={(e) => set("shortDescription", e.target.value)}
                    rows={2}
                    className={textareaClass}
                    placeholder="One-line summary shown on cards"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm font-medium text-gw-gray-700 mb-1.5">
                    Full Description *
                  </label>
                  <textarea
                    value={form.fullDescription}
                    onChange={(e) => set("fullDescription", e.target.value)}
                    rows={5}
                    className={textareaClass}
                    placeholder="Detailed product description"
                  />
                </div>
                <div className="sm:col-span-2 flex flex-wrap gap-6">
                  {[
                    { key: "isFeatured" as const, label: "Featured" },
                    { key: "isNewArrival" as const, label: "New Arrival" },
                    { key: "isBestSeller" as const, label: "Best Seller" },
                  ].map(({ key, label }) => (
                    <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={form[key]}
                        onChange={(e) => set(key, e.target.checked)}
                        className="w-4 h-4 accent-gw-red"
                      />
                      <span className="text-sm font-medium text-gw-gray-700">{label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </SectionReveal>

          {/* Images */}
          <SectionReveal>
            <div className="gw-panel-light p-6">
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-gw-black">Product Images</h3>
                <span className="text-xs text-gw-gray-500">
                  {(isEdit ? images.length : pending.length)} / {MAX_IMAGES}
                </span>
              </div>

              {isEdit ? (
                <>
                  <div className="mb-5">{dropZone}</div>
                  {images.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {images.map((img, i) => (
                        <div
                          key={img.id}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData("text/index", String(i))}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const from = parseInt(e.dataTransfer.getData("text/index") || String(i), 10);
                            if (!isNaN(from) && from !== i) reorderImages(from, i);
                          }}
                          className={`relative rounded-xl border overflow-hidden bg-white group ${
                            img.isPrimary ? "border-gw-red ring-2 ring-gw-red/20" : "border-gw-border"
                          }`}
                        >
                          <div className="aspect-square p-2 flex items-center justify-center cursor-grab active:cursor-grabbing">
                            <img src={img.url} alt={img.alt} className="w-full h-full object-contain" />
                          </div>
                          {img.isPrimary && (
                            <div className="absolute top-2 left-2">{coverBadge}</div>
                          )}
                          <div className="absolute top-2 right-2 flex items-start gap-1">
                            {renderThumbControls(
                              i === 0,
                              i === images.length - 1,
                              () => reorderImages(i, i - 1),
                              () => reorderImages(i, i + 1),
                            )}
                            <button
                              type="button"
                              onClick={() => removeImage(img)}
                              className="p-1 rounded-full bg-white/90 shadow-gw-sm text-gw-gray-300 hover:text-gw-red transition-colors"
                              aria-label="Delete image"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="p-2 border-t border-gw-border bg-gray-50 space-y-1.5">
                            <input
                              defaultValue={img.alt}
                              onBlur={(e) => {
                                if (e.target.value.trim() && e.target.value !== img.alt) setAlt(img, e.target.value.trim());
                              }}
                              className="w-full h-7 px-2 text-[11px] rounded-btn border border-gw-border focus:outline-none focus:border-gw-red"
                              placeholder="Alt text"
                            />
                            {!img.isPrimary && (
                              <button
                                type="button"
                                onClick={() => setPrimary(img)}
                                className="w-full h-7 text-[11px] font-semibold rounded-btn border border-gw-gray-300 text-gw-gray-500 hover:border-gw-red hover:text-gw-red transition-colors"
                              >
                                Set as cover
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gw-gray-500 text-center py-6">
                      No images yet — drag & drop or browse to add some.
                    </p>
                  )}
                </>
              ) : (
                <>
                  <div className="mb-5">{dropZone}</div>
                  {pending.length > 0 ? (
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {pending.map((p, i) => (
                        <div
                          key={p.key}
                          draggable
                          onDragStart={(e) => e.dataTransfer.setData("text/index", String(i))}
                          onDragOver={(e) => e.preventDefault()}
                          onDrop={(e) => {
                            e.preventDefault();
                            const from = parseInt(e.dataTransfer.getData("text/index") || String(i), 10);
                            if (!isNaN(from) && from !== i) reorderPending(from, i);
                          }}
                          className={`relative rounded-xl border overflow-hidden bg-white group ${
                            i === 0 ? "border-gw-red ring-2 ring-gw-red/20" : "border-gw-border"
                          }`}
                        >
                          <div className="aspect-square p-2 flex items-center justify-center cursor-grab active:cursor-grabbing">
                            <img src={p.preview} alt={p.alt} className="w-full h-full object-contain" />
                          </div>
                          {i === 0 && <div className="absolute top-2 left-2">{coverBadge}</div>}
                          <div className="absolute top-2 right-2 flex items-start gap-1">
                            {renderThumbControls(
                              i === 0,
                              i === pending.length - 1,
                              () => reorderPending(i, i - 1),
                              () => reorderPending(i, i + 1),
                            )}
                            <button
                              type="button"
                              onClick={() => removePending(p.key)}
                              className="p-1 rounded-full bg-white/90 shadow-gw-sm text-gw-gray-300 hover:text-gw-red transition-colors"
                              aria-label="Remove image"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <div className="p-2 border-t border-gw-border bg-gray-50 space-y-1.5">
                            <input
                              value={p.alt}
                              onChange={(e) =>
                                setPending((prev) =>
                                  prev.map((x) => (x.key === p.key ? { ...x, alt: e.target.value } : x)),
                                )
                              }
                              className="w-full h-7 px-2 text-[11px] rounded-btn border border-gw-border focus:outline-none focus:border-gw-red"
                              placeholder="Alt text"
                            />
                            {i !== 0 && (
                              <button
                                type="button"
                                onClick={() => makePendingCover(p.key)}
                                className="w-full h-7 text-[11px] font-semibold rounded-btn border border-gw-gray-300 text-gw-gray-500 hover:border-gw-red hover:text-gw-red transition-colors"
                              >
                                Set as cover
                              </button>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-gw-gray-500 text-center py-6">
                      Add at least one image — the first one becomes the cover.
                    </p>
                  )}
                </>
              )}

              {/* Progress */}
              {(saving || progress !== null) && (
                <div className="mt-5">
                  {progress !== null ? (
                    <>
                      <div className="flex justify-between text-xs text-gw-gray-500 mb-1">
                        <span>Uploading…</span>
                        <span>{progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-gray-100 overflow-hidden">
                        <div
                          className="h-full bg-gw-red transition-all duration-200"
                          style={{ width: `${progress}%` }}
                        />
                      </div>
                    </>
                  ) : (
                    <p className="text-xs text-gw-gray-500 flex items-center gap-2">
                      <ImagePlus className="w-3.5 h-3.5 animate-pulse" /> Uploading images…
                    </p>
                  )}
                </div>
              )}
            </div>
          </SectionReveal>

          {/* Actions */}
          <div className="flex flex-wrap items-center justify-end gap-3 pb-10">
            <Link to={isEdit ? `/admin/products/${id}` : "/admin/products"}>
              <Button variant="outline">Cancel</Button>
            </Link>
            <Button variant="primary" onClick={handleSubmit} isLoading={saving} disabled={saving}>
              {isEdit ? "Save Changes" : "Create Product"}
            </Button>
          </div>
        </div>
      </Container>
    </motion.div>
  );
}
