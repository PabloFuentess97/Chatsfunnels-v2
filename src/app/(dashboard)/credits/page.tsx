"use client";

import { useEffect, useState } from "react";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

interface CreditEntry {
  id: string;
  amount: number;
  type: string;
  description: string;
  createdAt: string;
}

export default function CreditsPage() {
  const [balance, setBalance] = useState(0);
  const [history, setHistory] = useState<CreditEntry[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/credits")
      .then((r) => r.json())
      .then((r) => {
        if (r.success) {
          setBalance(r.data.balance);
          setHistory(r.data.history);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Creditos</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Gestiona tu saldo de creditos</p>
      </div>

      <Card>
        <p className="text-sm text-gray-500 dark:text-gray-400">Saldo Actual</p>
        <p className="text-4xl font-bold text-blue-600 mt-1">{balance} creditos</p>
        <p className="text-xs text-gray-400 mt-2">Los creditos se consumen por click (1), por crear funnel (10) y por participar en rondas (5).</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Historial de Transacciones</h2>
        {history.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-4">Sin transacciones aun</p>
        ) : (
          <div className="space-y-2">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div>
                  <p className="text-sm text-gray-900 dark:text-white">{entry.description}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(entry.createdAt)}</p>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={entry.amount > 0 ? "success" : "danger"}>
                    {entry.amount > 0 ? "+" : ""}{entry.amount}
                  </Badge>
                  <Badge>{entry.type}</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
