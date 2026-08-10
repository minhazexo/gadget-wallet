import { Container, Button, Badge, Input } from "@gadget-wallet/ui";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, Trash2, Pencil, X, Package } from "lucide-react";
import { staggerContainer, staggerItem } from "../../lib/animations";
import api from "../../lib/api";
import { showToast } from "../../store/useToastStore";

interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image: string | null;
  count: number;
}

export default function AdminCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Category | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/categories");
      setCategories(data.data || []);
    } catch {
      showToast("Failed to load categories", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (cat: Category, file?: File | null) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    setUploadingId(cat.id);
    try {
      await api.post(`/admin/categories/${cat.id}/image`, fd);
      showToast(`${cat.name} photo updated`);
      await load();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Photo upload failed", "error");
    } finally {
      setUploadingId(null);
      const input = fileRefs.current[cat.id];
      if (input) input.value = "";
    }
  };

  const handleRemovePhoto = async (cat: Category) => {
    if (!confirm(`Remove the photo for "${cat.name}"?`)) return;
    try {
      await api.delete(`/admin/categories/${cat.id}/image`);
      showToast("Photo removed", "info");
      await load();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to remove photo", "error");
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.patch(`/admin/categories/${editing.id}`, {
        name: editing.name,
        description: editing.description || "",
      });
      showToast("Category updated");
      setEditing(null);
      await load();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to update category", "error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <section className="gw-section">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gw-black">Manage Categories</h2>
          <span className="text-sm text-gw-gray-500">{categories.length} categories</span>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gw-gray-500 animate-pulse">Loading categories…</div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {categories.map((cat) => {
              const uploading = uploadingId === cat.id;
              return (
                <motion.div
                  key={cat.id}
                  variants={staggerItem}
                  layout
                  className="gw-panel overflow-hidden flex flex-col"
                >
                  {/* Photo */}
                  <div className="relative aspect-[4/3] bg-white">
                    {cat.image ? (
                      <img
                        src={cat.image}
                        alt={cat.name}
                        className="w-full h-full object-contain p-4"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gw-gray-300">
                        <ImagePlus className="w-10 h-10" />
                        <span className="text-xs font-medium">No photo yet</span>
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-gw-black text-white">
                      <Package className="w-3 h-3 mr-1" />
                      {cat.count} products
                    </Badge>
                    {uploading && (
                      <div className="absolute inset-0 bg-white/70 flex items-center justify-center text-sm font-semibold text-gw-red animate-pulse">
                        Uploading…
                      </div>
                    )}
                  </div>

                  {/* Details */}
                  <div className="p-5 flex flex-col gap-3 flex-1">
                    <div>
                      <h3 className="font-bold text-gw-black text-lg">{cat.name}</h3>
                      <p className="text-xs text-gw-gray-400 font-mono">/{cat.slug}</p>
                    </div>
                    {cat.description && (
                      <p className="text-sm text-gw-gray-500 leading-relaxed line-clamp-2">{cat.description}</p>
                    )}

                    {/* Hidden file input per card */}
                    <input
                      ref={(el) => { fileRefs.current[cat.id] = el; }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleUpload(cat, e.target.files?.[0])}
                    />

                    <div className="mt-auto pt-1 flex flex-wrap gap-2">
                      <Button
                        variant="dark"
                        size="sm"
                        className="flex-1 min-w-[110px]"
                        onClick={() => setEditing({ ...cat })}
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-[110px]"
                        disabled={uploading}
                        onClick={() => fileRefs.current[cat.id]?.click()}
                      >
                        <ImagePlus className="w-3.5 h-3.5 mr-1.5" />
                        {cat.image ? "Replace" : "Add Photo"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gw-red hover:text-gw-red disabled:opacity-30"
                        disabled={!cat.image || uploading}
                        onClick={() => handleRemovePhoto(cat)}
                        aria-label={`Remove ${cat.name} photo`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </Container>

      {/* Edit modal */}
      <AnimatePresence>
        {editing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !saving && setEditing(null)}
            className="fixed inset-0 z-[80] bg-black/50 flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -10 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="gw-panel w-full max-w-md max-h-[85vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-gw-border sticky top-0 bg-white z-10">
                <h4 className="font-bold text-gw-black">Edit Category</h4>
                <button onClick={() => !saving && setEditing(null)} className="text-gw-gray-300 hover:text-gw-red transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <Input
                  label="Name *"
                  value={editing.name}
                  onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                />
                <div>
                  <label className="block text-xs font-medium text-gw-gray-500 mb-1.5">Description</label>
                  <textarea
                    value={editing.description || ""}
                    onChange={(e) => setEditing({ ...editing, description: e.target.value })}
                    rows={4}
                    className="w-full rounded-xl border border-gw-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gw-red/40 focus:border-gw-red"
                    placeholder="Short description shown on the storefront"
                  />
                </div>
                <div className="flex gap-3 pt-1">
                  <Button variant="primary" className="flex-1" isLoading={saving} disabled={!editing.name.trim()} onClick={saveEdit}>
                    Save Changes
                  </Button>
                  <Button variant="ghost" className="flex-1" disabled={saving} onClick={() => setEditing(null)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
