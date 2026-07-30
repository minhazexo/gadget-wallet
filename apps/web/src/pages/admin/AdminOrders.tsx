import { Container } from "@gadget-wallet/ui";
import { useEffect, useState } from "react";
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
    pending: "bg-yellow-500/10 text-yellow-600",
    confirmed: "bg-blue-500/10 text-blue-600",
    shipped: "bg-purple-500/10 text-purple-600",
    delivered: "bg-gw-green/10 text-gw-green",
    cancelled: "bg-gw-red/10 text-gw-red",
  };

  return (
    <Container className="py-8">
      <div>
        <h2 className="text-2xl font-bold text-gw-black mb-8">Manage Orders</h2>
        <div className="bg-white border border-gw-border rounded-[24px] p-6 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-gw-gray-500 border-b border-gw-border">
                <th className="text-left py-3 px-2 font-medium">Order ID</th>
                <th className="text-center py-3 px-2 font-medium">Status</th>
                <th className="text-right py-3 px-2 font-medium">Total</th>
                <th className="text-right py-3 px-2 font-medium">Date</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o.id} className="border-b border-gw-border hover:bg-gw-bg transition-colors">
                  <td className="py-3 px-2 font-medium text-gw-black">{o.id.slice(0, 8)}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${statusColors[o.status] || ""}`}>
                      {o.status.charAt(0).toUpperCase() + o.status.slice(1)}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right text-gw-black font-bold">${Number(o.total).toFixed(2)}</td>
                  <td className="py-3 px-2 text-right text-gw-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </Container>
  );
}
