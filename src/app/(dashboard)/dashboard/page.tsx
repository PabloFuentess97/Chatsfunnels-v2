"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from "recharts";
import StatCard from "@/components/ui/stat-card";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"];

interface DashboardData {
  totalFunnels: number;
  totalClicks: number;
  totalLinks: number;
  credits: number;
  clicksTrend: number;
  recentClicks: { date: string; count: number }[];
  topFunnels: { id: string; name: string; slug: string; isActive: boolean; clicks: number; links: number }[];
  clicksByDevice: { device: string; count: number }[];
  clicksByCountry: { country: string; count: number }[];
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/analytics")
      .then((res) => res.json())
      .then((res) => {
        if (res.success) setData(res.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-64 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[120px] bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-[380px] bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[320px] bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-[320px] bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <svg className="w-16 h-16 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.694-.833-3.464 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
        </svg>
        <p className="text-gray-500 dark:text-gray-400 text-lg">No se pudieron cargar los datos del panel.</p>
        <button onClick={() => window.location.reload()} className="text-sm text-blue-500 hover:text-blue-400 font-medium">
          Intentar de nuevo
        </button>
      </div>
    );
  }

  const hasAnyData = data.totalClicks > 0 || data.totalFunnels > 0;

  const chartData = data.recentClicks.map((item) => ({
    date: item.date.slice(5),
    clicks: item.count,
  }));

  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Bienvenido</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Resumen general de tu cuenta ChatsFunnels</p>
        </div>
        <Link href="/funnels">
          <button className="bg-blue-600 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors shadow-sm shadow-blue-600/20">
            Crear Funnel
          </button>
        </Link>
      </div>

      {/* Estado vacio global */}
      {!hasAnyData && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl p-6 text-center">
          <svg className="w-12 h-12 mx-auto mb-3 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
          <p className="text-blue-800 dark:text-blue-300 font-medium text-base">
            Aun no tienes datos. Crea un funnel y comparte tu enlace para empezar a recibir trafico.
          </p>
          <Link href="/funnels">
            <button className="mt-4 bg-blue-600 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
              Crear Funnel
            </button>
          </Link>
        </div>
      )}

      {/* Tarjetas de estadisticas */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Funnels Activos"
          value={formatNumber(data.totalFunnels)}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>}
        />
        <StatCard
          title="Clicks Totales"
          value={formatNumber(data.totalClicks)}
          trend={data.clicksTrend !== 0 ? { value: Math.abs(data.clicksTrend), positive: data.clicksTrend > 0 } : undefined}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>}
        />
        <StatCard
          title="Enlaces Activos"
          value={formatNumber(data.totalLinks)}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
        />
        <StatCard
          title="Creditos Disponibles"
          value={formatNumber(data.credits)}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Tendencia de Clicks - Grafico de area */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Tendencia de Clicks</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Rendimiento de los ultimos 30 dias</p>
          </div>
          {data.clicksTrend !== 0 && (
            <span className={`text-sm font-medium px-3 py-1.5 rounded-full ${data.clicksTrend > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
              {data.clicksTrend > 0 ? "+" : ""}{data.clicksTrend}% vs periodo anterior
            </span>
          )}
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={320}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} />
              <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "10px", color: "#fff", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.3)" }}
                labelStyle={{ color: "#9ca3af", marginBottom: "4px" }}
                formatter={(value) => [formatNumber(Number(value)), "Clicks"]}
              />
              <Area type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2.5} fill="url(#clickGradient)" dot={false} activeDot={{ r: 5, strokeWidth: 2, stroke: "#3b82f6", fill: "#fff" }} />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[320px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <svg className="w-14 h-14 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <p className="text-sm font-medium mb-1">Sin datos de clicks todavia</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">Comparte tus enlaces de funnel para comenzar a rastrear</p>
            </div>
          </div>
        )}
      </Card>

      {/* Segunda fila: Dispositivos + Paises */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Dispositivos */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Dispositivos</h2>
          {data.clicksByDevice.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width="50%" height={240}>
                <PieChart>
                  <Pie
                    data={data.clicksByDevice}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    dataKey="count"
                    nameKey="device"
                    strokeWidth={0}
                  >
                    {data.clicksByDevice.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "10px", color: "#fff", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.3)" }}
                    formatter={(value) => [formatNumber(Number(value)), "Visitas"]}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-4">
                {data.clicksByDevice.map((item, i) => {
                  const total = data.clicksByDevice.reduce((s, d) => s + d.count, 0);
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  return (
                    <div key={item.device} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full flex-shrink-0" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{item.device}</span>
                      <span className="text-sm font-semibold text-gray-900 dark:text-white">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="py-10 text-center">
              <svg className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sin datos de dispositivos todavia</p>
            </div>
          )}
        </Card>

        {/* Paises Principales */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-5">Paises Principales</h2>
          {data.clicksByCountry.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={data.clicksByCountry} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.2} horizontal={false} />
                <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="country" type="category" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} width={55} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "10px", color: "#fff", boxShadow: "0 4px 6px -1px rgba(0,0,0,0.3)" }}
                  formatter={(value) => [formatNumber(Number(value)), "Clicks"]}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 6, 6, 0]} barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="py-10 text-center">
              <svg className="w-10 h-10 mx-auto mb-3 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-500 dark:text-gray-400">Sin datos de paises todavia</p>
            </div>
          )}
        </Card>
      </div>

      {/* Actividad Reciente - Tabla de Mejores Funnels */}
      <Card>
        <div className="flex items-center justify-between mb-5">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Mejores Funnels</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">Actividad Reciente</p>
          </div>
          <Link href="/funnels" className="text-sm text-blue-500 hover:text-blue-400 font-medium transition-colors">Ver todos</Link>
        </div>
        {data.topFunnels.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3">Funnel</th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3">Estado</th>
                  <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3">Enlaces</th>
                  <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3">Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {data.topFunnels.map((funnel) => (
                  <tr key={funnel.id} className="group hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="py-3.5">
                      <Link href={`/funnels/${funnel.id}`} className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                        {funnel.name}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">/r/{funnel.slug}</p>
                    </td>
                    <td className="py-3.5">
                      <Badge variant={funnel.isActive ? "success" : "default"}>
                        {funnel.isActive ? "Activo" : "Inactivo"}
                      </Badge>
                    </td>
                    <td className="py-3.5 text-right text-sm text-gray-600 dark:text-gray-400">{funnel.links}</td>
                    <td className="py-3.5 text-right text-sm font-semibold text-gray-900 dark:text-white">{formatNumber(funnel.clicks)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-10">
            <svg className="w-12 h-12 mx-auto mb-4 text-gray-300 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium mb-1">No tienes funnels creados todavia</p>
            <p className="text-xs text-gray-400 dark:text-gray-500">Crea tu primer funnel para ver los datos aqui</p>
          </div>
        )}
      </Card>
    </div>
  );
}
