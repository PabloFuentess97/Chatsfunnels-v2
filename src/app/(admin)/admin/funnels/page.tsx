"use client";

import { useEffect, useState, useCallback } from "react";
import { formatDate } from "@/lib/utils";

interface FunnelItem {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  user: { name: string | null; email: string };
  _count: { clicks: number; links: number };
}

export default function AdminFunnelsPage() {
  const [funnels, setFunnels] = useState<FunnelItem[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchFunnels = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/funnels?search=${encodeURIComponent(search)}&page=${page}`)
      .then((r) => r.json())
      .then((r) => {
        if (r.success) { setFunnels(r.data.funnels); setTotal(r.data.total); setTotalPages(r.data.totalPages); }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { fetchFunnels(); }, [fetchFunnels]);

  const deleteFunnel = async (id: string) => {
    if (!confirm("Eliminar este funnel y todos sus datos?")) return;
    await fetch(`/api/admin/funnels/${id}`, { method: "DELETE" });
    fetchFunnels();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Funnels</h1>
          <p className="text-gray-400 text-sm mt-1">Todos los funnels de la plataforma</p>
        </div>
        <span className="text-sm text-gray-500">{total} funnels</span>
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchFunnels(); }} className="flex gap-2">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o slug..." className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
        <button type="submit" className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors">Buscar</button>
      </form>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : funnels.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No se encontraron funnels</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Funnel</th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Propietario</th>
                    <th className="text-center text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Estado</th>
                    <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Enlaces</th>
                    <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Clicks</th>
                    <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Creado</th>
                    <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {funnels.map((f) => (
                    <tr key={f.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-sm font-medium text-white">{f.name}</p>
                        <p className="text-xs text-gray-500">/r/{f.slug}</p>
                      </td>
                      <td className="px-5 py-3">
                        <p className="text-sm text-gray-300">{f.user.name || "Sin nombre"}</p>
                        <p className="text-xs text-gray-500">{f.user.email}</p>
                      </td>
                      <td className="px-5 py-3 text-center">
                        <span className={`text-[11px] font-medium px-2.5 py-0.5 rounded-full ${f.isActive ? "bg-green-500/10 text-green-400" : "bg-gray-800 text-gray-500"}`}>
                          {f.isActive ? "Activo" : "Inactivo"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-sm text-gray-400">{f._count.links}</td>
                      <td className="px-5 py-3 text-right text-sm text-gray-300">{f._count.clicks}</td>
                      <td className="px-5 py-3 text-right text-xs text-gray-500">{formatDate(f.createdAt)}</td>
                      <td className="px-5 py-3 text-right">
                        <button onClick={() => deleteFunnel(f.id)} className="px-2.5 py-1 text-xs text-red-400 hover:text-red-300 bg-red-900/10 hover:bg-red-900/20 rounded-lg transition-colors">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
                <span className="text-xs text-gray-500">Pagina {page} de {totalPages}</span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded-lg disabled:opacity-30 hover:bg-gray-700">Anterior</button>
                  <button onClick={() => setPage(Math.min(totalPages, page + 1))} disabled={page >= totalPages} className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded-lg disabled:opacity-30 hover:bg-gray-700">Siguiente</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
