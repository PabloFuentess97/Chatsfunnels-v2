"use client";

import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";
import Button from "@/components/ui/button";
import Card from "@/components/ui/card";

interface Pixel {
  id: string;
  name: string;
  type: string;
  pixelId: string;
}

interface WebhookItem {
  id: string;
  url: string;
  events: string[];
  isActive: boolean;
}

export default function SettingsPage() {
  const { data: session } = useSession();
  const [pixels, setPixels] = useState<Pixel[]>([]);
  const [webhooks, setWebhooks] = useState<WebhookItem[]>([]);
  const [pixelName, setPixelName] = useState("");
  const [pixelType, setPixelType] = useState("FACEBOOK");
  const [pixelId, setPixelId] = useState("");
  const [webhookUrl, setWebhookUrl] = useState("");
  const [webhookEvents, setWebhookEvents] = useState<string[]>([]);

  useEffect(() => {
    fetch("/api/tracking-pixels").then((r) => r.json()).then((r) => { if (r.success) setPixels(r.data); });
    fetch("/api/webhooks").then((r) => r.json()).then((r) => { if (r.success) setWebhooks(r.data); });
  }, []);

  const addPixel = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/tracking-pixels", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: pixelName, type: pixelType, pixelId }),
    });
    if (res.ok) {
      const r = await res.json();
      setPixels([r.data, ...pixels]);
      setPixelName("");
      setPixelId("");
    }
  };

  const removePixel = async (id: string) => {
    await fetch(`/api/tracking-pixels/${id}`, { method: "DELETE" });
    setPixels(pixels.filter((p) => p.id !== id));
  };

  const addWebhook = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url: webhookUrl, events: webhookEvents }),
    });
    if (res.ok) {
      const r = await res.json();
      setWebhooks([r.data, ...webhooks]);
      setWebhookUrl("");
      setWebhookEvents([]);
    }
  };

  const removeWebhook = async (id: string) => {
    await fetch("/api/webhooks", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setWebhooks(webhooks.filter((w) => w.id !== id));
  };

  const toggleEvent = (event: string) => {
    setWebhookEvents((prev) =>
      prev.includes(event) ? prev.filter((e) => e !== event) : [...prev, event]
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Ajustes</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Configura pixeles de seguimiento y webhooks</p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">Perfil</h2>
        <p className="text-sm text-gray-500 dark:text-gray-400">{session?.user?.name} ({session?.user?.email})</p>
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pixeles de Seguimiento</h2>
        <form onSubmit={addPixel} className="flex gap-2 mb-4 flex-wrap">
          <input type="text" value={pixelName} onChange={(e) => setPixelName(e.target.value)} placeholder="Nombre del pixel" className="px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" required />
          <select value={pixelType} onChange={(e) => setPixelType(e.target.value)} className="px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500">
            <option value="FACEBOOK">Facebook Pixel</option>
            <option value="GOOGLE_ANALYTICS">Google Analytics</option>
            <option value="CUSTOM">Custom Script</option>
          </select>
          <input type="text" value={pixelId} onChange={(e) => setPixelId(e.target.value)} placeholder="ID del pixel" className="px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" required />
          <Button type="submit" size="sm">Agregar Pixel</Button>
        </form>
        {pixels.length > 0 && (
          <div className="space-y-2">
            {pixels.map((p) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{p.name}</span>
                  <span className="text-xs text-gray-500 ml-2">{p.type} - {p.pixelId}</span>
                </div>
                <Button size="sm" variant="danger" onClick={() => removePixel(p.id)}>Eliminar</Button>
              </div>
            ))}
          </div>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Webhooks</h2>
        <form onSubmit={addWebhook} className="space-y-3 mb-4">
          <input type="url" value={webhookUrl} onChange={(e) => setWebhookUrl(e.target.value)} placeholder="https://tu-webhook-url.com" className="w-full px-3 py-2 border rounded-lg text-gray-900 dark:text-white bg-white dark:bg-gray-900 border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-blue-500" required />
          <div className="flex flex-wrap gap-2">
            {["user.registered", "funnel.clicks_reached", "round.new", "round.completed"].map((event) => (
              <button key={event} type="button" onClick={() => toggleEvent(event)} className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${webhookEvents.includes(event) ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300" : "bg-gray-100 text-gray-600 dark:bg-gray-700 dark:text-gray-400"}`}>
                {event}
              </button>
            ))}
          </div>
          <Button type="submit" size="sm" disabled={webhookEvents.length === 0}>Agregar Webhook</Button>
        </form>
        {webhooks.length > 0 && (
          <div className="space-y-2">
            {webhooks.map((w) => (
              <div key={w.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700 last:border-0">
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-md">{w.url}</p>
                  <p className="text-xs text-gray-500">{w.events.join(", ")}</p>
                </div>
                <Button size="sm" variant="danger" onClick={() => removeWebhook(w.id)}>Eliminar</Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
}
