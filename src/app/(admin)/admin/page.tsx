"use client";

import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/utils";

interface AdminStats {
  totalUsers: number;
  totalFunnels: number;
  totalClicks: number;
  totalPages: number;
  activeUsers: number;
  totalCredits: number;
  recentUsers: { id: string; name: string | null; email: string; role: string; credits: number; createdAt: string; _count: { funnels: number } }[];
}

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((r) => { if (r.success) setStats(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-800 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => <div key={i} className="h-28 bg-gray-800/50 rounded-2xl animate-pulse" />)}
        </div>
      </div>
    );
  }

  if (!stats) return <p className="text-gray-400">Error al cargar datos.</p>;

  const cards = [
    { label: "Usuarios Totales", value: formatNumber(stats.totalUsers), color: "from-blue-500 to-cyan-500" },
    { label: "Usuarios Activos", value: formatNumber(stats.activeUsers), color: "from-green-500 to-emerald-500" },
    { label: "Funnels Totales", value: formatNumber(stats.totalFunnels), color: "from-violet-500 to-purple-500" },
    { label: "Clicks Totales", value: formatNumber(stats.totalClicks), color: "from-orange-500 to-amber-500" },
    { label: "Landing Pages", value: formatNumber(stats.totalPages), color: "from-pink-500 to-rose-500" },
    { label: "Creditos en Sistema", value: formatNumber(stats.totalCredits), color: "from-yellow-500 to-orange-500" },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-white">Panel de Administracion</h1>
        <p className="text-gray-400 mt-1 text-sm">Vista general del sistema</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {cards.map((card) => (
          <div key={card.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{card.label}</p>
            <p className={`mt-2 text-3xl font-bold bg-gradient-to-r ${card.color} bg-clip-text text-transparent`}>
              {card.value}
            </p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">Usuarios Recientes</h2>
        </div>
        <div className="divide-y divide-gray-800/50">
          {stats.recentUsers.map((user) => (
            <div key={user.id} className="px-5 py-3 flex items-center justify-between hover:bg-gray-800/30 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold">
                  {(user.name || "U")[0].toUpperCase()}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user.name || "Sin nombre"}</p>
                  <p className="text-xs text-gray-500">{user.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${user.role === "ADMIN" ? "bg-violet-500/10 text-violet-400" : "bg-gray-800 text-gray-400"}`}>
                  {user.role}
                </span>
                <span className="text-xs text-gray-500">{user._count.funnels} funnels</span>
                <span className="text-xs text-gray-500">{user.credits} creditos</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
