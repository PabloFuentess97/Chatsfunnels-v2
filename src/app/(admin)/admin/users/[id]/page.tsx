"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { formatDate, formatNumber } from "@/lib/utils";

interface UserDetail {
  id: string;
  name: string | null;
  email: string;
  role: string;
  credits: number;
  createdAt: string;
  _count: { funnels: number; clicks: number; landingPages: number; groups: number };
  creditHistory: { id: string; amount: number; type: string; description: string | null; createdAt: string }[];
  funnels: { id: string; name: string; slug: string; isActive: boolean; _count: { clicks: number; links: number } }[];
}

export default function AdminUserDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [creditAmount, setCreditAmount] = useState("");
  const [creditDesc, setCreditDesc] = useState("");

  const fetchUser = () => {
    fetch(`/api/admin/users/${params.id}`)
      .then((r) => r.json())
      .then((r) => { if (r.success) setUser(r.data); else router.push("/admin/users"); setLoading(false); })
      .catch(() => { router.push("/admin/users"); setLoading(false); });
  };

  useEffect(() => { fetchUser(); }, [params.id]);

  const adjustCredits = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseInt(creditAmount);
    if (isNaN(amount) || amount === 0) return;
    await fetch(`/api/admin/users/${params.id}/credits`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount, description: creditDesc }),
    });
    setCreditAmount("");
    setCreditDesc("");
    fetchUser();
  };

  if (loading) return <div className="flex justify-center py-20"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin" /></div>;
  if (!user) return null;

  return (
    <div className="space-y-6">
      <button onClick={() => router.push("/admin/users")} className="text-sm text-gray-500 hover:text-white transition-colors">&larr; Volver a usuarios</button>

      <div className="flex items-center gap-4">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xl font-bold">
          {(user.name || "U")[0].toUpperCase()}
        </div>
        <div>
          <h1 className="text-xl font-bold text-white">{user.name || "Sin nombre"}</h1>
          <p className="text-sm text-gray-400">{user.email}</p>
        </div>
        <span className={`ml-2 text-xs font-medium px-3 py-1 rounded-full ${user.role === "ADMIN" ? "bg-violet-500/10 text-violet-400" : "bg-gray-800 text-gray-400"}`}>{user.role}</span>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Creditos", value: formatNumber(user.credits) },
          { label: "Funnels", value: user._count.funnels },
          { label: "Clicks", value: formatNumber(user._count.clicks) },
          { label: "Paginas", value: user._count.landingPages },
        ].map((s) => (
          <div key={s.label} className="bg-gray-900 border border-gray-800 rounded-xl p-4">
            <p className="text-[11px] text-gray-500 uppercase tracking-wider">{s.label}</p>
            <p className="text-xl font-bold text-white mt-1">{s.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-white mb-3">Ajustar Creditos</h2>
        <form onSubmit={adjustCredits} className="flex gap-2">
          <input type="number" value={creditAmount} onChange={(e) => setCreditAmount(e.target.value)} placeholder="Cantidad (+/-)" className="w-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white" required />
          <input type="text" value={creditDesc} onChange={(e) => setCreditDesc(e.target.value)} placeholder="Descripcion (opcional)" className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white" />
          <button type="submit" className="px-4 py-2 bg-violet-600 text-white rounded-lg text-sm font-medium hover:bg-violet-700 transition-colors">Aplicar</button>
        </form>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        <div className="px-5 py-3 border-b border-gray-800">
          <h2 className="text-sm font-semibold text-white">Historial de Creditos</h2>
        </div>
        {user.creditHistory.length === 0 ? (
          <p className="px-5 py-6 text-sm text-gray-500 text-center">Sin transacciones</p>
        ) : (
          <div className="divide-y divide-gray-800/50">
            {user.creditHistory.map((c) => (
              <div key={c.id} className="px-5 py-2.5 flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-300">{c.description || c.type}</p>
                  <p className="text-xs text-gray-600">{formatDate(c.createdAt)}</p>
                </div>
                <span className={`text-sm font-semibold ${c.amount > 0 ? "text-green-400" : "text-red-400"}`}>
                  {c.amount > 0 ? "+" : ""}{c.amount}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {user.funnels.length > 0 && (
        <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
          <div className="px-5 py-3 border-b border-gray-800">
            <h2 className="text-sm font-semibold text-white">Funnels del Usuario</h2>
          </div>
          <div className="divide-y divide-gray-800/50">
            {user.funnels.map((f) => (
              <div key={f.id} className="px-5 py-3 flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-white">{f.name}</p>
                  <p className="text-xs text-gray-500">/r/{f.slug}</p>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{f._count.links} enlaces</span>
                  <span>{f._count.clicks} clicks</span>
                  <span className={f.isActive ? "text-green-400" : "text-gray-600"}>{f.isActive ? "Activo" : "Inactivo"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
