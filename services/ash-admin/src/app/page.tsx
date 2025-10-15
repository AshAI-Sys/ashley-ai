'use client'

import Link from 'next/link'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center font-sans transition-colors">
      <div className="bg-white dark:bg-gray-800 p-10 rounded-xl shadow-lg text-center max-w-md border border-gray-200 dark:border-gray-700">
        <div className="mb-6">
          <img
            src="/ash-ai-logo.png"
            alt="Ashley AI Logo"
            className="w-20 h-20 mx-auto block"
          />
        </div>

        <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
          Ashley AI Admin
        </h1>

        <p className="text-gray-600 dark:text-gray-400 mb-8">
          Apparel Smart Hub - Artificial Intelligence
        </p>

        <Link
          href="/login"
          className="inline-block w-full px-6 py-3 bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
        >
          Access Production System
        </Link>
      </div>
    </div>
  )
}
