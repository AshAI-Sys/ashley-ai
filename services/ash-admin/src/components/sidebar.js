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
const lucide_react_1 = require("lucide-react");
const navigation = [
    { name: 'Dashboard', href: '/dashboard', icon: lucide_react_1.Home },
    { name: 'Clients', href: '/clients', icon: lucide_react_1.Building2 },
    { name: 'Orders', href: '/orders', icon: lucide_react_1.ShoppingCart },
    { name: 'Design & Approval', href: '/designs', icon: lucide_react_1.Palette },
    { name: 'Cutting Operations', href: '/cutting', icon: lucide_react_1.Scissors },
    { name: 'Printing Operations', href: '/printing', icon: lucide_react_1.Printer },
    { name: 'Sewing Operations', href: '/sewing', icon: lucide_react_1.PocketKnife },
    { name: 'Quality Control', href: '/quality-control', icon: lucide_react_1.CheckCircle },
    { name: 'Finishing & Packing', href: '/finishing-packing', icon: lucide_react_1.Package },
    { name: 'Delivery Management', href: '/delivery', icon: lucide_react_1.Truck },
    { name: 'Finance', href: '/finance', icon: lucide_react_1.DollarSign },
    { name: 'HR & Payroll', href: '/hr-payroll', icon: lucide_react_1.Users },
    { name: 'Maintenance', href: '/maintenance', icon: lucide_react_1.Wrench },
    { name: 'Client Portal', href: '/client-portal', icon: lucide_react_1.Globe },
    { name: 'Merchandising AI', href: '/merchandising-ai', icon: lucide_react_1.Bot },
    { name: 'Automation Engine', href: '/automation', icon: lucide_react_1.Zap },
    { name: 'Analytics', href: '/analytics', icon: lucide_react_1.BarChart3 },
];
function Sidebar() {
    const [collapsed, setCollapsed] = (0, react_1.useState)(false);
    const pathname = (0, navigation_1.usePathname)();
    return (<div className={`bg-gray-900 text-white transition-all duration-300 ${collapsed ? 'w-16' : 'w-64'} min-h-screen flex flex-col`}>
      {/* Header */}
      <div className="p-4 border-b border-gray-700">
        <div className="flex items-center justify-between">
          {!collapsed && (<div className="flex items-center">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center mr-3">
                <lucide_react_1.Bot className="w-5 h-5"/>
              </div>
              <div>
                <h1 className="font-bold text-lg">ASH AI</h1>
                <p className="text-xs text-gray-400">Manufacturing ERP</p>
              </div>
            </div>)}
          <button onClick={() => setCollapsed(!collapsed)} className="p-1.5 rounded-md hover:bg-gray-700 transition-colors">
            {collapsed ? <lucide_react_1.ChevronRight className="w-4 h-4"/> : <lucide_react_1.ChevronLeft className="w-4 h-4"/>}
          </button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-3 space-y-1">
        {navigation.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (<link_1.default key={item.name} href={item.href} className={`
                flex items-center px-3 py-2 rounded-md text-sm font-medium transition-colors
                ${isActive
                    ? 'bg-blue-600 text-white'
                    : 'text-gray-300 hover:bg-gray-700 hover:text-white'}
              `} title={collapsed ? item.name : undefined}>
              <Icon className={`${collapsed ? 'w-5 h-5' : 'w-4 h-4 mr-3'} flex-shrink-0`}/>
              {!collapsed && <span>{item.name}</span>}
            </link_1.default>);
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-gray-700">
        {!collapsed && (<div className="text-xs text-gray-400">
            <p>Ashley AI v1.0</p>
            <p>Manufacturing ERP System</p>
          </div>)}
      </div>
    </div>);
}
