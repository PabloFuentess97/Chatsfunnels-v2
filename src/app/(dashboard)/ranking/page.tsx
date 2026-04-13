"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/card";

interface RankingData {
  topUsers: { id: string; name: string | null; _count: { funnels: number } }[];
  topFunnels: { id: string; name: string; slug: string; user: { name: string | null }; _count: { clicks: number } }[];
}

export default function RankingPage() {
  const [data, setData] = useState<RankingData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/ranking")
      .then((r) => r.json())
      .then((r) => { if (r.success) setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ranking</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Los mejores usuarios y funnels</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mejores Usuarios</h2>
          {data && data.topUsers.length > 0 ? (
            <div className="space-y-3">
              {data.topUsers.map((user, i) => (
                <div key={user.id} className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < 3 ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{user.name || "Anonimo"}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{user._count.funnels} funnels</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Sin datos aun</p>
          )}
        </Card>

        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Mejores Funnels</h2>
          {data && data.topFunnels.length > 0 ? (
            <div className="space-y-3">
              {data.topFunnels.map((funnel, i) => (
                <div key={funnel.id} className="flex items-center gap-3">
                  <span className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${i < 3 ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                    {i + 1}
                  </span>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{funnel.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">por {funnel.user.name || "Anonimo"} - {funnel._count.clicks} clicks</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-gray-500">Sin datos aun</p>
          )}
        </Card>
      </div>
    </div>
  );
}
