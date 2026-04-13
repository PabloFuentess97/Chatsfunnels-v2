"use client";

import Link from "next/link";

export default function AdminCreditsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Gestion de Creditos</h1>
        <p className="text-gray-400 text-sm mt-1">Administra los creditos de los usuarios</p>
      </div>

      <div className="bg-gray-900 border border-gray-800 rounded-2xl p-8 text-center">
        <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <h3 className="text-lg font-medium text-white mb-2">Creditos por Usuario</h3>
        <p className="text-sm text-gray-400 mb-4">Para agregar o restar creditos, selecciona un usuario desde la seccion de Usuarios y ajusta sus creditos desde su perfil.</p>
        <Link href="/admin/users" className="inline-flex px-5 py-2.5 bg-violet-600 text-white rounded-xl text-sm font-medium hover:bg-violet-700 transition-colors">
          Ir a Usuarios
        </Link>
      </div>
    </div>
  );
}
