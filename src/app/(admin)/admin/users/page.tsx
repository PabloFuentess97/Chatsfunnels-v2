"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

interface UserItem {
  id: string;
  name: string | null;
  email: string;
  role: string;
  credits: number;
  createdAt: string;
  _count: { funnels: number; clicks: number; landingPages: number };
}

interface UsersData {
  users: UserItem[];
  total: number;
  page: number;
  totalPages: number;
}

export default function AdminUsersPage() {
  const [data, setData] = useState<UsersData | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    fetch(`/api/admin/users?search=${encodeURIComponent(search)}&page=${page}`)
      .then((r) => r.json())
      .then((r) => { if (r.success) setData(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  }, [search, page]);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const changeRole = async (id: string, role: string) => {
    await fetch(`/api/admin/users/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ role }),
    });
    fetchUsers();
  };

  const deleteUser = async (id: string) => {
    if (!confirm("Eliminar este usuario y todos sus datos?")) return;
    await fetch(`/api/admin/users/${id}`, { method: "DELETE" });
    fetchUsers();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Usuarios</h1>
          <p className="text-gray-400 text-sm mt-1">Gestiona todos los usuarios de la plataforma</p>
        </div>
        {data && <span className="text-sm text-gray-500">{data.total} usuarios</span>}
      </div>

      <form onSubmit={(e) => { e.preventDefault(); setPage(1); fetchUsers(); }} className="flex gap-2">
        <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Buscar por nombre o email..." className="flex-1 px-4 py-2.5 bg-gray-900 border border-gray-800 rounded-xl text-sm text-white placeholder-gray-500 focus:ring-2 focus:ring-violet-500 focus:border-transparent" />
        <button type="submit" className="px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors">Buscar</button>
      </form>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-8 text-center"><div className="w-6 h-6 border-2 border-violet-500 border-t-transparent rounded-full animate-spin mx-auto" /></div>
        ) : !data || data.users.length === 0 ? (
          <div className="p-8 text-center text-gray-500 text-sm">No se encontraron usuarios</div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-800">
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Usuario</th>
                    <th className="text-left text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Rol</th>
                    <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Creditos</th>
                    <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Funnels</th>
                    <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Clicks</th>
                    <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Registro</th>
                    <th className="text-right text-[11px] font-semibold text-gray-500 uppercase tracking-wider px-5 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800/50">
                  {data.users.map((user) => (
                    <tr key={user.id} className="hover:bg-gray-800/30 transition-colors">
                      <td className="px-5 py-3">
                        <Link href={`/admin/users/${user.id}`} className="group">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                              {(user.name || "U")[0].toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-medium text-white group-hover:text-violet-400 transition-colors">{user.name || "Sin nombre"}</p>
                              <p className="text-xs text-gray-500">{user.email}</p>
                            </div>
                          </div>
                        </Link>
                      </td>
                      <td className="px-5 py-3">
                        <select value={user.role} onChange={(e) => changeRole(user.id, e.target.value)} className={`text-[11px] font-medium px-2.5 py-1 rounded-lg border-0 cursor-pointer ${user.role === "ADMIN" ? "bg-violet-500/10 text-violet-400" : "bg-gray-800 text-gray-400"}`}>
                          <option value="USER">USER</option>
                          <option value="ADMIN">ADMIN</option>
                        </select>
                      </td>
                      <td className="px-5 py-3 text-right text-sm text-gray-300">{user.credits}</td>
                      <td className="px-5 py-3 text-right text-sm text-gray-400">{user._count.funnels}</td>
                      <td className="px-5 py-3 text-right text-sm text-gray-400">{user._count.clicks}</td>
                      <td className="px-5 py-3 text-right text-xs text-gray-500">{formatDate(user.createdAt)}</td>
                      <td className="px-5 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/admin/users/${user.id}`} className="px-2.5 py-1 text-xs text-gray-400 hover:text-white bg-gray-800 hover:bg-gray-700 rounded-lg transition-colors">Ver</Link>
                          <button onClick={() => deleteUser(user.id)} className="px-2.5 py-1 text-xs text-red-400 hover:text-red-300 bg-red-900/10 hover:bg-red-900/20 rounded-lg transition-colors">Eliminar</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {data.totalPages > 1 && (
              <div className="flex items-center justify-between px-5 py-3 border-t border-gray-800">
                <span className="text-xs text-gray-500">Pagina {data.page} de {data.totalPages}</span>
                <div className="flex gap-1">
                  <button onClick={() => setPage(Math.max(1, page - 1))} disabled={page <= 1} className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded-lg disabled:opacity-30 hover:bg-gray-700 transition-colors">Anterior</button>
                  <button onClick={() => setPage(Math.min(data.totalPages, page + 1))} disabled={page >= data.totalPages} className="px-3 py-1 text-xs bg-gray-800 text-gray-400 rounded-lg disabled:opacity-30 hover:bg-gray-700 transition-colors">Siguiente</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
