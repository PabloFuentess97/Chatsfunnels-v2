import Link from "next/link";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950">
      <nav className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
          <span className="text-xl font-bold text-white">ChatsFunnels</span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/login" className="text-gray-300 hover:text-white transition-colors">Sign In</Link>
          <Link href="/register" className="bg-blue-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors">Get Started</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 py-24 text-center">
        <div className="inline-flex items-center gap-2 bg-blue-900/30 border border-blue-800 rounded-full px-4 py-1.5 mb-6">
          <span className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
          <span className="text-sm text-blue-300">Smart Link Rotation Platform</span>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white leading-tight max-w-4xl mx-auto">
          Distribute Traffic{" "}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">
            Intelligently
          </span>
        </h1>

        <p className="mt-6 text-lg text-gray-400 max-w-2xl mx-auto">
          ChatsFunnels uses advanced rotation algorithms to distribute your traffic fairly across multiple links. Perfect for WhatsApp groups, marketing teams, and affiliate networks.
        </p>

        <div className="mt-10 flex items-center justify-center gap-4">
          <Link href="/register" className="bg-blue-600 text-white px-8 py-3 rounded-lg font-medium text-lg hover:bg-blue-700 transition-colors">
            Start Free
          </Link>
          <Link href="/login" className="border border-gray-700 text-gray-300 px-8 py-3 rounded-lg font-medium text-lg hover:bg-gray-800 transition-colors">
            Sign In
          </Link>
        </div>

        <div className="mt-24 grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="w-10 h-10 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Smart Funnels</h3>
            <p className="text-gray-400 mt-2">Create funnels with multiple links and let our algorithm distribute traffic based on weight, priority, and click count.</p>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="w-10 h-10 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Group Rounds</h3>
            <p className="text-gray-400 mt-2">Create groups of up to 50 members. Each member adds a link, and traffic is distributed equitably in rounds.</p>
          </div>

          <div className="bg-gray-900 rounded-xl border border-gray-800 p-6">
            <div className="w-10 h-10 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
              <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white">Advanced Analytics</h3>
            <p className="text-gray-400 mt-2">Track every click with detailed analytics: geo, device, browser, and more. See real-time performance data.</p>
          </div>
        </div>
      </main>

      <footer className="max-w-7xl mx-auto px-6 py-8 border-t border-gray-800 text-center text-gray-500 text-sm">
        ChatsFunnels &copy; {new Date().getFullYear()}. All rights reserved.
      </footer>
    </div>
  );
}
