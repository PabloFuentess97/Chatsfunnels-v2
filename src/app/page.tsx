import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="max-w-7xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white tracking-tight">ChatsFunnels</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-300 hover:text-white transition-colors font-medium">Iniciar sesion</Link>
          <Link href="/register" className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-5 py-2.5 rounded-xl font-medium hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-600/20">Comenzar gratis</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-500/10 border border-blue-500/20 rounded-full px-5 py-2 mb-8">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-sm text-blue-300 font-medium">Plataforma de Rotacion Inteligente de Enlaces</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight max-w-4xl mx-auto tracking-tight">
          Distribuye Trafico de Forma{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Inteligente
          </span>
        </h1>

        <p className="mt-8 text-lg md:text-xl text-gray-400 max-w-2xl mx-auto leading-relaxed">
          ChatsFunnels usa algoritmos avanzados de rotacion para distribuir tu trafico de forma equitativa entre multiples enlaces. Perfecto para grupos de WhatsApp, equipos de marketing y redes de afiliados.
        </p>

        <div className="mt-12 flex items-center justify-center gap-4">
          <Link href="/register" className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-8 py-3.5 rounded-xl font-semibold text-lg hover:from-blue-500 hover:to-cyan-500 transition-all shadow-lg shadow-blue-600/25">
            Empezar Gratis
          </Link>
          <Link href="/login" className="border border-gray-700 text-gray-300 px-8 py-3.5 rounded-xl font-semibold text-lg hover:bg-gray-800/50 hover:border-gray-600 transition-all">
            Iniciar Sesion
          </Link>
        </div>

        <div className="mt-28 grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
          <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 hover:border-blue-800/50 transition-all group">
            <div className="w-12 h-12 bg-blue-500/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-blue-500/20 transition-colors">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Funnels Inteligentes</h3>
            <p className="text-gray-400 mt-3 leading-relaxed">Crea funnels con multiples enlaces y deja que nuestro algoritmo distribuya el trafico basado en peso, prioridad y conteo de clicks.</p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 hover:border-green-800/50 transition-all group">
            <div className="w-12 h-12 bg-green-500/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-green-500/20 transition-colors">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Rondas de Grupo</h3>
            <p className="text-gray-400 mt-3 leading-relaxed">Crea grupos de hasta 50 miembros. Cada miembro agrega un enlace y el trafico se distribuye equitativamente en rondas.</p>
          </div>

          <div className="bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800 p-8 hover:border-purple-800/50 transition-all group">
            <div className="w-12 h-12 bg-purple-500/10 rounded-xl flex items-center justify-center mb-5 group-hover:bg-purple-500/20 transition-colors">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-white">Analiticas Avanzadas</h3>
            <p className="text-gray-400 mt-3 leading-relaxed">Rastrea cada click con analiticas detalladas: ubicacion, dispositivo, navegador y mas. Ve datos de rendimiento en tiempo real.</p>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-10 border-t border-gray-800/50 text-center text-gray-500 text-sm">
        ChatsFunnels &copy; 2025. Todos los derechos reservados.
      </footer>
    </div>
  );
}
