"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Button from "@/components/ui/button";
import Badge from "@/components/ui/badge";
import { useToast } from "@/components/ui/toast";

interface LinkItem {
  id: string;
  url: string;
  order: number;
  clicks: number;
  weight: number;
  priority: number;
  isActive: boolean;
  maxClicks: number | null;
  label: string | null;
}

interface Funnel {
  id: string;
  name: string;
  slug: string;
  description: string;
  isActive: boolean;
  clicksPerRound: number;
  fallbackUrl: string | null;
  rotationMode: string;
  roundMode: string;
  links: LinkItem[];
  _count: { clicks: number };
}

export default function FunnelDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { toast } = useToast();
  const [funnel, setFunnel] = useState<Funnel | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [adding, setAdding] = useState(false);
  const [showAddLink, setShowAddLink] = useState(false);
  const [editingLinkId, setEditingLinkId] = useState<string | null>(null);

  // Funnel edit state
  const [editName, setEditName] = useState("");
  const [editDesc, setEditDesc] = useState("");
  const [editFallback, setEditFallback] = useState("");
  const [editRotation, setEditRotation] = useState("weighted");
  const [editRoundMode, setEditRoundMode] = useState("infinite");
  const [editClicksPerRound, setEditClicksPerRound] = useState("10");

  // New link state
  const [newUrl, setNewUrl] = useState("");
  const [newLabel, setNewLabel] = useState("");
  const [newWeight, setNewWeight] = useState("1.0");
  const [newPriority, setNewPriority] = useState("0");
  const [newMaxClicks, setNewMaxClicks] = useState("");

  const fetchFunnel = () => {
    fetch(`/api/funnels/${params.id}`)
      .then((r) => r.json())
      .then((r) => {
        if (r.success) {
          const f = r.data;
          setFunnel(f);
          setEditName(f.name);
          setEditDesc(f.description || "");
          setEditFallback(f.fallbackUrl || "");
          setEditRotation(f.rotationMode || "weighted");
          setEditRoundMode(f.roundMode || "infinite");
          setEditClicksPerRound(String(f.clicksPerRound || 10));
        }
        setLoading(false);
      })
      .catch(() => setLoading(false));
  };

  useEffect(() => { fetchFunnel(); }, [params.id]);

  const saveFunnel = async () => {
    setSaving(true);
    const res = await fetch(`/api/funnels/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: editName,
        description: editDesc,
        fallbackUrl: editFallback || null,
        rotationMode: editRotation,
        roundMode: editRoundMode,
        clicksPerRound: parseInt(editClicksPerRound) || 10,
      }),
    });
    setSaving(false);
    if (res.ok) {
      toast("Funnel guardado correctamente", "success");
      fetchFunnel();
    } else {
      toast("Error al guardar", "error");
    }
  };

  const toggleFunnel = async () => {
    if (!funnel) return;
    await fetch(`/api/funnels/${params.id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ isActive: !funnel.isActive }),
    });
    toast(funnel.isActive ? "Funnel desactivado" : "Funnel activado", "info");
    fetchFunnel();
  };

  const addLink = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdding(true);
    await fetch(`/api/funnels/${params.id}/links`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        url: newUrl,
        label: newLabel || undefined,
        weight: parseFloat(newWeight),
        priority: parseInt(newPriority),
        maxClicks: newMaxClicks ? parseInt(newMaxClicks) : null,
      }),
    });
    setNewUrl(""); setNewLabel(""); setNewWeight("1.0"); setNewPriority("0"); setNewMaxClicks("");
    setAdding(false);
    setShowAddLink(false);
    toast("Enlace agregado", "success");
    fetchFunnel();
  };

  const updateLinkField = async (linkId: string, field: string, value: unknown) => {
    await fetch(`/api/funnels/${params.id}/links/${linkId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ [field]: value }),
    });
    fetchFunnel();
  };

  const removeLink = async (linkId: string) => {
    if (!confirm("Eliminar este enlace?")) return;
    await fetch(`/api/funnels/${params.id}/links/${linkId}`, { method: "DELETE" });
    toast("Enlace eliminado", "info");
    fetchFunnel();
  };

  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(4)].map((_, i) => <div key={i} className="h-24 bg-gray-200 dark:bg-gray-800 rounded-2xl animate-pulse" />)}
      </div>
    );
  }

  if (!funnel) return <p className="text-red-500">Funnel no encontrado</p>;

  const shareUrl = `${typeof window !== "undefined" ? window.location.origin : ""}/r/${funnel.slug}`;
  const totalWeight = funnel.links.reduce((s, l) => s + (l.isActive ? l.weight : 0), 0);

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <button onClick={() => router.push("/funnels")} className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors mb-2 block">
            &larr; Mis Funnels
          </button>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{funnel.name}</h1>
            <Badge variant={funnel.isActive ? "success" : "default"}>{funnel.isActive ? "Activo" : "Inactivo"}</Badge>
          </div>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{funnel._count.clicks} clicks totales</p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant={funnel.isActive ? "outline" : "primary"} size="sm" onClick={toggleFunnel}>
            {funnel.isActive ? "Desactivar" : "Activar"}
          </Button>
        </div>
      </div>

      {/* Share URL */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-5">
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-semibold text-gray-900 dark:text-white">URL para compartir</h3>
          <button onClick={() => { navigator.clipboard.writeText(shareUrl); toast("URL copiada", "success"); }} className="text-xs text-blue-600 dark:text-blue-400 hover:underline">Copiar</button>
        </div>
        <div className="flex items-center gap-2">
          <code className="flex-1 px-4 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-700 dark:text-gray-300 font-mono select-all">{shareUrl}</code>
        </div>
      </div>

      {/* Configuracion del Funnel */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-5">Configuracion del Funnel</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Nombre */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Nombre</label>
            <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" />
          </div>

          {/* Descripcion */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Descripcion</label>
            <input type="text" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} placeholder="Descripcion opcional" className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" />
          </div>

          {/* Fallback URL */}
          <div className="md:col-span-2">
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">URL de respaldo (fallback)</label>
            <input type="url" value={editFallback} onChange={(e) => setEditFallback(e.target.value)} placeholder="https://tu-sitio.com (se usa si no hay enlaces activos)" className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" />
            <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1">Si todos los enlaces estan inactivos o sin creditos, el trafico va a esta URL.</p>
          </div>

          {/* Modo de Rotacion */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Modo de Rotacion</label>
            <select value={editRotation} onChange={(e) => setEditRotation(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="weighted">Ponderado (inteligente)</option>
              <option value="least-clicks">Menos clicks primero</option>
              <option value="priority">Por prioridad</option>
              <option value="round-robin">Secuencial (round-robin)</option>
              <option value="adaptive">Adaptativo (IA)</option>
            </select>
            <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1">
              {editRotation === "weighted" && "Distribuye trafico segun peso de cada enlace + deficit de clicks."}
              {editRotation === "least-clicks" && "Siempre elige el enlace con menos clicks."}
              {editRotation === "priority" && "Usa el nivel de prioridad, luego menos clicks."}
              {editRotation === "round-robin" && "Cada enlace recibe X clicks antes de pasar al siguiente."}
              {editRotation === "adaptive" && "Combina peso, deficit y prioridad con normalizacion softmax."}
            </p>
          </div>

          {/* Modo de Rondas */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Rondas</label>
            <select value={editRoundMode} onChange={(e) => setEditRoundMode(e.target.value)} className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent">
              <option value="infinite">Infinitas (sin limite)</option>
              <option value="limited">Limitadas</option>
            </select>
            <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1">
              {editRoundMode === "infinite" ? "El funnel rota enlaces indefinidamente." : "El funnel se detiene despues de completar las rondas."}
            </p>
          </div>

          {/* Clicks por ronda */}
          <div>
            <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Clicks por ronda</label>
            <input type="number" value={editClicksPerRound} onChange={(e) => setEditClicksPerRound(e.target.value)} min="1" className="w-full px-3.5 py-2.5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-shadow" />
            <p className="text-[11px] text-gray-400 dark:text-gray-600 mt-1">Cuantos clicks recibe cada enlace antes de rotar (modo secuencial).</p>
          </div>
        </div>

        <div className="flex justify-end mt-6 pt-5 border-t border-gray-100 dark:border-gray-800">
          <Button onClick={saveFunnel} loading={saving}>Guardar Cambios</Button>
        </div>
      </div>

      {/* Enlaces */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-2xl">
        <div className="flex items-center justify-between p-5 pb-0">
          <div>
            <h2 className="text-base font-semibold text-gray-900 dark:text-white">Enlaces ({funnel.links.length})</h2>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Cada enlace recibe trafico segun su configuracion</p>
          </div>
          <Button size="sm" onClick={() => setShowAddLink(!showAddLink)}>
            {showAddLink ? "Cancelar" : "+ Agregar Enlace"}
          </Button>
        </div>

        {/* Add link form */}
        {showAddLink && (
          <form onSubmit={addLink} className="m-5 p-5 bg-gray-50 dark:bg-gray-950 border border-gray-200 dark:border-gray-800 rounded-xl space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">URL del enlace</label>
                <input type="url" value={newUrl} onChange={(e) => setNewUrl(e.target.value)} placeholder="https://ejemplo.com/tu-link" className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" required />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Etiqueta (opcional)</label>
                <input type="text" value={newLabel} onChange={(e) => setNewLabel(e.target.value)} placeholder="Ej: WhatsApp Pedro" className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Peso</label>
                <input type="number" value={newWeight} onChange={(e) => setNewWeight(e.target.value)} step="0.1" min="0.1" className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                <p className="text-[11px] text-gray-400 mt-1">Mayor peso = mas trafico</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Prioridad</label>
                <input type="number" value={newPriority} onChange={(e) => setNewPriority(e.target.value)} min="0" className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                <p className="text-[11px] text-gray-400 mt-1">Mayor numero = mas prioridad</p>
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-500 dark:text-gray-400 mb-1.5">Clicks maximo (opcional)</label>
                <input type="number" value={newMaxClicks} onChange={(e) => setNewMaxClicks(e.target.value)} min="1" placeholder="Sin limite" className="w-full px-3.5 py-2.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl text-sm text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500" />
                <p className="text-[11px] text-gray-400 mt-1">Se desactiva al llegar a este numero</p>
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="submit" loading={adding}>Agregar Enlace</Button>
            </div>
          </form>
        )}

        {/* Links list */}
        <div className="p-5 pt-4">
          {funnel.links.length === 0 ? (
            <div className="text-center py-12 text-gray-400 dark:text-gray-500">
              <svg className="w-10 h-10 mx-auto mb-3 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" /></svg>
              <p className="text-sm font-medium">Sin enlaces</p>
              <p className="text-xs mt-1">Agrega tu primer enlace para empezar a recibir trafico.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {funnel.links.map((link, index) => {
                const pct = totalWeight > 0 ? Math.round((link.weight / totalWeight) * 100) : 0;
                const isEditing = editingLinkId === link.id;
                const reachedMax = link.maxClicks !== null && link.clicks >= link.maxClicks;

                return (
                  <div key={link.id} className={`rounded-xl border transition-all ${isEditing ? "border-blue-500 dark:border-blue-500 bg-blue-50/50 dark:bg-blue-950/20" : "border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-950"} ${!link.isActive || reachedMax ? "opacity-60" : ""}`}>
                    {/* Link header */}
                    <div className="flex items-center gap-3 p-4">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold flex-shrink-0 ${link.isActive && !reachedMax ? "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400" : "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500"}`}>
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          {link.label && <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase">{link.label}</span>}
                          <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{link.url}</p>
                        </div>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-[11px] text-gray-400">{link.clicks}{link.maxClicks ? `/${link.maxClicks}` : ""} clicks</span>
                          <span className="text-[11px] text-gray-400">Peso: {link.weight} ({pct}%)</span>
                          {link.priority > 0 && <span className="text-[11px] text-gray-400">P{link.priority}</span>}
                          {reachedMax && <Badge variant="warning">Limite alcanzado</Badge>}
                        </div>
                      </div>

                      {/* Progress bar */}
                      {link.maxClicks && (
                        <div className="w-20 h-1.5 bg-gray-200 dark:bg-gray-800 rounded-full overflow-hidden flex-shrink-0">
                          <div className={`h-full rounded-full ${reachedMax ? "bg-orange-500" : "bg-blue-500"}`} style={{ width: `${Math.min(100, (link.clicks / link.maxClicks) * 100)}%` }} />
                        </div>
                      )}

                      <div className="flex items-center gap-1 flex-shrink-0">
                        <button onClick={() => updateLinkField(link.id, "isActive", !link.isActive)} className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-colors ${link.isActive ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/30" : "bg-gray-200 text-gray-500 dark:bg-gray-800 dark:text-gray-500 hover:bg-gray-300 dark:hover:bg-gray-700"}`}>
                          {link.isActive ? "ON" : "OFF"}
                        </button>
                        <button onClick={() => setEditingLinkId(isEditing ? null : link.id)} className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors">
                          Editar
                        </button>
                        <button onClick={() => removeLink(link.id)} className="px-2.5 py-1 rounded-lg text-[11px] font-medium text-red-500 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors">
                          Eliminar
                        </button>
                      </div>
                    </div>

                    {/* Expanded edit */}
                    {isEditing && (
                      <div className="px-4 pb-4 pt-0">
                        <div className="border-t border-gray-200 dark:border-gray-800 pt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                          <div>
                            <label className="block text-[11px] text-gray-500 mb-1">URL</label>
                            <input type="url" defaultValue={link.url} onBlur={(e) => { if (e.target.value !== link.url) updateLinkField(link.id, "url", e.target.value); }} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 mb-1">Etiqueta</label>
                            <input type="text" defaultValue={link.label || ""} onBlur={(e) => updateLinkField(link.id, "label", e.target.value || null)} placeholder="Opcional" className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 mb-1">Peso</label>
                            <input type="number" defaultValue={link.weight} step="0.1" min="0.1" onBlur={(e) => updateLinkField(link.id, "weight", parseFloat(e.target.value))} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 mb-1">Prioridad</label>
                            <input type="number" defaultValue={link.priority} min="0" onBlur={(e) => updateLinkField(link.id, "priority", parseInt(e.target.value))} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 mb-1">Clicks maximo</label>
                            <input type="number" defaultValue={link.maxClicks || ""} min="1" placeholder="Sin limite" onBlur={(e) => updateLinkField(link.id, "maxClicks", e.target.value ? parseInt(e.target.value) : null)} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white" />
                          </div>
                          <div>
                            <label className="block text-[11px] text-gray-500 mb-1">Orden</label>
                            <input type="number" defaultValue={link.order} min="1" onBlur={(e) => updateLinkField(link.id, "order", parseInt(e.target.value))} className="w-full px-3 py-2 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-lg text-xs text-gray-900 dark:text-white" />
                          </div>
                          <div className="col-span-2 flex items-end">
                            <button onClick={() => { setEditingLinkId(null); toast("Cambios guardados", "success"); }} className="px-4 py-2 bg-blue-600 text-white rounded-lg text-xs font-medium hover:bg-blue-700 transition-colors">Cerrar Editor</button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
