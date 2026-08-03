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
    pending: "bg-yellow-100 text-yellow-700",
    confirmed: "bg-blue-100 text-blue-700",
    shipped: "bg-purple-100 text-purple-700",
    delivered: "bg-green-100 text-green-700",
    cancelled: "bg-red-100 text-red-700",
  };

  return (
    <section className="gw-section">
      <Container>
        <h2 className="text-2xl md:text-3xl font-bold text-gw-black mb-8">Manage Orders</h2>
        <div className="gw-panel-light p-6 overflow-x-auto">
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
                <tr key={o.id} className="border-b border-gw-border/50 hover:bg-gray-50">
                  <td className="py-3 px-2 font-medium text-gw-black">{o.id.slice(0, 8)}</td>
                  <td className="py-3 px-2 text-center">
                    <span className={`gw-status-badge--compact font-medium ${statusColors[o.status] || ""}`}>
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3 px-2 text-right text-gw-black">${Number(o.total).toFixed(2)}</td>
                  <td className="py-3 px-2 text-right text-gw-gray-500">{new Date(o.createdAt).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Container>
    </section>
  );
}
