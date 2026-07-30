import { Container, Card } from "@gadget-wallet/ui";
import { motion } from "framer-motion";
import { Package, ShoppingCart, Users, DollarSign, TrendingUp, TrendingDown } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../../lib/api";

interface Stats {
  totalProducts: number;
  totalOrders: number;
  totalUsers: number;
  revenue: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats>({ totalProducts: 0, totalOrders: 0, totalUsers: 0, revenue: 0 });

  useEffect(() => {
    api.get("/admin/dashboard").then((res) => setStats(res.data.data));
  }, []);

  const cards = [
    { label: "Total Products", value: stats.totalProducts, icon: Package, change: "+12%", up: true },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, change: "+8%", up: true },
    { label: "Total Users", value: stats.totalUsers, icon: Users, change: "+23%", up: true },
    { label: "Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, change: "+15%", up: true },
  ];

  return (
    <Container className="py-10">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-display font-bold mb-8">Admin Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {cards.map((card, i) => {
            const Icon = card.icon;
            return (
              <motion.div key={card.label} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <Card className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <Icon className="w-8 h-8 text-gw-accent" />
                    <span className={`flex items-center text-sm ${card.up ? "text-green-400" : "text-red-400"}`}>
                      {card.up ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                      {card.change}
                    </span>
                  </div>
                  <p className="text-2xl font-bold">{card.value}</p>
                  <p className="text-sm text-gw-text-secondary">{card.label}</p>
                </Card>
              </motion.div>
            );
          })}
        </div>

        <Card className="p-6 mb-6">
          <h2 className="font-semibold text-lg mb-4">Recent Orders</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gw-text-secondary border-b border-white/10">
                  <th className="text-left py-3 px-2">Order ID</th>
                  <th className="text-left py-3 px-2">Status</th>
                  <th className="text-right py-3 px-2">Total</th>
                  <th className="text-right py-3 px-2">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-2">ORD-001</td>
                  <td className="py-3 px-2"><span className="px-2 py-0.5 rounded-full text-xs bg-green-500/20 text-green-400">Delivered</span></td>
                  <td className="py-3 px-2 text-right">$1,099.99</td>
                  <td className="py-3 px-2 text-right">2024-01-20</td>
                </tr>
                <tr className="border-b border-white/5">
                  <td className="py-3 px-2">ORD-002</td>
                  <td className="py-3 px-2"><span className="px-2 py-0.5 rounded-full text-xs bg-purple-500/20 text-purple-400">Shipped</span></td>
                  <td className="py-3 px-2 text-right">$349.99</td>
                  <td className="py-3 px-2 text-right">2024-01-19</td>
                </tr>
              </tbody>
            </table>
          </div>
        </Card>
      </motion.div>
    </Container>
  );
}
