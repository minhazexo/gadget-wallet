import { Container, Badge, Button } from "@gadget-wallet/ui";
import { useEffect, useState } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import api from "../../lib/api";

interface Product {
  id: string;
  name: string;
  price: number;
  stock: number;
  isFeatured: boolean;
  isNewArrival: boolean;
}

export default function AdminProducts() {
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    api.get("/admin/products").then((res) => setProducts(res.data.data || []));
  }, []);

  return (
    <section>
      <Container>
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-bold text-gw-black">Manage Products</h2>
          <Button variant="primary"><Plus className="w-4 h-4 mr-2" /> Add Product</Button>
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
              {products.map((p) => (
                <tr key={p.id} className="border-b border-gw-border/50 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-gw-black">{p.name}</td>
                  <td className="py-3 px-2 text-right text-gw-black">${p.price}</td>
                  <td className="py-3 px-2 text-right text-gw-black">{p.stock}</td>
                  <td className="py-3 px-2 text-center space-x-1">
                    {p.isFeatured && <Badge variant="default">Featured</Badge>}
                    {p.isNewArrival && <Badge variant="new">New</Badge>}
                  </td>
                  <td className="py-3 px-2 text-right">
                    <button className="p-1.5 text-gw-gray-300 hover:text-gw-red transition-colors"><Edit className="w-4 h-4" /></button>
                    <button className="p-1.5 text-gw-gray-300 hover:text-gw-red transition-colors"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
