"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import Card from "@/components/ui/card";

interface Link {
  id: string;
  url: string;
  order: number;
  clicks: number;
  weight: number;
  priority: number;
  isActive: boolean;
}

interface Funnel {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  clicksPerRound: number;
  links: Link[];
  _count: { clicks: number };
}

export default function FunnelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [newUrl, setNewUrl] = useState("");
  const [newWeight, setNewWeight] = useState("1.0");
  const [newPriority, setNewPriority] = useState("0");
  const [adding, setAdding] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");

  const fetchFunnel = () => {
    fetch(`/api/funnels/${params.id}`)
      .then((r) => r.json())
      .then((r) => {
        if (r.success) {
          setFunnel(r.data);
          setEditName(r.data.name);
          setEditDesc(r.data.description);
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchFunnel(); }, [params.id]);

  const addLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    await fetch(`/api/funnels/${params.id}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: newUrl, weight: parseFloat(newWeight), priority: parseInt(newPriority) }),
    });
    setNewUrl("");
    setNewWeight("1.0");
    setNewPriority("0");
    setAdding(false);
    fetchFunnel();
  };

  const removeLink = async (linkId: string) => {
    await fetch(`/api/funnels/${params.id}/links/${linkId}`, { method: "DELETE" });
    fetchFunnel();
  };

  const toggleLink = async (linkId: string, isActive: boolean) => {
    await fetch(`/api/funnels/${params.id}/links/${linkId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !isActive }),
    });
    fetchFunnel();
  };

  const saveEdit = async () => {
    await fetch(`/api/funnels/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: editName, description: editDesc }),
    });
    setEditing(false);
    fetchFunnel();
  };

  const toggleFunnel = async () => {
    if (!funnel) return;
    await fetch(`/api/funnels/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !funnel.isActive }),
    });
    fetchFunnel();
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />;
  if (!funnel) return <p className="text-red-500">Funnel not found</p>;

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/r/${funnel.slug}`;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <button onClick={() => router.push("/funnels")} className="text-sm text-gray-500 dark:text-gray-400 hover:underline mb-1 block">&larr; Back to Funnels</button>
          {editing ? (
            <div className="space-y-2">
              <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="text-2xl font-bold bg-transparent border-b border-blue-500 text-gray-900 dark:text-white focus:outline-none" />
              <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} className="block text-sm bg-transparent border-b border-blue-500 text-gray-500 dark:text-gray-400 focus:outline-none" />
              <div className="flex gap-2">
                <Button size="sm" onClick={saveEdit}>Save</Button>
                <Button size="sm" variant="ghost" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center gap-3">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{funnel.name}</h1>
                <Badge variant={funnel.isActive ? "success" : "default"}>{funnel.isActive ? "Active" : "Inactive"}</Badge>
              </div>
              <p className="text-gray-500 dark:text-gray-400 mt-1">{funnel.description}</p>
            </>
          )}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>Edit</Button>
          <Button variant={funnel.isActive ? "secondary" : "primary"} size="sm" onClick={toggleFunnel}>
            {funnel.isActive ? "Deactivate" : "Activate"}
          </Button>
        </div>
      </div>

      <Card>
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-1">Share URL</h3>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-900 rounded text-sm text-gray-800 dark:text-gray-200">{shareUrl}</code>
          <Button size="sm" variant="outline" onClick={() => navigator.clipboard.writeText(shareUrl)}>Copy</Button>
        </div>
        <p className="text-xs text-gray-400 mt-2">Total clicks: {funnel._count.clicks} | Clicks per round: {funnel.clicksPerRound}</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Links ({funnel.links.length})</h2>
        <form onSubmit={addLink} className="flex gap-2 mb-4">
          <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://example.com" className="flex-1 px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" required />
          <input type="number" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} placeholder="Weight" step="0.1" min="0.1" className="w-24 px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" />
          <input type="number" value={newPriority} onChange={(e) => setNewPriority(e.target.value)} placeholder="Priority" min="0" className="w-24 px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" />
          <Button type="submit" loading={adding}>Add Link</Button>
        </form>

        {funnel.links.length === 0 ? (
          <p className="text-sm text-gray-500 dark:text-gray-400 text-center py-8">No links yet. Add your first link above.</p>
        ) : (
          <div className="space-y-2">
            {funnel.links.map((link, index) => (
              <div key={link.id} className="flex items-center gap-3 p-3 rounded-lg bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700">
                <span className="text-sm font-mono text-gray-400 w-6">{index + 1}</span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{link.url}</p>
                  <div className="flex gap-3 text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                    <span>Clicks: {link.clicks}</span>
                    <span>Weight: {link.weight}</span>
                    <span>Priority: {link.priority}</span>
                  </div>
                </div>
                <Badge variant={link.isActive ? "success" : "default"}>{link.isActive ? "On" : "Off"}</Badge>
                <Button size="sm" variant="ghost" onClick={() => toggleLink(link.id, link.isActive)}>
                  {link.isActive ? "Disable" : "Enable"}
                </Button>
                <Button size="sm" variant="danger" onClick={() => removeLink(link.id)}>Remove</Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
