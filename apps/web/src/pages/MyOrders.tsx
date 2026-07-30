import { Container, Badge } from "@gadget-wallet/ui";
import { Package } from "lucide-react";

const orders = [
  { id: "ORD-001", date: "2024-01-15", status: "delivered", total: 1099.99, items: 1 },
  { id: "ORD-002", date: "2024-01-20", status: "shipped", total: 349.99, items: 2 },
];

const statusStyles: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-600",
  confirmed: "bg-blue-500/10 text-blue-600",
  shipped: "bg-purple-500/10 text-purple-600",
  delivered: "bg-gw-green/10 text-gw-green",
  cancelled: "bg-gw-red/10 text-gw-red",
};

export default function MyOrders() {
  return (
    <section>
      <Container>
        <h2 className="text-3xl font-bold text-gw-black mb-8">My Orders</h2>

        {orders.length === 0 ? (
          <div className="text-center py-20 bg-white border border-gw-border rounded-[24px]">
            <Package className="w-16 h-16 text-gw-gray-300 mx-auto mb-4" />
            <p className="text-gw-gray-500">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <div key={order.id} className="bg-white border border-gw-border rounded-[24px] p-6 hover:shadow-gw-sm transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold text-gw-black">{order.id}</p>
                    <p className="text-sm text-gw-gray-500">{order.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-bold ${statusStyles[order.status] || ""}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm pt-4 border-t border-gw-border">
                  <span className="text-gw-gray-500">{order.items} item(s)</span>
                  <span className="font-bold text-xl text-gw-red">${order.total}</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
