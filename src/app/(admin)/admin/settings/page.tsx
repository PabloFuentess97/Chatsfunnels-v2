"use client";

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Configuracion</h1>
        <p className="text-gray-400 text-sm mt-1">Ajustes generales de la plataforma</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 space-y-4">
        <h2 className="text-sm font-semibold text-white">Limites del Sistema</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Creditos iniciales por usuario</label>
            <input type="number" defaultValue={100} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white" disabled />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Costo por funnel (creditos)</label>
            <input type="number" defaultValue={10} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white" disabled />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Costo por click (creditos)</label>
            <input type="number" defaultValue={1} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white" disabled />
          </div>
          <div>
            <label className="block text-xs text-gray-500 mb-1.5">Limite de rate (clicks/min)</label>
            <input type="number" defaultValue={30} className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white" disabled />
          </div>
        </div>
        <p className="text-xs text-gray-600">Estos valores estan configurados en el codigo. Para modificarlos, edita los archivos de configuracion correspondientes.</p>
      </div>
    </div>
  );
}
