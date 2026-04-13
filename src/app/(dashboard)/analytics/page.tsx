"use client";

import { useEffect, useState, useCallback } from "react";
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
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { formatNumber, formatDate } from "@/lib/utils";

const COLORS = ["#3b82f6", "#8b5cf6", "#06b6d4", "#10b981", "#f59e0b", "#ef4444", "#ec4899", "#6366f1"];

interface FunnelOption {
  id: string;
  name: string;
  _count: { clicks: number };
}

interface AnalyticsData {
  totalClicks: number;
  previousClicks: number;
  trend: number;
  clicksByDay: { date: string; count: number }[];
  clicksByHour: { hour: number; label: string; count: number }[];
  clicksByCountry: { country: string; count: number }[];
  clicksByDevice: { device: string; count: number }[];
  clicksByBrowser: { browser: string; count: number }[];
  clicksByOS: { os: string; count: number }[];
  topLinks: { id: string; url: string; clicks: number; weight: number; priority: number }[];
  recentClicks: { id: string; ip: string | null; country: string | null; device: string | null; browser: string | null; referer: string | null; url: string; createdAt: string }[];
}

function maskIp(ip: string | null): string {
  if (!ip) return "---";
  const parts = ip.split(".");
  if (parts.length === 4) return `${parts[0]}.${parts[1]}.*.*`;
  return ip.slice(0, 8) + "...";
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "ahora";
  if (mins < 60) return `hace ${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `hace ${hrs}h`;
  return `hace ${Math.floor(hrs / 24)}d`;
}

export default function AnalyticsPage() {
  const [funnels, setFunnels] = useState<FunnelOption[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<string>("");
  const [days, setDays] = useState(30);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/funnels")
      .then((r) => r.json())
      .then((r) => {
        if (r.success) setFunnels(r.data);
      });
  }, []);

  const fetchAnalytics = useCallback(() => {
    if (!selectedFunnel) {
      setAnalytics(null);
      return;
    }
    setLoading(true);
    fetch(`/api/analytics/${selectedFunnel}?days=${days}`)
      .then((r) => r.json())
      .then((r) => {
        if (r.success) setAnalytics(r.data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [selectedFunnel, days]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analiticas</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Informacion detallada sobre el rendimiento de tus funnels</p>
        </div>
        <div className="flex items-center gap-3 flex-wrap">
          <select
            value={selectedFunnel}
            onChange={(e) => setSelectedFunnel(e.target.value)}
            className="px-3 py-2 border rounded-lg text-sm text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-700 focus:ring-2 focus:ring-blue-500 min-w-[200px]"
          >
            <option value="">Selecciona un funnel...</option>
            {funnels.map((f) => (
              <option key={f.id} value={f.id}>
                {f.name} ({f._count.clicks})
              </option>
            ))}
          </select>
          <div className="flex bg-gray-100 dark:bg-gray-800 rounded-lg p-0.5">
            {[7, 14, 30, 90].map((d) => (
              <button
                key={d}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${days === d ? "bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm" : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"}`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>
      </div>

      {!selectedFunnel && (
        <Card>
          <div className="text-center py-16">
            <svg className="w-16 h-16 mx-auto mb-4 text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 dark:text-white">Selecciona un funnel para ver las analiticas</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1">Elige del selector de arriba</p>
          </div>
        </Card>
      )}

      {loading && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[...Array(3)].map((_, i) => <div key={i} className="h-[100px] bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />)}
          </div>
          <div className="h-[350px] bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
      )}

      {analytics && !loading && (
        <>
          {/* Stat Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Clicks Totales</p>
              <div className="flex items-end gap-3 mt-1">
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{formatNumber(analytics.totalClicks)}</p>
                {analytics.trend !== 0 && (
                  <span className={`text-sm font-medium pb-1 ${analytics.trend > 0 ? "text-green-500" : "text-red-500"}`}>
                    {analytics.trend > 0 ? "+" : ""}{analytics.trend}%
                  </span>
                )}
              </div>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Periodo Anterior</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{formatNumber(analytics.previousClicks)}</p>
            </div>
            <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
              <p className="text-sm text-gray-500 dark:text-gray-400">Paises Alcanzados</p>
              <p className="text-3xl font-bold text-gray-900 dark:text-white mt-1">{analytics.clicksByCountry.length}</p>
            </div>
          </div>

          {/* Area Chart - Clicks Over Time */}
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Clicks en el Tiempo</h2>
            {analytics.clicksByDay.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <AreaChart data={analytics.clicksByDay.map((d) => ({ date: d.date.slice(5), clicks: d.count }))}>
                  <defs>
                    <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }} labelStyle={{ color: "#9ca3af" }} />
                  <Area type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} fill="url(#areaGrad)" />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-12">Sin datos para este periodo</p>
            )}
          </Card>

          {/* Row: Device + Browser */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Dispositivos</h2>
              {analytics.clicksByDevice.length > 0 ? (
                <div className="flex items-center">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie data={analytics.clicksByDevice} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="count" nameKey="device" strokeWidth={0}>
                        {analytics.clicksByDevice.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {analytics.clicksByDevice.map((item, i) => {
                      const pct = analytics.totalClicks > 0 ? Math.round((item.count / analytics.totalClicks) * 100) : 0;
                      return (
                        <div key={item.device} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex-1">{item.device}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-8 text-center">Sin datos aun</p>
              )}
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Navegadores</h2>
              {analytics.clicksByBrowser.length > 0 ? (
                <ResponsiveContainer width="100%" height={200}>
                  <BarChart data={analytics.clicksByBrowser}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                    <XAxis dataKey="browser" tick={{ fill: "#9ca3af", fontSize: 11 }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }} />
                    <Bar dataKey="count" radius={[4, 4, 0, 0]} barSize={28}>
                      {analytics.clicksByBrowser.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500 py-8 text-center">Sin datos aun</p>
              )}
            </Card>
          </div>

          {/* Row: Hourly Activity + OS */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Actividad por Hora</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={analytics.clicksByHour}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
                  <XAxis dataKey="label" tick={{ fill: "#9ca3af", fontSize: 10 }} axisLine={false} tickLine={false} interval={2} />
                  <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }} />
                  <Bar dataKey="count" fill="#06b6d4" radius={[2, 2, 0, 0]} barSize={12} />
                </BarChart>
              </ResponsiveContainer>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Sistema Operativo</h2>
              {analytics.clicksByOS.length > 0 ? (
                <div className="flex items-center">
                  <ResponsiveContainer width="50%" height={200}>
                    <PieChart>
                      <Pie data={analytics.clicksByOS} cx="50%" cy="50%" innerRadius={45} outerRadius={75} dataKey="count" nameKey="os" strokeWidth={0}>
                        {analytics.clicksByOS.map((_, i) => <Cell key={i} fill={COLORS[(i + 3) % COLORS.length]} />)}
                      </Pie>
                      <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="flex-1 space-y-2">
                    {analytics.clicksByOS.map((item, i) => {
                      const pct = analytics.totalClicks > 0 ? Math.round((item.count / analytics.totalClicks) * 100) : 0;
                      return (
                        <div key={item.os} className="flex items-center gap-2">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[(i + 3) % COLORS.length] }} />
                          <span className="text-sm text-gray-500 dark:text-gray-400 flex-1">{item.os}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{pct}%</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-8 text-center">Sin datos aun</p>
              )}
            </Card>
          </div>

          {/* Row: Countries + Top Links */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Paises Principales</h2>
              {analytics.clicksByCountry.length > 0 ? (
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart data={analytics.clicksByCountry} layout="vertical" margin={{ left: 50 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} horizontal={false} />
                    <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                    <YAxis dataKey="country" type="category" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} width={45} />
                    <Tooltip contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }} />
                    <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={16} />
                  </BarChart>
                </ResponsiveContainer>
              ) : (
                <p className="text-sm text-gray-500 py-8 text-center">Sin datos aun</p>
              )}
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mejores Enlaces</h2>
              {analytics.topLinks.length > 0 ? (
                <div className="space-y-3">
                  {analytics.topLinks.map((link, i) => {
                    const maxClicks = analytics.topLinks[0]?.clicks || 1;
                    const pct = Math.round((link.clicks / maxClicks) * 100);
                    return (
                      <div key={link.id}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[200px]" title={link.url}>{link.url}</span>
                          <div className="flex items-center gap-2">
                            <Badge variant="info">w:{link.weight}</Badge>
                            <span className="text-sm font-semibold text-gray-900 dark:text-white">{formatNumber(link.clicks)}</span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                          <div className="h-1.5 rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: COLORS[i % COLORS.length] }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500 py-8 text-center">Sin enlaces aun</p>
              )}
            </Card>
          </div>

          {/* Recent Clicks */}
          <Card>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Clicks Recientes</h2>
              <Badge variant="info">{analytics.recentClicks.length} ultimos</Badge>
            </div>
            {analytics.recentClicks.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-gray-200 dark:border-gray-700">
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase pb-2">IP</th>
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase pb-2">Pais</th>
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase pb-2">Dispositivo</th>
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase pb-2">Navegador</th>
                      <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase pb-2">Enlace</th>
                      <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase pb-2">Cuando</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                    {analytics.recentClicks.map((click) => (
                      <tr key={click.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30">
                        <td className="py-2 font-mono text-gray-600 dark:text-gray-400">{maskIp(click.ip)}</td>
                        <td className="py-2 text-gray-600 dark:text-gray-400">{click.country || "---"}</td>
                        <td className="py-2 text-gray-600 dark:text-gray-400">{click.device || "---"}</td>
                        <td className="py-2 text-gray-600 dark:text-gray-400">{click.browser || "---"}</td>
                        <td className="py-2 text-gray-600 dark:text-gray-400 truncate max-w-[200px]">{click.url}</td>
                        <td className="py-2 text-right text-gray-500 dark:text-gray-500 whitespace-nowrap">{timeAgo(click.createdAt)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">Sin clicks registrados aun</p>
            )}
          </Card>
        </>
      )}
    </div>
  );
}
