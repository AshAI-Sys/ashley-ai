'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = QCInspectorDashboard;
function QCInspectorDashboard() {
    return (<div className="space-y-6">
      {/* Today's Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-blue-500">
          <h3 className="text-base font-semibold text-gray-700 mb-2">🔍 Inspections Today</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">12</p>
          <p className="text-sm text-blue-600">Orders to inspect</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-green-500">
          <h3 className="text-base font-semibold text-gray-700 mb-2">✅ Passed</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">9</p>
          <p className="text-sm text-green-600">Quality approved</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-red-500">
          <h3 className="text-base font-semibold text-gray-700 mb-2">❌ Failed</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">2</p>
          <p className="text-sm text-red-600">Requires rework</p>
        </div>
        <div className="bg-white rounded-lg p-6 shadow-sm border-l-4 border-yellow-500">
          <h3 className="text-base font-semibold text-gray-700 mb-2">⏳ In Review</h3>
          <p className="text-3xl font-bold text-gray-900 mb-1">1</p>
          <p className="text-sm text-yellow-600">Currently inspecting</p>
        </div>
      </div>

      {/* Pending Inspections */}
      <div className="bg-white rounded-lg p-6 shadow-sm">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">🔍 Pending Quality Inspections</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Order #ORD-2024-001 - Cutting Stage</h3>
              <p className="text-sm text-gray-600">T-Shirts Batch #001 • 500 units • AQL 2.5</p>
              <p className="text-xs text-red-600 mt-1">Priority: Urgent • Due: 2:00 PM</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                Urgent
              </span>
              <button className="px-3 py-1 bg-blue-600 text-white rounded text-sm hover:bg-blue-700">
                Inspect
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Order #ORD-2024-002 - Sewing Stage</h3>
              <p className="text-sm text-gray-600">Polo Shirts Batch #002 • 300 units • AQL 1.5</p>
              <p className="text-xs text-yellow-600 mt-1">Priority: High • Due: 4:00 PM</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                High
              </span>
              <button className="px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700">
                Start
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
            <div>
              <h3 className="font-medium text-gray-900">Order #ORD-2024-003 - Finishing Stage</h3>
              <p className="text-sm text-gray-600">Hoodies Batch #003 • 200 units • AQL 1.0</p>
              <p className="text-xs text-green-600 mt-1">Priority: Normal • Due: Tomorrow</p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Normal
              </span>
              <button className="px-3 py-1 bg-gray-600 text-white rounded text-sm hover:bg-gray-700">
                Schedule
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">📊 Weekly Quality Stats</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Pass Rate</span>
                <span>94.2%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '94.2%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Inspections Completed</span>
                <span>89/95</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '93.7%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span>Avg. Inspection Time</span>
                <span>12 min</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-600 h-2 rounded-full" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">⚡ Quick Actions</h2>
          <div className="space-y-3">
            <button className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">📋 Start New Inspection</h3>
              <p className="text-sm text-gray-600 mt-1">Begin quality control process</p>
            </button>
            <button className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">📊 View CAPA Reports</h3>
              <p className="text-sm text-gray-600 mt-1">Check corrective actions</p>
            </button>
            <button className="w-full p-3 border border-gray-200 rounded-lg hover:bg-gray-50 text-left">
              <h3 className="font-medium text-gray-900">❌ Report Defect</h3>
              <p className="text-sm text-gray-600 mt-1">Log quality issues</p>
            </button>
          </div>
        </div>
      </div>
    </div>);
}
