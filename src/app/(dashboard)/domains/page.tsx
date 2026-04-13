"use client";

import { useEffect, useState } from "react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";
import Badge from "@/components/ui/badge";
import EmptyState from "@/components/ui/empty-state";

interface Domain {
  id: string;
  domain: string;
  isVerified: boolean;
  createdAt: string;
  funnel: { id: string; name: string } | null;
}

export default function DomainsPage() {
  const [domains, setDomains] = useState<Domain[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [newDomain, setNewDomain] = useState("");

  const fetchDomains = () => {
    fetch("/api/domains")
      .then((r) => r.json())
      .then((r) => { if (r.success) setDomains(r.data); setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchDomains(); }, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/domains", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ domain: newDomain }),
    });
    setNewDomain("");
    setShowAdd(false);
    fetchDomains();
  };

  const handleDelete = async (id: string) => {
    await fetch(`/api/domains/${id}`, { method: "DELETE" });
    fetchDomains();
  };

  if (loading) return <div className="animate-pulse h-64 bg-gray-200 dark:bg-gray-700 rounded-xl" />;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Custom Domains</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-1">Connect your own domains to funnels</p>
        </div>
        <Button onClick={() => setShowAdd(true)}>Add Domain</Button>
      </div>

      {showAdd && (
        <Card>
          <form onSubmit={handleAdd} className="flex gap-2">
            <input type="text" value={newDomain} onChange={(e) => setNewDomain(e.target.value)} placeholder="mydomain.com" className="flex-1 px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" required />
            <Button type="submit">Add</Button>
            <Button variant="ghost" onClick={() => setShowAdd(false)}>Cancel</Button>
          </form>
        </Card>
      )}

      {domains.length === 0 ? (
        <EmptyState title="No custom domains" description="Add a custom domain to brand your funnel links." action={{ label: "Add Domain", onClick: () => setShowAdd(true) }} />
      ) : (
        <div className="space-y-3">
          {domains.map((domain) => (
            <Card key={domain.id}>
              <div className="flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-900 dark:text-white">{domain.domain}</span>
                    <Badge variant={domain.isVerified ? "success" : "warning"}>{domain.isVerified ? "Verified" : "Pending"}</Badge>
                  </div>
                  {domain.funnel && <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Linked to: {domain.funnel.name}</p>}
                </div>
                <Button size="sm" variant="danger" onClick={() => handleDelete(domain.id)}>Remove</Button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
