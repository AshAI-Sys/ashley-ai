'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardPage;
const react_1 = require("react");
const navigation_1 = require("next/navigation");
const dashboard_layout_1 = __importDefault(require("@/components/dashboard-layout"));
function DashboardPage() {
    const [user, setUser] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const router = (0, navigation_1.useRouter)();
    (0, react_1.useEffect)(() => {
        try {
            const token = localStorage.getItem('ash_token');
            console.log('Token found:', !!token);
            if (!token) {
                console.log('No token, redirecting to login');
                router.push('/login');
                return;
            }
            console.log('Setting user data');
            // Simulate user data from token
            setUser({
                name: 'Admin User',
                email: 'admin@ash.com',
                role: 'Administrator'
            });
            setLoading(false);
            console.log('Loading set to false');
        }
        catch (error) {
            console.error('Error in useEffect:', error);
            setLoading(false);
        }
    }, [router]);
    const handleLogout = () => {
        localStorage.removeItem('ash_token');
        router.push('/');
    };
    if (loading) {
        return (<div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="w-10 h-10 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"/>
          <p className="text-gray-600">Loading dashboard...</p>
        </div>
      </div>);
    }
    return (<dashboard_layout_1.default>
      <div className="min-h-screen bg-gray-50">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
              <p className="text-sm text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <button onClick={handleLogout} className="bg-red-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-red-700 transition-colors">
              Logout
            </button>
          </div>
        </header>

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-6 py-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {/* Stats Cards */}
            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-base font-semibold text-gray-700 mb-2">
                Total Orders
              </h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                1,234
              </p>
              <p className="text-sm text-green-600">
                ↗️ +12% from last month
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-base font-semibold text-gray-700 mb-2">
                Production Lines
              </h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                8
              </p>
              <p className="text-sm text-green-600">
                ✅ All operational
              </p>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-sm">
              <h3 className="text-base font-semibold text-gray-700 mb-2">
                Efficiency
              </h3>
              <p className="text-3xl font-bold text-gray-900 mb-1">
                94%
              </p>
              <p className="text-sm text-green-600">
                🎯 Above target
              </p>
            </div>
          </div>

          {/* Recent Activity */}
          <div className="bg-white rounded-lg p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">
              Recent Activity
            </h2>

            <div className="space-y-3">
              <div className="p-3 bg-gray-50 rounded-md border-l-4 border-blue-500">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Order #ASH-2025-001 completed
                </p>
                <p className="text-xs text-gray-600">
                  2 hours ago • 500 units delivered
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-md border-l-4 border-green-500">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Quality check passed for Bundle #B-789
                </p>
                <p className="text-xs text-gray-600">
                  4 hours ago • 100% quality score
                </p>
              </div>

              <div className="p-3 bg-gray-50 rounded-md border-l-4 border-amber-500">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  New order received from Brand XYZ
                </p>
                <p className="text-xs text-gray-600">
                  6 hours ago • 1,000 units requested
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </dashboard_layout_1.default>);
}
