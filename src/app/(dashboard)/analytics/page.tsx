"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/card";

interface FunnelOption {
  id: string;
  name: string;
  _count: { clicks: number };
}

interface AnalyticsData {
  totalClicks: number;
  clicksByDay: { date: string; count: number }[];
  clicksByCountry: { country: string; count: number }[];
  clicksByDevice: { device: string; count: number }[];
  topLinks: { url: string; clicks: number }[];
}

export default function AnalyticsPage() {
  const [funnels, setFunnels] = useState<FunnelOption[]>([]);
  const [selectedFunnel, setSelectedFunnel] = useState<string>("");
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("/api/funnels")
      .then((r) => r.json())
      .then((r) => { if (r.success) setFunnels(r.data); });
  }, []);

  useEffect(() => {
    if (!selectedFunnel) { setAnalytics(null); return; }
    setLoading(true);
    fetch(`/api/analytics/${selectedFunnel}`)
      .then((r) => r.json())
      .then((r) => { if (r.success) setAnalytics(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [selectedFunnel]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Track your funnel performance</p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Select Funnel</label>
        <select
          value={selectedFunnel}
          onChange={(e) => setSelectedFunnel(e.target.value)}
          className="px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500 min-w-[300px]"
        >
          <option value="">Choose a funnel...</option>
          {funnels.map((f) => (
            <option key={f.id} value={f.id}>{f.name} ({f._count.clicks} clicks)</option>
          ))}
        </select>
      </div>

      {loading && <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />}

      {analytics && (
        <div className="space-y-6">
          <Card>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">Total Clicks</h2>
            <p className="text-4xl font-bold text-blue-600">{analytics.totalClicks}</p>
          </Card>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Clicks by Day</h2>
              {analytics.clicksByDay.length > 0 ? (
                <div className="space-y-2">
                  {analytics.clicksByDay.map((item) => (
                    <div key={item.date} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.date}</span>
                      <div className="flex items-center gap-2">
                        <div className="h-2 bg-blue-500 rounded" style={{ width: `${Math.max(20, (item.count / Math.max(...analytics.clicksByDay.map((d) => d.count))) * 200)}px` }} />
                        <span className="text-sm font-medium text-gray-900 dark:text-white w-12 text-right">{item.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No data yet</p>
              )}
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Clicks by Country</h2>
              {analytics.clicksByCountry.length > 0 ? (
                <div className="space-y-2">
                  {analytics.clicksByCountry.map((item) => (
                    <div key={item.country} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400">{item.country}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{item.count}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No data yet</p>
              )}
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Clicks by Device</h2>
              {analytics.clicksByDevice.length > 0 ? (
                <div className="space-y-3">
                  {analytics.clicksByDevice.map((item) => {
                    const pct = analytics.totalClicks > 0 ? Math.round((item.count / analytics.totalClicks) * 100) : 0;
                    return (
                      <div key={item.device}>
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-sm text-gray-600 dark:text-gray-400">{item.device}</span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">{pct}%</span>
                        </div>
                        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                          <div className="bg-blue-500 h-2 rounded-full" style={{ width: `${pct}%` }} />
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No data yet</p>
              )}
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Top Links</h2>
              {analytics.topLinks.length > 0 ? (
                <div className="space-y-2">
                  {analytics.topLinks.map((link, i) => (
                    <div key={i} className="flex items-center justify-between">
                      <span className="text-sm text-gray-600 dark:text-gray-400 truncate max-w-[250px]">{link.url}</span>
                      <span className="text-sm font-medium text-gray-900 dark:text-white">{link.clicks}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">No links yet</p>
              )}
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
