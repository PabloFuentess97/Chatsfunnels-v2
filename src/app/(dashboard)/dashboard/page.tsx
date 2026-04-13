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
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 dark:bg-gray-800 rounded w-48 animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-[120px] bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          ))}
        </div>
        <div className="h-[350px] bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="h-[300px] bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
          <div className="h-[300px] bg-gray-200 dark:bg-gray-800 rounded-xl animate-pulse" />
        </div>
      </div>
    );
  }

  if (!data) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-gray-500 dark:text-gray-400">Failed to load dashboard data.</p>
      </div>
    );
  }

  const chartData = data.recentClicks.map((item) => ({
    date: item.date.slice(5), // "MM-DD"
    clicks: item.count,
  }));

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Your ChatsFunnels overview</p>
        </div>
        <Link href="/funnels">
          <button className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 transition-colors">
            Create Funnel
          </button>
        </Link>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Funnels"
          value={formatNumber(data.totalFunnels)}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>}
        />
        <StatCard
          title="Total Clicks"
          value={formatNumber(data.totalClicks)}
          trend={data.clicksTrend !== 0 ? { value: Math.abs(data.clicksTrend), positive: data.clicksTrend > 0 } : undefined}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" /></svg>}
        />
        <StatCard
          title="Active Links"
          value={formatNumber(data.totalLinks)}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>}
        />
        <StatCard
          title="Credits"
          value={formatNumber(data.credits)}
          icon={<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
        />
      </div>

      {/* Clicks Over Time - Area Chart */}
      <Card>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Click Trend</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400">Last 30 days performance</p>
          </div>
          {data.clicksTrend !== 0 && (
            <span className={`text-sm font-medium px-2.5 py-1 rounded-full ${data.clicksTrend > 0 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
              {data.clicksTrend > 0 ? "+" : ""}{data.clicksTrend}% vs prev. period
            </span>
          )}
        </div>
        {chartData.length > 0 ? (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={chartData}>
              <defs>
                <linearGradient id="clickGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} />
              <XAxis dataKey="date" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }}
                labelStyle={{ color: "#9ca3af" }}
              />
              <Area type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} fill="url(#clickGradient)" />
            </AreaChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[300px] flex items-center justify-center text-gray-500 dark:text-gray-400">
            <div className="text-center">
              <svg className="w-12 h-12 mx-auto mb-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
              <p>No click data yet. Share your funnel links to start tracking!</p>
            </div>
          </div>
        )}
      </Card>

      {/* Second Row: Device Pie + Country Bar */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Device Distribution */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Device Distribution</h2>
          {data.clicksByDevice.length > 0 ? (
            <div className="flex items-center gap-4">
              <ResponsiveContainer width="50%" height={220}>
                <PieChart>
                  <Pie
                    data={data.clicksByDevice}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    dataKey="count"
                    nameKey="device"
                    strokeWidth={0}
                  >
                    {data.clicksByDevice.map((_, index) => (
                      <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="flex-1 space-y-3">
                {data.clicksByDevice.map((item, i) => {
                  const total = data.clicksByDevice.reduce((s, d) => s + d.count, 0);
                  const pct = total > 0 ? Math.round((item.count / total) * 100) : 0;
                  return (
                    <div key={item.device} className="flex items-center gap-3">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-sm text-gray-600 dark:text-gray-400 flex-1">{item.device}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">No device data yet</p>
          )}
        </Card>

        {/* Top Countries */}
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Countries</h2>
          {data.clicksByCountry.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={data.clicksByCountry} layout="vertical" margin={{ left: 60 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" opacity={0.3} horizontal={false} />
                <XAxis type="number" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis dataKey="country" type="category" tick={{ fill: "#9ca3af", fontSize: 12 }} axisLine={false} tickLine={false} width={55} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1f2937", border: "1px solid #374151", borderRadius: "8px", color: "#fff" }}
                />
                <Bar dataKey="count" fill="#8b5cf6" radius={[0, 4, 4, 0]} barSize={18} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-gray-500 dark:text-gray-400 py-8 text-center">No country data yet</p>
          )}
        </Card>
      </div>

      {/* Top Funnels Table */}
      <Card>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Top Funnels</h2>
          <Link href="/funnels" className="text-sm text-blue-500 hover:text-blue-400">View all</Link>
        </div>
        {data.topFunnels.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 dark:border-gray-700">
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3">Funnel</th>
                  <th className="text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3">Status</th>
                  <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3">Links</th>
                  <th className="text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider pb-3">Clicks</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {data.topFunnels.map((funnel) => (
                  <tr key={funnel.id} className="group">
                    <td className="py-3">
                      <Link href={`/funnels/${funnel.id}`} className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors">
                        {funnel.name}
                      </Link>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-0.5">/r/{funnel.slug}</p>
                    </td>
                    <td className="py-3">
                      <Badge variant={funnel.isActive ? "success" : "default"}>
                        {funnel.isActive ? "Active" : "Inactive"}
                      </Badge>
                    </td>
                    <td className="py-3 text-right text-sm text-gray-600 dark:text-gray-400">{funnel.links}</td>
                    <td className="py-3 text-right text-sm font-semibold text-gray-900 dark:text-white">{formatNumber(funnel.clicks)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-6">No funnels created yet. Create your first funnel to see data here.</p>
        )}
      </Card>
    </div>
  );
}
