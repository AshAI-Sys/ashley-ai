'use client';
"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = DashboardPage;
const react_1 = require("react");
const card_1 = require("@/components/ui/card");
const badge_1 = require("@/components/ui/badge");
const button_1 = require("@/components/ui/button");
const progress_1 = require("@/components/ui/progress");
const tabs_1 = require("@/components/ui/tabs");
const lucide_react_1 = require("lucide-react");
const react_hot_toast_1 = __importDefault(require("react-hot-toast"));
function DashboardPage() {
    const [orders, setOrders] = (0, react_1.useState)([]);
    const [notifications, setNotifications] = (0, react_1.useState)([]);
    const [unreadCount, setUnreadCount] = (0, react_1.useState)(0);
    const [isLoading, setIsLoading] = (0, react_1.useState)(true);
    (0, react_1.useEffect)(() => {
        fetchDashboardData();
    }, []);
    const fetchDashboardData = async () => {
        try {
            setIsLoading(true);
            // Fetch recent orders
            const ordersResponse = await fetch('/api/portal/orders?limit=5');
            if (ordersResponse.ok) {
                const ordersData = await ordersResponse.json();
                setOrders(ordersData.orders);
            }
            // Fetch notifications
            const notificationsResponse = await fetch('/api/portal/notifications?limit=5');
            if (notificationsResponse.ok) {
                const notificationsData = await notificationsResponse.json();
                setNotifications(notificationsData.notifications);
                setUnreadCount(notificationsData.unreadCount);
            }
        }
        catch (error) {
            console.error('Error fetching dashboard data:', error);
            react_hot_toast_1.default.error('Failed to load dashboard data');
        }
        finally {
            setIsLoading(false);
        }
    };
    const getStatusColor = (status) => {
        const colors = {
            'draft': 'bg-gray-500',
            'confirmed': 'bg-blue-500',
            'in_production': 'bg-yellow-500',
            'quality_check': 'bg-purple-500',
            'ready_to_ship': 'bg-orange-500',
            'shipped': 'bg-green-500',
            'delivered': 'bg-emerald-500',
            'cancelled': 'bg-red-500'
        };
        return colors[status] || 'bg-gray-500';
    };
    const getPaymentStatusColor = (status) => {
        const colors = {
            'paid': 'text-green-600 bg-green-50',
            'partial': 'text-orange-600 bg-orange-50',
            'pending': 'text-red-600 bg-red-50'
        };
        return colors[status] || 'text-gray-600 bg-gray-50';
    };
    const getPriorityColor = (priority) => {
        const colors = {
            'LOW': 'text-gray-600',
            'MEDIUM': 'text-blue-600',
            'HIGH': 'text-orange-600',
            'URGENT': 'text-red-600'
        };
        return colors[priority] || 'text-gray-600';
    };
    const formatCurrency = (amount, currency) => {
        return new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: currency
        }).format(amount);
    };
    if (isLoading) {
        return (<div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <lucide_react_1.ShirtIcon className="h-8 w-8 text-blue-600"/>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ASH AI Portal</h1>
                <p className="text-sm text-gray-600">Manufacturing Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <button_1.Button variant="outline" size="sm" className="relative">
                  <lucide_react_1.Bell className="h-4 w-4"/>
                  {unreadCount > 0 && (<span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>)}
                </button_1.Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <card_1.Card>
            <card_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <lucide_react_1.Package className="h-8 w-8 text-blue-600"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Production</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === 'in_production').length}
                  </p>
                </div>
                <lucide_react_1.TrendingUp className="h-8 w-8 text-yellow-600"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Needs Approval</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.needs_approval).length}
                  </p>
                </div>
                <lucide_react_1.AlertCircle className="h-8 w-8 text-orange-600"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>

          <card_1.Card>
            <card_1.CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Outstanding Payment</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(orders.reduce((sum, o) => sum + o.payment.outstanding, 0), orders[0]?.currency || 'PHP')}
                  </p>
                </div>
                <lucide_react_1.CreditCard className="h-8 w-8 text-red-600"/>
              </div>
            </card_1.CardContent>
          </card_1.Card>
        </div>

        <tabs_1.Tabs defaultValue="orders" className="space-y-6">
          <tabs_1.TabsList>
            <tabs_1.TabsTrigger value="orders">Recent Orders</tabs_1.TabsTrigger>
            <tabs_1.TabsTrigger value="notifications" className="relative">
              Notifications
              {unreadCount > 0 && (<span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {unreadCount}
                </span>)}
            </tabs_1.TabsTrigger>
          </tabs_1.TabsList>

          <tabs_1.TabsContent value="orders" className="space-y-6">
            <div className="space-y-4">
              {orders.map((order) => (<card_1.Card key={order.id}>
                  <card_1.CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <card_1.CardTitle className="text-lg">
                          Order #{order.order_number}
                        </card_1.CardTitle>
                        <card_1.CardDescription>
                          {order.brand?.name && `${order.brand.name} • `}
                          Created {new Date(order.created_at).toLocaleDateString()}
                          {order.delivery_date && (<> • Due {new Date(order.delivery_date).toLocaleDateString()}</>)}
                        </card_1.CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {order.needs_approval && (<badge_1.Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                            <lucide_react_1.AlertCircle className="h-3 w-3 mr-1"/>
                            Needs Approval
                          </badge_1.Badge>)}
                        <badge_1.Badge className={getStatusColor(order.status)}>
                          {order.status.replace('_', ' ')}
                        </badge_1.Badge>
                      </div>
                    </div>
                  </card_1.CardHeader>
                  <card_1.CardContent>
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium text-gray-700">
                            {order.progress.current_stage}
                          </span>
                          <span className="text-sm text-gray-500">
                            {order.progress.completed_steps}/{order.progress.total_steps} steps
                          </span>
                        </div>
                        <progress_1.Progress value={order.progress.percentage} className="h-2"/>
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                          <p className="text-sm text-gray-600">Order Value</p>
                          <p className="font-semibold">
                            {formatCurrency(order.total_amount, order.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Payment Status</p>
                          <badge_1.Badge variant="outline" className={getPaymentStatusColor(order.payment.status)}>
                            {order.payment.status}
                          </badge_1.Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Outstanding</p>
                          <p className="font-semibold">
                            {formatCurrency(order.payment.outstanding, order.currency)}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <button_1.Button variant="outline" size="sm">
                          <lucide_react_1.Eye className="h-4 w-4 mr-2"/>
                          View Details
                        </button_1.Button>
                        {order.needs_approval && (<button_1.Button variant="default" size="sm">
                            <lucide_react_1.CheckCircle className="h-4 w-4 mr-2"/>
                            Review Design
                          </button_1.Button>)}
                        {order.payment.outstanding > 0 && (<button_1.Button variant="outline" size="sm">
                            <lucide_react_1.CreditCard className="h-4 w-4 mr-2"/>
                            Pay Now
                          </button_1.Button>)}
                      </div>
                    </div>
                  </card_1.CardContent>
                </card_1.Card>))}

              {orders.length === 0 && (<card_1.Card>
                  <card_1.CardContent className="p-12 text-center">
                    <lucide_react_1.Package className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No orders yet
                    </h3>
                    <p className="text-gray-600">
                      Your recent orders will appear here once you start placing orders.
                    </p>
                  </card_1.CardContent>
                </card_1.Card>)}
            </div>
          </tabs_1.TabsContent>

          <tabs_1.TabsContent value="notifications" className="space-y-4">
            {notifications.map((notification) => (<card_1.Card key={notification.id} className={!notification.is_read ? 'bg-blue-50' : ''}>
                <card_1.CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {notification.title}
                        </h4>
                        {!notification.is_read && (<div className="w-2 h-2 bg-blue-600 rounded-full"></div>)}
                        <badge_1.Badge variant="outline" className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </badge_1.Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {notification.action_url && (<button_1.Button variant="outline" size="sm">
                        View
                      </button_1.Button>)}
                  </div>
                </card_1.CardContent>
              </card_1.Card>))}

            {notifications.length === 0 && (<card_1.Card>
                <card_1.CardContent className="p-12 text-center">
                  <lucide_react_1.Bell className="h-12 w-12 text-gray-400 mx-auto mb-4"/>
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No notifications
                  </h3>
                  <p className="text-gray-600">
                    You'll receive updates about your orders and account here.
                  </p>
                </card_1.CardContent>
              </card_1.Card>)}
          </tabs_1.TabsContent>
        </tabs_1.Tabs>
      </div>
    </div>);
}
