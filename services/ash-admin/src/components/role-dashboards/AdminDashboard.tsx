'use client'

export default function AdminDashboard() {
  return (
    <div className="space-y-6">
      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
          <h3 className="text-base font-semibold text-gray-700 mb-2">🏢 System Overview</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">All Access</p>
          <p className="text-sm text-blue-600">Complete system control</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
          <h3 className="text-base font-semibold text-gray-700 mb-2">👥 Active Users</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">247</p>
          <p className="text-sm text-green-600">+12 this week</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
          <h3 className="text-base font-semibold text-gray-700 mb-2">📊 System Health</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">99.8%</p>
          <p className="text-sm text-yellow-600">Uptime</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
          <h3 className="text-base font-semibold text-gray-700 mb-2">⚡ Performance</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">Fast</p>
          <p className="text-sm text-purple-600">All systems optimal</p>
        </div>
      </div>

      {/* Admin Tasks */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🔧 Administrator Tasks</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <h3 className="font-medium text-gray-900">👤 User Management</h3>
            <p className="text-sm text-gray-600 mt-1">Manage employee accounts and permissions</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <h3 className="font-medium text-gray-900">⚙️ System Settings</h3>
            <p className="text-sm text-gray-600 mt-1">Configure global system preferences</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <h3 className="font-medium text-gray-900">📊 Reports & Analytics</h3>
            <p className="text-sm text-gray-600 mt-1">View comprehensive system reports</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <h3 className="font-medium text-gray-900">🔒 Security & Auditing</h3>
            <p className="text-sm text-gray-600 mt-1">Monitor security events and logs</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <h3 className="font-medium text-gray-900">💾 Database Management</h3>
            <p className="text-sm text-gray-600 mt-1">Backup and maintenance operations</p>
          </div>
          <div className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 cursor-pointer">
            <h3 className="font-medium text-gray-900">🔄 System Updates</h3>
            <p className="text-sm text-gray-600 mt-1">Manage system updates and patches</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h2>
        <div className="flex flex-wrap gap-3">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700">
            View All Orders
          </button>
          <button className="px-4 py-2 bg-green-600 text-white rounded-md text-sm font-medium hover:bg-green-700">
            Production Status
          </button>
          <button className="px-4 py-2 bg-yellow-600 text-white rounded-md text-sm font-medium hover:bg-yellow-700">
            Financial Reports
          </button>
          <button className="px-4 py-2 bg-purple-600 text-white rounded-md text-sm font-medium hover:bg-purple-700">
            Employee Management
          </button>
        </div>
      </div>
    </div>
  )
}