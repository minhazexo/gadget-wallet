import { Container, Button, Badge, Input } from "@gadget-wallet/ui";
import { Link } from "react-router-dom";
import { useEffect, useState, useRef } from "react";
import { Plus, Edit, Trash2, X, Save, Upload, Image as ImageIcon, Loader2, Eye } from "lucide-react";
import api from "../../lib/api";

interface Product {
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
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
}

interface ProductImage {
  id: string;
  productId: string;
  url: string;
  alt: string;
  order: number;
}

interface Category {
  id: string;
  name: string;
}

interface Brand {
  id: string;
  name: string;
}

const emptyForm = {
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
};

type FormData = typeof emptyForm;

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);

  // Image upload state
  const [images, setImages] = useState<ProductImage[]>([]);
  const [uploading, setUploading] = useState(false);
  const [imagesLoaded, setImagesLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const fetchProducts = () => {
    setLoading(true);
    api.get("/admin/products").then((res) => {
      setProducts(res.data.data || []);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
      setProducts([]);
    });
  };

  useEffect(() => {
    fetchProducts();
    Promise.all([
      api.get("/categories"),
      api.get("/brands"),
    ]).then(([catRes, brandRes]) => {
      setCategories(catRes.data.data || []);
      setBrands(brandRes.data.data || []);
    }).catch(() => {
      // Categories/brands fetch failed, dropdowns will be empty
    });
  }, []);

  const fetchImages = async (productId: string) => {
    try {
      setImagesLoaded(false);
      const res = await api.get(`/admin/products/${productId}/images`);
      setImages(res.data.data || []);
      setImagesLoaded(true);
    } catch {
      setImages([]);
      setImagesLoaded(true);
    }
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setImages([]);
    setImagesLoaded(true);
    setModalOpen(true);
  };

  const openEdit = async (product: Product) => {
    setEditingId(product.id);
    setForm({
      name: product.name,
      slug: product.slug,
      shortDescription: product.shortDescription,
      fullDescription: product.fullDescription,
      price: product.price,
      discountPrice: product.discountPrice || "",
      sku: product.sku,
      brandId: product.brandId,
      categoryId: product.categoryId,
      stock: product.stock,
      isFeatured: product.isFeatured,
      isNewArrival: product.isNewArrival,
      isBestSeller: product.isBestSeller,
    });
    setModalOpen(true);
    await fetchImages(product.id);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      if (editingId) {
        await api.patch(`/admin/products/${editingId}`, form);
      } else {
        await api.post("/admin/products", form);
      }
      setModalOpen(false);
      fetchProducts();
    } catch (err) {
      console.error("Failed to save product", err);
      alert("Failed to save product. Check console for details.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await api.delete(`/admin/products/${id}`);
      fetchProducts();
    } catch (err) {
      console.error("Failed to delete product", err);
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !editingId) return;

    if (!file.type.startsWith("image/")) {
      alert("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert("Image must be under 5MB");
      return;
    }

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("image", file);
      formData.append("alt", file.name);

      await api.post(`/admin/products/${editingId}/images`, formData);

      await fetchImages(editingId);
      if (fileInputRef.current) fileInputRef.current.value = "";
    } catch (err) {
      console.error("Failed to upload image", err);
      alert("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleDeleteImage = async (imageId: string) => {
    if (!editingId) return;
    if (!confirm("Delete this image?")) return;

    try {
      await api.delete(`/admin/products/${editingId}/images/${imageId}`);
      await fetchImages(editingId);
    } catch (err) {
      console.error("Failed to delete image", err);
    }
  };

  const set = (key: keyof FormData, value: string | number | boolean) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <Container className="py-8">
      <div>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-gw-black">Manage Products</h2>
          <Button variant="primary" className="h-11" onClick={openCreate}>
            <Plus className="w-4 h-4 mr-2" /> Add Product
          </Button>
        </div>

        <div className="bg-white border border-gw-border rounded-[24px] p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gw-gray-500 border-b border-gw-border">
                <th className="text-left py-3 px-2 font-medium">Product</th>
                <th className="text-right py-3 px-2 font-medium">Price</th>
                <th className="text-right py-3 px-2 font-medium">Stock</th>
                <th className="text-center py-3 px-2 font-medium">Status</th>
                <th className="text-right py-3 px-2 font-medium">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gw-gray-500">Loading...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-center py-8 text-gw-gray-500">No products found</td>
                </tr>
              ) : (
                products.map((p) => (
                  <tr key={p.id} className="border-b border-gw-border hover:bg-gw-bg transition-colors">
                    <td className="py-3 px-2 font-medium text-gw-black">{p.name}</td>
                    <td className="py-3 px-2 text-right text-gw-black font-bold">${p.price}</td>
                    <td className="py-3 px-2 text-right">{p.stock}</td>
                    <td className="py-3 px-2 text-center">
                      <div className="flex items-center justify-center gap-1">
                        {p.isFeatured && <Badge variant="default">Featured</Badge>}
                        {p.isNewArrival && <Badge variant="new">New</Badge>}
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right">
                      <Link
                        to={`/admin/products/${p.id}`}
                        className="p-1.5 inline-block text-gw-gray-300 hover:text-gw-black transition-colors"
                        title="View details"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                      <button
                        onClick={() => openEdit(p)}
                        className="p-1.5 text-gw-gray-300 hover:text-gw-red transition-colors"
                        title="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        className="p-1.5 text-gw-gray-300 hover:text-gw-red transition-colors"
                        title="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit/Create Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white rounded-[24px] w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-gw-lg">
            <div className="flex items-center justify-between p-6 border-b border-gw-border sticky top-0 bg-white z-10">
              <h3 className="text-lg font-bold text-gw-black">
                {editingId ? "Edit Product" : "Add Product"}
              </h3>
              <button
                onClick={() => setModalOpen(false)}
                className="p-1.5 text-gw-gray-300 hover:text-gw-red transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="Product Name" value={form.name} onChange={(e) => set("name", e.target.value)} />
                <Input label="Slug" value={form.slug} onChange={(e) => set("slug", e.target.value)} placeholder="product-slug" />
              </div>

              <Input label="Short Description" value={form.shortDescription} onChange={(e) => set("shortDescription", e.target.value)} />

              <div>
                <label className="block text-sm font-medium text-gw-gray-700 mb-1.5">Full Description</label>
                <textarea
                  rows={4}
                  value={form.fullDescription}
                  onChange={(e) => set("fullDescription", e.target.value)}
                  className="w-full px-4 py-2.5 bg-white border border-gw-border rounded-btn text-gw-black placeholder:text-gw-gray-300 focus:outline-none focus:ring-2 focus:ring-gw-red/20 focus:border-gw-red transition-all duration-200 resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <Input label="Price" type="number" step="0.01" value={form.price} onChange={(e) => set("price", e.target.value)} />
                <Input label="Discount Price" type="number" step="0.01" value={form.discountPrice} onChange={(e) => set("discountPrice", e.target.value)} />
                <Input label="Stock" type="number" value={form.stock} onChange={(e) => set("stock", parseInt(e.target.value) || 0)} />
              </div>

              <Input label="SKU" value={form.sku} onChange={(e) => set("sku", e.target.value)} placeholder="PROD-001" />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gw-gray-700 mb-1.5">Category</label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => set("categoryId", e.target.value)}
                    className="w-full h-[46px] px-4 bg-white border border-gw-border rounded-btn text-gw-black focus:outline-none focus:ring-2 focus:ring-gw-red/20 focus:border-gw-red transition-all"
                  >
                    <option value="">Select category</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gw-gray-700 mb-1.5">Brand</label>
                  <select
                    value={form.brandId}
                    onChange={(e) => set("brandId", e.target.value)}
                    className="w-full h-[46px] px-4 bg-white border border-gw-border rounded-btn text-gw-black focus:outline-none focus:ring-2 focus:ring-gw-red/20 focus:border-gw-red transition-all"
                  >
                    <option value="">Select brand</option>
                    {brands.map((b) => (
                      <option key={b.id} value={b.id}>{b.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isFeatured}
                    onChange={(e) => set("isFeatured", e.target.checked)}
                    className="w-4 h-4 rounded accent-gw-red"
                  />
                  <span className="text-sm text-gw-gray-700 font-medium">Featured</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isNewArrival}
                    onChange={(e) => set("isNewArrival", e.target.checked)}
                    className="w-4 h-4 rounded accent-gw-red"
                  />
                  <span className="text-sm text-gw-gray-700 font-medium">New Arrival</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={form.isBestSeller}
                    onChange={(e) => set("isBestSeller", e.target.checked)}
                    className="w-4 h-4 rounded accent-gw-red"
                  />
                  <span className="text-sm text-gw-gray-700 font-medium">Best Seller</span>
                </label>
              </div>

              {/* ── Image Upload Section ── */}
              {editingId && (
                <div className="border-t border-gw-border pt-6 mt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h4 className="text-sm font-semibold text-gw-black flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Product Images
                    </h4>
                    <div className="flex items-center gap-2">
                      <input
                        ref={fileInputRef}
                        type="file"
                        accept="image/*"
                        onChange={handleImageUpload}
                        className="hidden"
                      />
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploading}
                        className="h-9 text-xs"
                      >
                        {uploading ? (
                          <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                        ) : (
                          <Upload className="w-3.5 h-3.5 mr-1.5" />
                        )}
                        Upload Image
                      </Button>
                    </div>
                  </div>

                  {!imagesLoaded ? (
                    <div className="flex items-center justify-center h-24 text-gw-gray-500 text-sm">
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" /> Loading images...
                    </div>
                  ) : images.length === 0 ? (
                    <div className="border-2 border-dashed border-gw-border rounded-[16px] p-8 text-center">
                      <ImageIcon className="w-10 h-10 text-gw-gray-300 mx-auto mb-3" />
                      <p className="text-sm text-gw-gray-500 mb-1">No images yet</p>
                      <p className="text-xs text-gw-gray-300">Upload product images to showcase your item</p>
                    </div>
                  ) : (
                    <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
                      {images.map((img) => (
                        <div key={img.id} className="relative group aspect-square rounded-xl overflow-hidden border border-gw-border bg-gw-bg">
                          <img
                            src={img.url}
                            alt={img.alt}
                            className="w-full h-full object-contain p-2"
                          />
                          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                            <button
                              onClick={() => handleDeleteImage(img.id)}
                              className="w-8 h-8 rounded-full bg-white/90 flex items-center justify-center text-gw-red hover:bg-white transition-all shadow-sm"
                              title="Delete image"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                          <span className="absolute top-1 left-1 bg-gw-black/60 text-white text-[10px] font-bold px-1.5 py-0.5 rounded">
                            #{img.order + 1}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-end gap-3 p-6 border-t border-gw-border sticky bottom-0 bg-white">
              <Button variant="outline" onClick={() => setModalOpen(false)} className="h-11">
                Cancel
              </Button>
              <Button variant="primary" onClick={handleSave} isLoading={saving} className="h-11">
                <Save className="w-4 h-4 mr-2" />
                {editingId ? "Update Product" : "Create Product"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
