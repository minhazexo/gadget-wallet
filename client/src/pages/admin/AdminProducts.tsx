import { Container, Badge, Button } from "@gadget-wallet/ui";
import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Plus, Edit, Trash2 } from "lucide-react";
import { motion } from "framer-motion";
import api from "../../lib/api";
import { showToast } from "../../store/useToastStore";

interface Product {
  id: string;
  name: string;
  slug: string;
  price: string;
  stock: number;
  thumbnailUrl?: string;
  isFeatured: boolean;
  isNewArrival: boolean;
  isBestSeller: boolean;
  createdAt: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  const fetchProducts = () => {
    setLoading(true);
    api
      .get("/admin/products")
      .then((res) => setProducts(res.data.data || []))
      .catch(() => showToast("Failed to load products", "error"))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const handleDelete = async (p: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm(`Delete "${p.name}"? This removes all of its images.`)) return;
    try {
      await api.delete(`/admin/products/${p.id}`);
      showToast("Product deleted");
      fetchProducts();
    } catch (err: any) {
      showToast(err.response?.data?.error || "Failed to delete product", "error");
    }
  };

  return (
    <section className="gw-section">
      <Container>
        <div className="flex flex-wrap items-center justify-between gap-3 mb-8">
          <h2 className="text-2xl md:text-3xl font-bold text-gw-black">Manage Products</h2>
          <Link to="/admin/products/new">
            <Button variant="primary">
              <Plus className="w-4 h-4 mr-2" /> Add Product
            </Button>
          </Link>
        </div>

        <div className="gw-panel-light p-6 overflow-x-auto">
          {loading ? (
            <div className="text-center py-12 text-gw-gray-500 animate-pulse">Loading products…</div>
          ) : products.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gw-gray-500 mb-4">No products yet.</p>
              <Link to="/admin/products/new">
                <Button variant="primary">Create your first product</Button>
              </Link>
            </div>
          ) : (
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
                {products.map((p) => (
                  <motion.tr
                    key={p.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => navigate(`/admin/products/${p.id}`)}
                    className="border-b border-gw-border/50 hover:bg-gray-50 cursor-pointer transition-colors"
                  >
                    <td className="py-3 px-2">
                      <div className="flex items-center gap-3">
                        <img
                          src={p.thumbnailUrl || `https://picsum.photos/seed/${p.slug}/80/80`}
                          alt={p.name}
                          className="w-11 h-11 rounded-btn object-contain bg-white border border-gw-border p-1"
                          loading="lazy"
                        />
                        <span className="font-medium text-gw-black">{p.name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-2 text-right text-gw-black">৳{Number(p.price).toFixed(2)}</td>
                    <td className="py-3 px-2 text-right text-gw-black">{p.stock}</td>
                    <td className="py-3 px-2 text-center space-x-1">
                      {p.isFeatured && <Badge variant="default">Featured</Badge>}
                      {p.isNewArrival && <Badge variant="new">New</Badge>}
                      {p.isBestSeller && <Badge variant="sale">Best Seller</Badge>}
                    </td>
                    <td className="py-3 px-2 text-right whitespace-nowrap">
                      <Link
                        to={`/admin/products/${p.id}/edit`}
                        onClick={(e) => e.stopPropagation()}
                        className="inline-flex p-1.5 text-gw-gray-300 hover:text-gw-red transition-colors"
                        aria-label="Edit product"
                      >
                        <Edit className="w-4 h-4" />
                      </Link>
                      <button
                        className="inline-flex p-1.5 text-gw-gray-300 hover:text-gw-red transition-colors"
                        onClick={(e) => handleDelete(p, e)}
                        aria-label="Delete product"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </Container>
    </section>
  );
}
