import { Container } from "@gadget-wallet/ui";
import { Package, ShoppingCart, Users, DollarSign, TrendingUp } from "lucide-react";
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
    { label: "Total Products", value: stats.totalProducts, icon: Package, change: "+12%" },
    { label: "Total Orders", value: stats.totalOrders, icon: ShoppingCart, change: "+8%" },
    { label: "Total Users", value: stats.totalUsers, icon: Users, change: "+23%" },
    { label: "Revenue", value: `$${stats.revenue.toLocaleString()}`, icon: DollarSign, change: "+15%" },
  ];

  return (
    <section className="gw-section">
      <Container>
        <h2 className="text-2xl md:text-3xl font-bold text-gw-black mb-8">Admin Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="gw-panel-light p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-full bg-gw-red/10 flex items-center justify-center">
                    <Icon className="w-6 h-6 text-gw-red" />
                  </div>
                  <span className="flex items-center text-sm text-gw-green font-medium">
                    <TrendingUp className="w-4 h-4 mr-1" />{card.change}
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-gw-black">{card.value}</p>
                <p className="text-sm text-gw-gray-500">{card.label}</p>
              </div>
            );
          })}
        </div>

        <div className="gw-panel-light p-6">
          <h3 className="font-semibold text-lg text-gw-black mb-4">Recent Orders</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-gw-gray-500 border-b border-gw-border">
                  <th className="text-left py-3 px-2 font-medium">Order ID</th>
                  <th className="text-left py-3 px-2 font-medium">Status</th>
                  <th className="text-right py-3 px-2 font-medium">Total</th>
                  <th className="text-right py-3 px-2 font-medium">Date</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-gw-border/50">
                  <td className="py-3 px-2 font-medium text-gw-black">ORD-001</td>
                  <td className="py-3 px-2"><span className="gw-status-badge--compact bg-green-100 text-green-700">Delivered</span></td>
                  <td className="py-3 px-2 text-right text-gw-black">$1,099.99</td>
                  <td className="py-3 px-2 text-right text-gw-gray-500">2024-01-20</td>
                </tr>
                <tr className="border-b border-gw-border/50">
                  <td className="py-3 px-2 font-medium text-gw-black">ORD-002</td>
                  <td className="py-3 px-2"><span className="gw-status-badge--compact bg-gray-100 text-gray-600">Shipped</span></td>
                  <td className="py-3 px-2 text-right text-gw-black">$349.99</td>
                  <td className="py-3 px-2 text-right text-gw-gray-500">2024-01-19</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </Container>
    </section>
  );
}
