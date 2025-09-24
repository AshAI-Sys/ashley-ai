'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = RouteGuard;
const auth_context_1 = require("../lib/auth-context");
const permissions_1 = require("../lib/permissions");
const navigation_1 = require("next/navigation");
const react_1 = require("react");
const navigation_2 = require("next/navigation");
function RouteGuard({ children }) {
    const { user, isLoading } = (0, auth_context_1.useAuth)();
    const pathname = (0, navigation_1.usePathname)();
    const router = (0, navigation_2.useRouter)();
    (0, react_1.useEffect)(() => {
        if (!isLoading && user) {
            // Transform user to permissions User interface
            const permUser = {
                id: user.id,
                email: user.email,
                name: user.name,
                role: user.role,
                position: user.position || '',
                department: user.department || 'Administration',
                permissions: user.permissions || {}
            };
            // Check if user has access to current route
            const routeAccess = (0, permissions_1.hasAccess)(permUser, pathname);
            if (!routeAccess) {
                // Redirect to dashboard if no access
                router.push('/dashboard');
                return;
            }
        }
    }, [user, isLoading, pathname, router]);
    if (isLoading) {
        return (<div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>);
    }
    if (!user) {
        return (<div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600 mb-4">Please log in to access this page</p>
          <button onClick={() => router.push('/login')} className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700">
            Go to Login
          </button>
        </div>
      </div>);
    }
    return <>{children}</>;
}
