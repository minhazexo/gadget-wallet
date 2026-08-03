import { Container, Card, Badge, Button } from "@gadget-wallet/ui";
import { Package } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../lib/api";
import { useAuthStore } from "../store/useAuthStore";
import type { Order } from "./profile/types";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-700",
  confirmed: "bg-blue-100 text-blue-700",
  processing: "bg-orange-100 text-orange-700",
  shipped: "bg-purple-100 text-purple-700",
  delivered: "bg-green-100 text-green-700",
  cancelled: "bg-red-100 text-red-700",
};

const formatDate = (d: string) =>
  new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" });

export default function MyOrders() {
  const user = useAuthStore((s) => s.user);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    api
      .get(`/orders/user/${user.id}`)
      .then((res) => setOrders(res.data.data || []))
      .catch(() => setOrders([]))
      .finally(() => setLoading(false));
  }, [user]);

  return (
    <section className="gw-section">
      <Container>
        <div className="flex items-center justify-between mb-8">
          <h2 className="gw-title">My Orders</h2>
          <Link to="/profile?tab=orders">
            <Button variant="ghost" className="text-sm">Open Dashboard</Button>
          </Link>
        </div>

        {!user ? (
          <div className="text-center py-20">
            <Package className="w-16 h-16 text-gw-gray-300 mx-auto mb-4" />
            <p className="gw-muted mb-4">Sign in to view your orders</p>
            <Link to="/login"><Button variant="primary">Sign In</Button></Link>
          </div>
        ) : loading ? (
          <div className="text-center py-20 text-gw-gray-500 animate-pulse">Loading orders...</div>
        ) : orders.length === 0 ? (
          <div className="gw-empty-compact">
            <Package className="w-16 h-16 text-gw-gray-300 mx-auto mb-4" />
            <p className="gw-muted mb-4">No orders yet</p>
            <Link to="/shop"><Button variant="primary">Start Shopping</Button></Link>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="p-6">
                <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                  <div>
                    <p className="gw-heading">
                      {order.id.slice(0, 8).toUpperCase()}
                    </p>
                    <p className="gw-muted-sm">{formatDate(order.createdAt)}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusColors[order.status] || statusColors.pending}>
                      {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                    </Badge>
                    <Badge className={order.paymentStatus === "paid" ? "bg-green-100 text-green-700" : "bg-yellow-100 text-yellow-700"}>
                      {order.paymentStatus.toUpperCase()}
                    </Badge>
                  </div>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="gw-muted">
                    {(order.items || []).reduce((s, it) => s + it.quantity, 0)} item(s)
                  </span>
                  <span className="font-bold text-gw-red">${Number(order.total).toFixed(2)}</span>
                </div>
              </Card>
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
