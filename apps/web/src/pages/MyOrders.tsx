import { Container, Card, Badge } from "@gadget-wallet/ui";
import { Package } from "lucide-react";

const orders = [
  { id: "ORD-001", date: "2024-01-15", status: "delivered", total: 1099.99, items: 1 },
  { id: "ORD-002", date: "2024-01-20", status: "shipped", total: 349.99, items: 2 },
];

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

export default function MyOrders() {
  return (
    <section>
      <Container>
        <h2 className="text-3xl font-bold text-gw-black mb-8">My Orders</h2>

        {orders.length === 0 ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gw-gray-300 mx-auto mb-4" />
            <p className="text-gw-gray-500">No orders yet</p>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <p className="font-semibold text-gw-black">{order.id}</p>
                    <p className="text-sm text-gw-gray-500">{order.date}</p>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                    {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gw-gray-500">{order.items} item(s)</span>
                  <span className="font-bold text-gw-red">${order.total}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
