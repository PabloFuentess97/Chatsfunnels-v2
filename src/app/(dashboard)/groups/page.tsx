"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";

interface Group {
  id: string;
  name: string;
  maxMembers: number;
  createdAt: string;
  _count: { members: number };
  rounds: { id: string; status: string; roundNumber: number }[];
}

export default function GroupsPage() {
  const [groups, setGroups] = useState<Group[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [maxMembers, setMaxMembers] = useState("50");

  const fetchGroups = () => {
    fetch("/api/groups")
      .then((r) => r.json())
      .then((r) => { if (r.success) setGroups(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchGroups(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/groups", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, maxMembers: parseInt(maxMembers) }),
    });
    setNewName("");
    setShowCreate(false);
    fetchGroups();
  };

  const startRound = async (groupId: string) => {
    await fetch("/api/rounds", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ groupId, maxClicks: 100 }),
    });
    fetchGroups();
  };

  if (loading) return <div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Grupos</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Gestiona los grupos de distribucion de trafico</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>Crear Grupo</Button>
      </div>

      {showCreate && (
        <Card>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Nombre del Grupo</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Miembros Maximo</label>
              <input type="number" value={maxMembers} onChange={(e) => setMaxMembers(e.target.value)} min="2" className="w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Crear</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancelar</Button>
            </div>
          </form>
        </Card>
      )}

      {groups.length === 0 ? (
        <EmptyState title="Aun no tienes grupos" description="Crea un grupo para empezar a distribuir trafico entre miembros." action={{ label: "Crear Grupo", onClick: () => setShowCreate(true) }} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {groups.map((group) => (
            <Card key={group.id}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{group.name}</h3>
                {group.rounds[0] && (
                  <Badge variant={group.rounds[0].status === "ACTIVE" ? "success" : "default"}>
                    Ronda #{group.rounds[0].roundNumber}
                  </Badge>
                )}
              </div>
              <div className="text-sm text-gray-500 dark:text-gray-400 space-y-1">
                <p>Miembros: {group._count.members} / {group.maxMembers}</p>
              </div>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => startRound(group.id)}>Iniciar Ronda</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
