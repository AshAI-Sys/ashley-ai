'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-dark-gradient flex items-center justify-center font-sans p-4">
      <div className="glass-card p-10 text-center max-w-md">
        <div className="mb-6">
          <div className="w-20 h-20 mx-auto bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/50">
            <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
            </svg>
          </div>
        </div>

        <h1 className="text-4xl font-bold text-white mb-4">
          Ashley AI Admin
        </h1>

        <p className="text-gray-300 mb-8">
          Apparel Smart Hub - Artificial Intelligence
        </p>

        <Link
          href="/login"
          className="inline-block w-full px-6 py-3 glass-button glow-border text-blue-400 hover:bg-blue-500/30 rounded-lg font-medium transition-all"
        >
          Access Production System
        </Link>

        <div className="mt-6 pt-6 border-t border-white/10">
          <p className="text-sm text-gray-400">
            Manufacturing ERP • AI-Powered • Real-Time Analytics
          </p>
        </div>
      </div>
    </div>
  )
}
