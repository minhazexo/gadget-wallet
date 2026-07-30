import { Container, Card, Badge } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { Package } from "lucide-react";

const orders = [
  { id: "ORD-001", date: "2024-01-15", status: "delivered", total: 1099.99, items: 1 },
  { id: "ORD-002", date: "2024-01-20", status: "shipped", total: 349.99, items: 2 },
];

const statusColors = {
  pending: "bg-yellow-500/20 text-yellow-400",
  confirmed: "bg-blue-500/20 text-blue-400",
  shipped: "bg-purple-500/20 text-purple-400",
  delivered: "bg-green-500/20 text-green-400",
  cancelled: "bg-red-500/20 text-red-400",
};

export default function MyOrders() {
  return (
    <div className="pt-20 min-h-screen">
      <Container className="py-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold mb-8">My Orders</h1>

          {orders.length === 0 ? (
            <div className="text-center py-20">
              <Package className="w-16 h-16 text-gw-text-secondary/30 mx-auto mb-4" />
              <p className="text-gw-text-secondary">No orders yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              {orders.map((order, i) => (
                <motion.div
                  key={order.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.1 }}
                >
                  <Card className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <p className="font-semibold">{order.id}</p>
                        <p className="text-sm text-gw-text-secondary">{order.date}</p>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status as keyof typeof statusColors]}`}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gw-text-secondary">{order.items} item(s)</span>
                      <span className="font-bold text-gw-accent">${order.total}</span>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </motion.div>
      </Container>
    </div>
  );
}
