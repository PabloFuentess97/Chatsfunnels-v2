"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";
import { formatDate } from "@/lib/utils";

interface LandingPageItem {
  id: string;
  name: string;
  slug: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
  funnel: { id: string; name: string } | null;
}

export default function PagesListPage() {
  const [pages, setPages] = useState<LandingPageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [newName, setNewName] = useState("");

  const fetchPages = () => {
    fetch("/api/landing-pages")
      .then((r) => r.json())
      .then((r) => { if (r.success) setPages(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchPages(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);
    const res = await fetch("/api/landing-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName }),
    });
    const data = await res.json();
    setCreating(false);
    if (data.success) {
      window.location.href = `/pages/${data.data.id}/edit`;
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this landing page?")) return;
    await fetch(`/api/landing-pages/${id}`, { method: "DELETE" });
    fetchPages();
  };

  const handleDuplicate = async (page: LandingPageItem) => {
    const res = await fetch(`/api/landing-pages/${page.id}`);
    const data = await res.json();
    if (!data.success) return;

    await fetch("/api/landing-pages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: `${page.name} (Copy)`, content: data.data.content }),
    });
    fetchPages();
  };

  if (loading) {
    return <div className="space-y-4">{[...Array(3)].map((_, i) => <div key={i} className="h-20 bg-gray-200 dark:bg-gray-700 rounded-xl animate-pulse" />)}</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Landing Pages</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Build and manage visual landing pages</p>
        </div>
      </div>

      <div className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-4">
        <form onSubmit={handleCreate} className="flex gap-3">
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            placeholder="New page name..."
            className="flex-1 px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500"
            required
          />
          <Button type="submit" loading={creating}>Create Page</Button>
        </form>
      </div>

      {pages.length === 0 ? (
        <EmptyState
          title="No landing pages yet"
          description="Create your first landing page with our visual drag-and-drop builder."
        />
      ) : (
        <div className="space-y-3">
          {pages.map((page) => (
            <div key={page.id} className="bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 p-5 flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3">
                  <span className="text-lg font-semibold text-gray-900 dark:text-white">{page.name}</span>
                  <Badge variant={page.published ? "success" : "default"}>
                    {page.published ? "Published" : "Draft"}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-500 dark:text-gray-400">
                  <span>/lp/{page.slug}</span>
                  {page.funnel && <span>Funnel: {page.funnel.name}</span>}
                  <span>Updated {formatDate(page.updatedAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {page.published && (
                  <a href={`/lp/${page.slug}`} target="_blank" rel="noopener noreferrer">
                    <Button size="sm" variant="ghost">View</Button>
                  </a>
                )}
                <Button size="sm" variant="ghost" onClick={() => handleDuplicate(page)}>Duplicate</Button>
                <Link href={`/pages/${page.id}/edit`}>
                  <Button size="sm" variant="outline">Edit</Button>
                </Link>
                <Button size="sm" variant="danger" onClick={() => handleDelete(page.id)}>Delete</Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
