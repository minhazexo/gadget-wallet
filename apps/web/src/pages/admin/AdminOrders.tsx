import { Container, Card } from "@gadget-wallet/ui";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import api from "../../lib/api";

interface Order {
  id: string;
  status: string;
  total: number;
  createdAt: string;
}

export default function AdminOrders() {
  const [orders, setOrders] = useState<Order[]>([]);

  useEffect(() => {
    api.get("/admin/orders").then((res) => setOrders(res.data.data || []));
  }, []);

  const statusColors: Record<string, string> = {
    pending: "bg-yellow-500/20 text-yellow-400",
    confirmed: "bg-blue-500/20 text-blue-400",
    shipped: "bg-purple-500/20 text-purple-400",
    delivered: "bg-green-500/20 text-green-400",
    cancelled: "bg-red-500/20 text-red-400",
  };

  return (
    <Container className="py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-8">Manage Orders</h1>
        <Card className="p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gw-text-secondary border-b border-white/10">
                <th className="text-left py-3 px-2">Order ID</th>
                <th className="text-center py-3 px-2">Status</th>
                <th className="text-right py-3 px-2">Total</th>
                <th className="text-right py-3 px-2">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-white/5 hover:bg-white/5">
                  <td className="py-3 px-2 font-medium">{o.id.slice(0, 8)}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`px-2 py-0.5 rounded-full text-xs ${statusColors[o.status] || ""}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right">${Number(o.total).toFixed(2)}</td>
                  <td className="py-3 px-2 text-right">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </motion.div>
    </Container>
  );
}
