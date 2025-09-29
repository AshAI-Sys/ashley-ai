'use client'

export default function CuttingOperatorDashboard() {
  return (
    <div className="space-y-6">
      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
          <h3 className="text-base font-semibold text-gray-700 mb-2">✂️ Today's Tasks</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">8</p>
          <p className="text-sm text-blue-600">Cutting orders assigned</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
          <h3 className="text-base font-semibold text-gray-700 mb-2">📦 Completed</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">5</p>
          <p className="text-sm text-green-600">Orders finished today</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
          <h3 className="text-base font-semibold text-gray-700 mb-2">🎯 Efficiency</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">94%</p>
          <p className="text-sm text-yellow-600">Above target</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-purple-500">
          <h3 className="text-base font-semibold text-gray-700 mb-2">🕐 Hours Logged</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">6.5</p>
          <p className="text-sm text-purple-600">Out of 8 hours</p>
        </div>
      </div>

      {/* Current Tasks */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">✂️ My Cutting Tasks</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Order #ORD-2024-001</h3>
              <p className="text-sm text-gray-600">T-Shirts - Size M, L, XL • Client: ABC Company</p>
              <p className="text-xs text-blue-600 mt-1">Priority: High • Due: Today 3:00 PM</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                In Progress
              </span>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                Continue
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Order #ORD-2024-002</h3>
              <p className="text-sm text-gray-600">Polo Shirts - Various sizes • Client: XYZ Corp</p>
              <p className="text-xs text-green-600 mt-1">Priority: Medium • Due: Tomorrow 10:00 AM</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Pending
              </span>
              <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                Start
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Order #ORD-2024-003</h3>
              <p className="text-sm text-gray-600">Hoodies - Size S, M, L • Client: Fashion Store</p>
              <p className="text-xs text-purple-600 mt-1">Priority: Low • Due: Next Week</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                Scheduled
              </span>
              <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h3 className="font-medium text-gray-900">🕐 Clock In/Out</h3>
            <p className="text-sm text-gray-600 mt-1">Record your work hours</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h3 className="font-medium text-gray-900">📋 View Cutting Plans</h3>
            <p className="text-sm text-gray-600 mt-1">Check today's cutting layouts</p>
          </button>
          <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
            <h3 className="font-medium text-gray-900">📊 Report Issue</h3>
            <p className="text-sm text-gray-600 mt-1">Report material or equipment issues</p>
          </button>
        </div>
      </div>

      {/* Performance */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">📈 My Performance</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Weekly Efficiency</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>This Week</span>
                <span>94%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{width: '94%'}}></div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Orders Completed</h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>This Week</span>
                <span>23/25</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{width: '92%'}}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}