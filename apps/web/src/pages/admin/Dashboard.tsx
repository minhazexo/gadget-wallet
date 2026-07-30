import { Container } from "@gadget-wallet/ui";
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
    <Container className="py-8">
      <div>
        <h2 className="text-2xl font-bold text-gw-black mb-8">Admin Dashboard</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="bg-white border border-gw-border rounded-[24px] p-6 hover:shadow-gw-sm transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-gw-red/10 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-gw-red" />
                  </div>
                  <span className={`flex items-center text-sm font-medium ${card.up ? "text-gw-green" : "text-gw-red"}`}>
                    {card.up ? <TrendingUp className="w-4 h-4 mr-1" /> : <TrendingDown className="w-4 h-4 mr-1" />}
                    {card.change}
                  </span>
                </div>
                <p className="text-2xl font-extrabold text-gw-black">{card.value}</p>
                <p className="text-sm text-gw-gray-500">{card.label}</p>
              </div>
            );
          })}
        </div>

        <div className="bg-white border border-gw-border rounded-[24px] p-6">
          <h3 className="text-lg font-semibold text-gw-black mb-4">Recent Orders</h3>
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
                <tr className="border-b border-gw-border">
                  <td className="py-3 px-2 text-gw-black font-medium">ORD-001</td>
                  <td className="py-3 px-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gw-green/10 text-gw-green">Delivered</span>
                  </td>
                  <td className="py-3 px-2 text-right text-gw-black">$1,099.99</td>
                  <td className="py-3 px-2 text-right text-gw-gray-500">2024-01-20</td>
                </tr>
                <tr className="border-b border-gw-border">
                  <td className="py-3 px-2 text-gw-black font-medium">ORD-002</td>
                  <td className="py-3 px-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-purple-500/10 text-purple-600">Shipped</span>
                  </td>
                  <td className="py-3 px-2 text-right text-gw-black">$349.99</td>
                  <td className="py-3 px-2 text-right text-gw-gray-500">2024-01-19</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </Container>
  );
}
