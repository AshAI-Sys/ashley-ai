"use client";

export default function CuttingOperatorDashboard() {
  return (
    <div className="space-y-6">
      {/* Today's Stats */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-4">
        <div className="rounded-lg border-l-4 border-blue-500 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-base font-semibold text-gray-700">
            ✂️ Today's Tasks
          </h3>
          <p className="mb-1 text-3xl font-bold text-gray-900">8</p>
          <p className="text-sm text-blue-600">Cutting orders assigned</p>
        </div>
        <div className="rounded-lg border-l-4 border-green-500 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-base font-semibold text-gray-700">
            📦 Completed
          </h3>
          <p className="mb-1 text-3xl font-bold text-gray-900">5</p>
          <p className="text-sm text-green-600">Orders finished today</p>
        </div>
        <div className="rounded-lg border-l-4 border-yellow-500 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-base font-semibold text-gray-700">
            🎯 Efficiency
          </h3>
          <p className="mb-1 text-3xl font-bold text-gray-900">94%</p>
          <p className="text-sm text-yellow-600">Above target</p>
        </div>
        <div className="rounded-lg border-l-4 border-purple-500 bg-white p-6 shadow-sm">
          <h3 className="mb-2 text-base font-semibold text-gray-700">
            🕐 Hours Logged
          </h3>
          <p className="mb-1 text-3xl font-bold text-gray-900">6.5</p>
          <p className="text-sm text-purple-600">Out of 8 hours</p>
        </div>
      </div>

      {/* Current Tasks */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          ✂️ My Cutting Tasks
        </h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <h3 className="font-medium text-gray-900">Order #ORD-2024-001</h3>
              <p className="text-sm text-gray-600">
                T-Shirts - Size M, L, XL • Client: ABC Company
              </p>
              <p className="mt-1 text-xs text-blue-600">
                Priority: High • Due: Today 3:00 PM
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center rounded-full bg-yellow-100 px-2.5 py-0.5 text-xs font-medium text-yellow-800">
                In Progress
              </span>
              <button className="rounded bg-blue-600 px-3 py-1 text-sm text-white hover:bg-blue-700">
                Continue
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <h3 className="font-medium text-gray-900">Order #ORD-2024-002</h3>
              <p className="text-sm text-gray-600">
                Polo Shirts - Various sizes • Client: XYZ Corp
              </p>
              <p className="mt-1 text-xs text-green-600">
                Priority: Medium • Due: Tomorrow 10:00 AM
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                Pending
              </span>
              <button className="rounded bg-green-600 px-3 py-1 text-sm text-white hover:bg-green-700">
                Start
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-gray-200 p-4">
            <div>
              <h3 className="font-medium text-gray-900">Order #ORD-2024-003</h3>
              <p className="text-sm text-gray-600">
                Hoodies - Size S, M, L • Client: Fashion Store
              </p>
              <p className="mt-1 text-xs text-purple-600">
                Priority: Low • Due: Next Week
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-medium text-gray-800">
                Scheduled
              </span>
              <button className="rounded bg-gray-600 px-3 py-1 text-sm text-white hover:bg-gray-700">
                View
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          ⚡ Quick Actions
        </h2>
        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <button className="rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50">
            <h3 className="font-medium text-gray-900">🕐 Clock In/Out</h3>
            <p className="mt-1 text-sm text-gray-600">Record your work hours</p>
          </button>
          <button className="rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50">
            <h3 className="font-medium text-gray-900">📋 View Cutting Plans</h3>
            <p className="mt-1 text-sm text-gray-600">
              Check today's cutting layouts
            </p>
          </button>
          <button className="rounded-lg border border-gray-200 p-4 text-left hover:bg-gray-50">
            <h3 className="font-medium text-gray-900">📊 Report Issue</h3>
            <p className="mt-1 text-sm text-gray-600">
              Report material or equipment issues
            </p>
          </button>
        </div>
      </div>

      {/* Performance */}
      <div className="rounded-lg bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold text-gray-900">
          📈 My Performance
        </h2>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              Weekly Efficiency
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>This Week</span>
                <span>94%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-green-600"
                  style={{ width: "94%" }}
                ></div>
              </div>
            </div>
          </div>
          <div>
            <h3 className="mb-2 text-sm font-medium text-gray-700">
              Orders Completed
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>This Week</span>
                <span>23/25</span>
              </div>
              <div className="h-2 w-full rounded-full bg-gray-200">
                <div
                  className="h-2 rounded-full bg-blue-600"
                  style={{ width: "92%" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
