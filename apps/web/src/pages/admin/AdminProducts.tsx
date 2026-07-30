import { Container, Card, Button, Badge } from "@gadget-wallet/ui";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Plus, Edit, Trash2 } from "lucide-react";
import api from "../../lib/api";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  isFeatured: boolean;
  isNewArrival: boolean;
  deletedAt?: string;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.get("/admin/products").then((res) => setProducts(res.data.data || []));
  }, []);

  return (
    <Container className="py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-3xl font-display font-bold">Manage Products</h1>
          <Button variant="primary"><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
        </div>

        <Card className="p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gw-text-secondary border-b border-white/10">
                <th className="text-left py-3 px-2">Product</th>
                <th className="text-right py-3 px-2">Price</th>
                <th className="text-right py-3 px-2">Stock</th>
                <th className="text-center py-3 px-2">Status</th>
                <th className="text-right py-3 px-2">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-2 font-medium">{p.name}</td>
                  <td className="py-3 px-2 text-right">${p.price}</td>
                  <td className="py-3 px-2 text-right">{p.stock}</td>
                  <td className="py-3 px-2 text-center">
                    {p.isFeatured && <Badge variant="default">Featured</Badge>}
                    {p.isNewArrival && <Badge variant="new">New</Badge>}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button className="p-1 text-gw-text-secondary hover:text-gw-accent"><Edit className="w-4 h-4" /></button>
                    <button className="p-1 text-gw-text-secondary hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </motion.div>
    </Container>
  );
}
