import { Container, Button, Badge, Input } from "@gadget-wallet/ui";
import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ImagePlus, Trash2, Pencil, X, Plus, Package } from "lucide-react";
import { staggerContainer, staggerItem } from "../../lib/animations";
import api from "../../lib/api";
import { showToast } from "../../store/useToastStore";

interface Brand {
  id: string;
  name: string;
  slug: string;
  logo: string | null;
  description: string | null;
  count: number;
}

export default function AdminBrands() {
  const [brands, setBrands] = useState<Brand[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Brand | null>(null);
  const [creating, setCreating] = useState(false);
  const [draft, setDraft] = useState({ name: "", description: "" });
  const [saving, setSaving] = useState(false);
  const [uploadingId, setUploadingId] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const fileRefs = useRef<Record<string, HTMLInputElement | null>>({});

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/admin/brands");
      setBrands(data.data || []);
    } catch {
      showToast("Failed to load brands", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const handleUpload = async (brand: Brand, file?: File | null) => {
    if (!file) return;
    const fd = new FormData();
    fd.append("image", file);
    setUploadingId(brand.id);
    try {
      await api.post(`/admin/brands/${brand.id}/image`, fd);
      showToast(`${brand.name} logo updated`);
      await load();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Logo upload failed", "error");
    } finally {
      setUploadingId(null);
      const input = fileRefs.current[brand.id];
      if (input) input.value = "";
    }
  };

  const handleRemoveLogo = async (brand: Brand) => {
    if (!confirm(`Remove the logo for "${brand.name}"?`)) return;
    try {
      await api.delete(`/admin/brands/${brand.id}/image`);
      showToast("Logo removed", "info");
      await load();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to remove logo", "error");
    }
  };

  const saveEdit = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      await api.patch(`/admin/brands/${editing.id}`, {
        name: editing.name,
        description: editing.description || "",
      });
      showToast("Brand updated");
      setEditing(null);
      await load();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to update brand", "error");
    } finally {
      setSaving(false);
    }
  };

  const createBrand = async () => {
    if (!draft.name.trim()) return;
    setSaving(true);
    try {
      await api.post("/admin/brands", {
        name: draft.name,
        description: draft.description || "",
      });
      showToast("Brand created");
      setCreating(false);
      setDraft({ name: "", description: "" });
      await load();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to create brand", "error");
    } finally {
      setSaving(false);
    }
  };

  const deleteBrand = async (brand: Brand) => {
    if (!confirm(`Delete brand "${brand.name}"? This cannot be undone.`)) return;
    setDeletingId(brand.id);
    try {
      await api.delete(`/admin/brands/${brand.id}`);
      showToast("Brand deleted");
      await load();
    } catch (err: any) {
      showToast(err?.response?.data?.error || "Failed to delete brand", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <section className="gw-section">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-gw-black">Manage Brands</h2>
            <p className="text-sm text-gw-gray-500 mt-1">{brands.length} brands</p>
          </div>
          <Button variant="primary" onClick={() => setCreating(true)}>
            <Plus className="w-4 h-4 mr-1.5" /> Add Brand
          </Button>
        </div>

        {loading ? (
          <div className="text-center py-16 text-gw-gray-500 animate-pulse">Loading brands…</div>
        ) : (
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          >
            {brands.map((brand) => {
              const uploading = uploadingId === brand.id;
              return (
                <motion.div
                  key={brand.id}
                  variants={staggerItem}
                  layout
                  className="gw-panel overflow-hidden flex flex-col"
                >
                  {/* Logo */}
                  <div className="relative aspect-[4/3] bg-white">
                    {brand.logo ? (
                      <img
                        src={brand.logo}
                        alt={brand.name}
                        className="w-full h-full object-contain p-6"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center gap-2 text-gw-gray-300">
                        <ImagePlus className="w-10 h-10" />
                        <span className="text-xs font-medium">No logo yet</span>
                      </div>
                    )}
                    <Badge className="absolute top-3 left-3 bg-gw-black text-white">
                      <Package className="w-3 h-3 mr-1" />
                      {brand.count} products
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
                      <h3 className="font-bold text-gw-black text-lg">{brand.name}</h3>
                      <p className="text-xs text-gw-gray-400 font-mono">/{brand.slug}</p>
                    </div>
                    {brand.description && (
                      <p className="text-sm text-gw-gray-500 leading-relaxed line-clamp-2">{brand.description}</p>
                    )}

                    {/* Hidden file input per card */}
                    <input
                      ref={(el) => { fileRefs.current[brand.id] = el; }}
                      type="file"
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      onChange={(e) => handleUpload(brand, e.target.files?.[0])}
                    />

                    <div className="mt-auto pt-1 flex flex-wrap gap-2">
                      <Button
                        variant="dark"
                        size="sm"
                        className="flex-1 min-w-[110px]"
                        onClick={() => setEditing({ ...brand })}
                      >
                        <Pencil className="w-3.5 h-3.5 mr-1.5" /> Edit
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="flex-1 min-w-[110px]"
                        disabled={uploading}
                        onClick={() => fileRefs.current[brand.id]?.click()}
                      >
                        <ImagePlus className="w-3.5 h-3.5 mr-1.5" />
                        {brand.logo ? "Replace" : "Add Logo"}
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-gw-red hover:text-gw-red disabled:opacity-30"
                        disabled={!brand.logo || uploading}
                        onClick={() => handleRemoveLogo(brand)}
                        aria-label={`Remove ${brand.name} logo`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-gw-gray-400 hover:text-gw-red justify-start px-0"
                      isLoading={deletingId === brand.id}
                      disabled={deletingId === brand.id}
                      onClick={() => deleteBrand(brand)}
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Delete brand
                    </Button>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </Container>

      {/* Create modal */}
      <AnimatePresence>
        {creating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => !saving && setCreating(false)}
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
                <h4 className="font-bold text-gw-black">Add Brand</h4>
                <button onClick={() => !saving && setCreating(false)} className="text-gw-gray-300 hover:text-gw-red transition-colors">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <div className="p-6 space-y-4">
                <Input
                  label="Name *"
                  value={draft.name}
                  onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                  placeholder="e.g. Xiaomi, Anker, Baseus"
                />
                <div>
                  <label className="block text-xs font-medium text-gw-gray-500 mb-1.5">Description</label>
                  <textarea
                    value={draft.description}
                    onChange={(e) => setDraft({ ...draft, description: e.target.value })}
                    rows={3}
                    className="w-full rounded-xl border border-gw-border px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-gw-red/40 focus:border-gw-red"
                    placeholder="Short brand description (optional)"
                  />
                </div>
                <p className="text-xs text-gw-gray-400">
                  A URL-friendly slug is generated automatically from the name.
                </p>
                <div className="flex gap-3 pt-1">
                  <Button variant="primary" className="flex-1" isLoading={saving} disabled={!draft.name.trim()} onClick={createBrand}>
                    Create Brand
                  </Button>
                  <Button variant="ghost" className="flex-1" disabled={saving} onClick={() => setCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

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
                <h4 className="font-bold text-gw-black">Edit Brand</h4>
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
