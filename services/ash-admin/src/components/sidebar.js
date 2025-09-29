'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = Sidebar;
const react_1 = require("react");
const link_1 = __importDefault(require("next/link"));
const navigation_1 = require("next/navigation");
const auth_context_1 = require("../lib/auth-context");
const permissions_1 = require("../lib/permissions");
const hydration_safe_icon_1 = __importDefault(require("./hydration-safe-icon"));
const lucide_react_1 = require("lucide-react");
const iconMap = {
    Home: lucide_react_1.Home,
    Building2: lucide_react_1.Building2,
    ShoppingCart: lucide_react_1.ShoppingCart,
    Palette: lucide_react_1.Palette,
    Scissors: lucide_react_1.Scissors,
    Printer: lucide_react_1.Printer,
    PocketKnife: lucide_react_1.PocketKnife,
    CheckCircle: lucide_react_1.CheckCircle,
    Package: lucide_react_1.Package,
    Truck: lucide_react_1.Truck,
    DollarSign: lucide_react_1.DollarSign,
    Users: lucide_react_1.Users,
    Wrench: lucide_react_1.Wrench,
    Globe: lucide_react_1.Globe,
    Bot: lucide_react_1.Bot,
    Zap: lucide_react_1.Zap,
    BarChart3: lucide_react_1.BarChart3,
};
function Sidebar() {
    const [collapsed, setCollapsed] = (0, react_1.useState)(false);
    const pathname = (0, navigation_1.usePathname)();
    const { user } = (0, auth_context_1.useAuth)();
    // Get filtered navigation based on user role and department
    const navigation = (0, react_1.useMemo)(() => {
        if (!user) {
            // Default navigation for non-authenticated users
            return [{ name: 'Dashboard', href: '/dashboard', icon: 'Home', department: '*' }];
        }
        // Map current roles to our RBAC roles for compatibility
        const roleMapping = {
            'admin': 'admin',
            'Admin': 'admin',
            'manager': 'manager',
            'Manager': 'manager',
            'CSR': 'designer',
            'Worker': 'cutting_operator',
            'Client': 'warehouse_staff'
        };
        const mappedRole = roleMapping[user.role] || 'cutting_operator';
        // Get permissions based on role if not provided
        const { getRoleBasedPermissions } = require('../lib/rbac');
        const userPermissions = user.permissions && user.permissions.length > 0
            ? user.permissions
            : getRoleBasedPermissions(user.role || mappedRole);
        // Transform user to match our permissions User interface
        const permUser = {
            id: user.id,
            email: user.email,
            name: user.name || `${user.first_name || ''} ${user.last_name || ''}`.trim(),
            role: mappedRole,
            position: user.position || '',
            department: user.department || 'Administration',
            permissions: userPermissions
        };
        return (0, permissions_1.getAccessibleNavigation)(permUser);
    }, [user]);
    return (<div className={`bg-gray-900 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (<div className="flex items-center">
              <div className="w-10 h-8 mr-3">
                <img src="/ash-ai-logo.svg" alt="Ash-AI Logo" className="w-full h-full object-contain"/>
              </div>
              <div>
                <h1 className="font-bold text-lg">Ash-AI</h1>
                <p className="text-xs text-gray-400">Manufacturing ERP</p>
              </div>
            </div>)}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-md hover:bg-gray-700 transition-colors">
            <hydration_safe_icon_1.default Icon={collapsed ? lucide_react_1.ChevronRight : lucide_react_1.ChevronLeft} className="w-4 h-4"/>
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = iconMap[item.icon] || lucide_react_1.Home;
            return (<link_1.default key={item.name} href={item.href} className={`
                flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
              `} title={collapsed ? item.name : undefined}>
              <hydration_safe_icon_1.default Icon={Icon} className={`${collapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'} flex-shrink-0`}/>
              {!collapsed && <span>{item.name}</span>}
            </link_1.default>);
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        {!collapsed && user && (<div className="text-xs text-gray-400 mb-3">
            <p className="font-medium text-gray-300">{user.name}</p>
            <p>{user.position}</p>
            <p>{user.department} • {user.role}</p>
          </div>)}
        {!collapsed && (<div className="text-xs text-gray-400">
            <p>Ashley AI v1.0</p>
            <p>Manufacturing ERP System</p>
          </div>)}
      </div>
    </div>);
}
