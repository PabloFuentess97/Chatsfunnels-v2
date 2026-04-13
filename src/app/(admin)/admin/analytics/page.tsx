"use client";

import { useEffect, useState } from "react";
import { formatNumber } from "@/lib/utils";

interface Stats {
  totalUsers: number;
  totalFunnels: number;
  totalClicks: number;
  totalPages: number;
  activeUsers: number;
  totalCredits: number;
}

export default function AdminAnalyticsPage() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    fetch("/api/admin/stats")
      .then((r) => r.json())
      .then((r) => { if (r.success) setStats(r.data); });
  }, []);

  if (!stats) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;

  const metrics = [
    { label: "Usuarios Registrados", value: stats.totalUsers, desc: "Total de cuentas creadas" },
    { label: "Usuarios Activos", value: stats.activeUsers, desc: "Usuarios con al menos 1 funnel" },
    { label: "Funnels Creados", value: stats.totalFunnels, desc: "Total de funnels en el sistema" },
    { label: "Clicks Registrados", value: stats.totalClicks, desc: "Total de clicks procesados" },
    { label: "Landing Pages", value: stats.totalPages, desc: "Paginas creadas con el builder" },
    { label: "Creditos en Circulacion", value: stats.totalCredits, desc: "Suma de creditos de todos los usuarios" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Analiticas Globales</h1>
        <p className="text-gray-400 text-sm mt-1">Metricas generales de la plataforma</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {metrics.map((m) => (
          <div key={m.label} className="bg-gray-900 border border-gray-800 rounded-2xl p-5 hover:border-gray-700 transition-colors">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">{m.label}</p>
            <p className="text-3xl font-bold text-white mt-2">{formatNumber(m.value)}</p>
            <p className="text-xs text-gray-600 mt-1">{m.desc}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
