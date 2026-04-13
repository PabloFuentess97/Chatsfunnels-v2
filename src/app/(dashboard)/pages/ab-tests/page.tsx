"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import { formatNumber } from "@/lib/utils";

interface PageOption {
  id: string;
  name: string;
  slug: string;
}

interface ABTest {
  id: string;
  name: string;
  status: string;
  trafficSplit: number;
  originalViews: number;
  variantViews: number;
  originalConversions: number;
  variantConversions: number;
  originalPage: PageOption;
  variantPage: PageOption;
  createdAt: string;
}

export default function ABTestsPage() {
  const [tests, setTests] = useState<ABTest[]>([]);
  const [pages, setPages] = useState<PageOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [newName, setNewName] = useState("");
  const [originalId, setOriginalId] = useState("");
  const [variantId, setVariantId] = useState("");
  const [split, setSplit] = useState(50);

  const fetchData = () => {
    Promise.all([
      fetch("/api/ab-tests").then((r) => r.json()),
      fetch("/api/landing-pages").then((r) => r.json()),
    ]).then(([testsRes, pagesRes]) => {
      if (testsRes.success) setTests(testsRes.data);
      if (pagesRes.success) setPages(pagesRes.data);
      setLoading(false);
    });
  };

  useEffect(() => { fetchData(); }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/ab-tests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: newName, originalPageId: originalId, variantPageId: variantId, trafficSplit: split }),
    });
    setShowCreate(false);
    setNewName("");
    fetchData();
  };

  const updateStatus = async (id: string, status: string) => {
    await fetch(`/api/ab-tests/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    fetchData();
  };

  const deleteTest = async (id: string) => {
    if (!confirm("Delete this A/B test?")) return;
    await fetch(`/api/ab-tests/${id}`, { method: "DELETE" });
    fetchData();
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case "running": return <Badge variant="success">Running</Badge>;
      case "completed": return <Badge variant="info">Completed</Badge>;
      case "paused": return <Badge variant="warning">Paused</Badge>;
      default: return <Badge>Draft</Badge>;
    }
  };

  const convRate = (conversions: number, views: number) => {
    if (views === 0) return "0%";
    return (conversions / views * 100).toFixed(1) + "%";
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">A/B Tests</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Compare landing page variants to find what converts best</p>
        </div>
        <Button onClick={() => setShowCreate(true)}>New A/B Test</Button>
      </div>

      {showCreate && (
        <Card>
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Create A/B Test</h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Test Name</label>
              <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="e.g. Homepage headline test" className="w-full px-3 py-2 border rounded-lg text-white bg-gray-900 border-gray-600 focus:ring-2 focus:ring-blue-500" required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Original Page (Control)</label>
                <select value={originalId} onChange={(e) => setOriginalId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-white bg-gray-900 border-gray-600" required>
                  <option value="">Select page...</option>
                  {pages.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">Variant Page</label>
                <select value={variantId} onChange={(e) => setVariantId(e.target.value)} className="w-full px-3 py-2 border rounded-lg text-white bg-gray-900 border-gray-600" required>
                  <option value="">Select page...</option>
                  {pages.filter((p) => p.id !== originalId).map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Traffic Split: {split}% Original / {100 - split}% Variant</label>
              <input type="range" min="10" max="90" step="5" value={split} onChange={(e) => setSplit(parseInt(e.target.value))} className="w-full" />
            </div>
            <div className="flex gap-2">
              <Button type="submit">Create Test</Button>
              <Button variant="ghost" onClick={() => setShowCreate(false)}>Cancel</Button>
            </div>
          </form>
        </Card>
      )}

      {tests.length === 0 ? (
        <Card>
          <div className="text-center py-12">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
            <h3 className="text-lg font-medium text-white">No A/B tests yet</h3>
            <p className="text-gray-400 mt-1">Create two page variants and test which converts better.</p>
          </div>
        </Card>
      ) : (
        <div className="space-y-4">
          {tests.map((test) => (
            <Card key={test.id}>
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-semibold text-white">{test.name}</h3>
                  {statusBadge(test.status)}
                </div>
                <div className="flex gap-2">
                  {test.status === "draft" && (
                    <Button size="sm" onClick={() => updateStatus(test.id, "running")}>Start</Button>
                  )}
                  {test.status === "running" && (
                    <>
                      <Button size="sm" variant="secondary" onClick={() => updateStatus(test.id, "paused")}>Pause</Button>
                      <Button size="sm" onClick={() => updateStatus(test.id, "completed")}>Complete</Button>
                    </>
                  )}
                  {test.status === "paused" && (
                    <Button size="sm" onClick={() => updateStatus(test.id, "running")}>Resume</Button>
                  )}
                  <Button size="sm" variant="danger" onClick={() => deleteTest(test.id)}>Delete</Button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                {/* Original */}
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-400">Original ({test.trafficSplit}%)</span>
                    <Badge variant="info">{test.originalPage.name}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-2xl font-bold text-white">{formatNumber(test.originalViews)}</p>
                      <p className="text-xs text-gray-500">Views</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{formatNumber(test.originalConversions)}</p>
                      <p className="text-xs text-gray-500">Conversions</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-sm text-gray-400">Conv. Rate: <span className="text-white font-semibold">{convRate(test.originalConversions, test.originalViews)}</span></p>
                  </div>
                </div>

                {/* Variant */}
                <div className="bg-gray-900 rounded-xl p-4 border border-gray-700">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-400">Variant ({100 - test.trafficSplit}%)</span>
                    <Badge variant="warning">{test.variantPage.name}</Badge>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-2xl font-bold text-white">{formatNumber(test.variantViews)}</p>
                      <p className="text-xs text-gray-500">Views</p>
                    </div>
                    <div>
                      <p className="text-2xl font-bold text-white">{formatNumber(test.variantConversions)}</p>
                      <p className="text-xs text-gray-500">Conversions</p>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-gray-700">
                    <p className="text-sm text-gray-400">Conv. Rate: <span className="text-white font-semibold">{convRate(test.variantConversions, test.variantViews)}</span></p>
                  </div>
                </div>
              </div>

              {/* Winner indicator */}
              {test.status === "completed" && (test.originalConversions > 0 || test.variantConversions > 0) && (
                <div className="mt-4 p-3 rounded-lg bg-green-900/20 border border-green-800">
                  <p className="text-sm text-green-400 font-medium">
                    Winner: {
                      (test.originalViews > 0 ? test.originalConversions / test.originalViews : 0) >=
                      (test.variantViews > 0 ? test.variantConversions / test.variantViews : 0)
                        ? `Original (${test.originalPage.name})`
                        : `Variant (${test.variantPage.name})`
                    }
                  </p>
                </div>
              )}
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
