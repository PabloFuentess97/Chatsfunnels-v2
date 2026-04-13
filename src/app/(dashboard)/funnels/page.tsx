"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

interface Funnel {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
  _count: { clicks: number };
  links: { id: string }[];
}

export default function FunnelsPage() {
  const [funnels, setFunnels] = useState<Funnel[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [newDesc, setNewDesc] = useState("");
  const [creating, setCreating] = useState(false);

  const fetchFunnels = () => {
    fetch("/api/funnels")
      .then((r) => r.json())
      .then((r) => { if (r.success) setFunnels(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchFunnels(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/funnels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, description: newDesc }),
    });
    if (res.ok) {
      setNewName("");
      setNewDesc("");
      setShowCreate(false);
      fetchFunnels();
    }
    setCreating(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this funnel?")) return;
    await fetch(`/api/funnels/${id}`, { method: "DELETE" });
    fetchFunnels();
  };

  const handleExport = async (id: string) => {
    const res = await fetch(`/api/funnels/${id}/export`);
    const data = await res.json();
    if (data.success) {
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `funnel-${id}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const handleImport = async () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = ".json";
    input.onchange = async (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const text = await file.text();
      const data = JSON.parse(text);
      await fetch("/api/funnels/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      fetchFunnels();
    };
    input.click();
  };

  if (loading) {
    return <div className="animate-pulse space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Funnels</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Manage your link funnels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={handleImport}>Import JSON</Button>
          <Button onClick={() => setShowCreate(true)}>Create Funnel</Button>
        </div>
      </div>

      {showCreate && (
        <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">New Funnel</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Name</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Description</label>
              <textarea value={newDesc} onChange={(e) => setNewDesc(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" rows={2} />
            </div>
            <div className="flex gap-2">
              <Button type="submit" loading={creating}>Create</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </form>
        </div>
      )}

      {funnels.length === 0 ? (
        <EmptyState
          title="No funnels yet"
          description="Create your first funnel to start routing traffic intelligently."
          action={{ label: "Create Funnel", onClick: () => setShowCreate(true) }}
        />
      ) : (
        <div className="space-y-3">
          {funnels.map((funnel) => (
            <div key={funnel.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <Link href={`/funnels/${funnel.id}`} className="text-lg font-semibold text-gray-900 dark:text-white hover:text-blue-600">
                    {funnel.name}
                  </Link>
                  <Badge variant={funnel.isActive ? "success" : "default"}>
                    {funnel.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span>{funnel.links.length} links</span>
                  <span>{funnel._count.clicks} clicks</span>
                  <span>slug: /r/{funnel.slug}</span>
                  <span>{formatDate(funnel.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button size="sm" variant="ghost" onClick={() => handleExport(funnel.id)}>Export</Button>
                <Link href={`/funnels/${funnel.id}`}>
                  <Button size="sm" variant="outline">Edit</Button>
                </Link>
                <Button size="sm" variant="danger" onClick={() => handleDelete(funnel.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
