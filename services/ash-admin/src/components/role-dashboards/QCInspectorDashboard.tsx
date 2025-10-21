"use client";

export default function QCInspectorDashboard() {
  return (
    <div className="space-y-6">
      {/* Today's Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border-l-4 border-blue-500 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-base font-semibold text-gray-700">
            🔍 Inspections Today
          </h3>
          <p className="mb-1 text-3xl font-bold text-gray-900">12</p>
          <p className="text-sm text-blue-600">Orders to inspect</p>
        </div>
        <div className="rounded-lg border-l-4 border-green-500 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-base font-semibold text-gray-700">
            ✅ Passed
          </h3>
          <p className="mb-1 text-3xl font-bold text-gray-900">9</p>
          <p className="text-sm text-green-600">Quality approved</p>
        </div>
        <div className="rounded-lg border-l-4 border-red-500 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-base font-semibold text-gray-700">
            ❌ Failed
          </h3>
          <p className="mb-1 text-3xl font-bold text-gray-900">2</p>
          <p className="text-sm text-red-600">Requires rework</p>
        </div>
        <div className="rounded-lg border-l-4 border-yellow-500 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-base font-semibold text-gray-700">
            ⏳ In Review
          </h3>
          <p className="mb-1 text-3xl font-bold text-gray-900">1</p>
          <p className="text-sm text-yellow-600">Currently inspecting</p>
        </div>
      </div>

      {/* Pending Inspections */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          🔍 Pending Quality Inspections
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <h3 className="font-medium text-gray-900">
                Order #ORD-2024-001 - Cutting Stage
              </h3>
              <p className="text-sm text-gray-600">
                T-Shirts Batch #001 • 500 units • AQL 2.5
              </p>
              <p className="mt-1 text-xs text-red-600">
                Priority: Urgent • Due: 2:00 PM
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-medium text-red-800">
                Urgent
              </span>
              <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                Inspect
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <h3 className="font-medium text-gray-900">
                Order #ORD-2024-002 - Sewing Stage
              </h3>
              <p className="text-sm text-gray-600">
                Polo Shirts Batch #002 • 300 units • AQL 1.5
              </p>
              <p className="mt-1 text-xs text-yellow-600">
                Priority: High • Due: 4:00 PM
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                High
              </span>
              <button className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700">
                Start
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <h3 className="font-medium text-gray-900">
                Order #ORD-2024-003 - Finishing Stage
              </h3>
              <p className="text-sm text-gray-600">
                Hoodies Batch #003 • 200 units • AQL 1.0
              </p>
              <p className="mt-1 text-xs text-green-600">
                Priority: Normal • Due: Tomorrow
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center rounded-full bg-green-100 px-2.5 py-0.5 text-xs font-medium text-green-800">
                Normal
              </span>
              <button className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700">
                Schedule
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quality Metrics */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            📊 Weekly Quality Stats
          </h2>
          <div className="space-y-4">
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Pass Rate</span>
                <span>94.2%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-600"
                  style={{ width: "94.2%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Inspections Completed</span>
                <span>89/95</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: "93.7%" }}
                ></div>
              </div>
            </div>
            <div>
              <div className="mb-1 flex justify-between text-sm">
                <span>Avg. Inspection Time</span>
                <span>12 min</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-yellow-600"
                  style={{ width: "75%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-lg bg-white p-6 shadow-sm">
          <h2 className="mb-4 text-lg font-semibold text-gray-900">
            ⚡ Quick Actions
          </h2>
          <div className="space-y-3">
            <button className="w-full rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50">
              <h3 className="font-medium text-gray-900">
                📋 Start New Inspection
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Begin quality control process
              </p>
            </button>
            <button className="w-full rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50">
              <h3 className="font-medium text-gray-900">
                📊 View CAPA Reports
              </h3>
              <p className="mt-1 text-sm text-gray-600">
                Check corrective actions
              </p>
            </button>
            <button className="w-full rounded-lg border border-gray-200 p-3 text-left hover:bg-gray-50">
              <h3 className="font-medium text-gray-900">❌ Report Defect</h3>
              <p className="mt-1 text-sm text-gray-600">Log quality issues</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
