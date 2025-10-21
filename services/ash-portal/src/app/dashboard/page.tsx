"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  ShirtIcon,
  Package,
  Eye,
  CreditCard,
  Bell,
  CheckCircle,
  Clock,
  AlertCircle,
  TrendingUp,
  Calendar,
  MessageCircle,
} from "lucide-react";
import toast from "react-hot-toast";
import { ClientOnly } from "@/components/client-only";

interface Order {
  id: string;
  order_number: string;
  status: string;
  total_amount: number;
  currency: string;
  delivery_date: string | null;
  created_at: string;
  brand: { name: string } | null;
  progress: {
    percentage: number;
    current_stage: string;
    completed_steps: number;
    total_steps: number;
  };
  payment: {
    status: string;
    total_invoiced: number;
    total_paid: number;
    outstanding: number;
  };
  needs_approval: boolean;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  priority: string;
  created_at: string;
  is_read: boolean;
  action_url?: string;
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);

      // Fetch recent orders
      const ordersResponse = await fetch("/api/portal/orders?limit=5");
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders);
      }

      // Fetch notifications
      const notificationsResponse = await fetch(
        "/api/portal/notifications?limit=5"
      );
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json();
        setNotifications(notificationsData.notifications);
        setUnreadCount(notificationsData.unreadCount);
      }
    } catch (error) {
      console.error("Error fetching dashboard data:", error);
      toast.error("Failed to load dashboard data");
    } finally {
      setIsLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    if (!status) return "bg-gray-500";

    const colors: Record<string, string> = {
      draft: "bg-gray-500",
      confirmed: "bg-blue-500",
      in_production: "bg-yellow-500",
      quality_check: "bg-purple-500",
      ready_to_ship: "bg-orange-500",
      shipped: "bg-green-500",
      delivered: "bg-emerald-500",
      cancelled: "bg-red-500",
    };
    return colors[status.toLowerCase()] || "bg-gray-500";
  };

  const getPaymentStatusColor = (status: string) => {
    if (!status) return "text-gray-600 bg-gray-50";

    const colors: Record<string, string> = {
      paid: "text-green-600 bg-green-50",
      partial: "text-orange-600 bg-orange-50",
      pending: "text-red-600 bg-red-50",
    };
    return colors[status.toLowerCase()] || "text-gray-600 bg-gray-50";
  };

  const getPriorityColor = (priority: string) => {
    if (!priority) return "text-gray-600";

    const colors: Record<string, string> = {
      LOW: "text-gray-600",
      MEDIUM: "text-blue-600",
      HIGH: "text-orange-600",
      URGENT: "text-red-600",
    };
    return colors[priority.toUpperCase()] || "text-gray-600";
  };

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="border-b bg-white shadow-sm">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShirtIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  ASH AI Portal
                </h1>
                <p className="text-sm text-gray-600">Manufacturing Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  <ClientOnly>
                    {unreadCount > 0 && (
                      <span className="absolute -right-2 -top-2 flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-xs text-white">
                        {unreadCount}
                      </span>
                    )}
                  </ClientOnly>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-4">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Orders</p>
                  <p className="text-2xl font-bold">{orders.length}</p>
                </div>
                <Package className="h-8 w-8 text-blue-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">In Production</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.status === "in_production").length}
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-yellow-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Needs Approval</p>
                  <p className="text-2xl font-bold">
                    {orders.filter(o => o.needs_approval).length}
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-600" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Outstanding Payment</p>
                  <p className="text-2xl font-bold">
                    {formatCurrency(
                      orders.reduce((sum, o) => sum + o.payment.outstanding, 0),
                      orders[0]?.currency || "PHP"
                    )}
                  </p>
                </div>
                <CreditCard className="h-8 w-8 text-red-600" />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="orders" className="space-y-6">
          <TabsList>
            <TabsTrigger value="orders">Recent Orders</TabsTrigger>
            <TabsTrigger value="notifications" className="relative">
              Notifications
              <ClientOnly>
                {unreadCount > 0 && (
                  <span className="ml-2 rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
                    {unreadCount}
                  </span>
                )}
              </ClientOnly>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <div className="space-y-4">
              {orders.map(order => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.order_number}
                        </CardTitle>
                        <CardDescription>
                          {order.brand?.name && `${order.brand.name} • `}
                          Created{" "}
                          {new Date(order.created_at).toLocaleDateString()}
                          {order.delivery_date && (
                            <>
                              {" "}
                              • Due{" "}
                              {new Date(
                                order.delivery_date
                              ).toLocaleDateString()}
                            </>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {order.needs_approval && (
                          <Badge
                            variant="outline"
                            className="border-orange-200 bg-orange-50 text-orange-600"
                          >
                            <AlertCircle className="mr-1 h-3 w-3" />
                            Needs Approval
                          </Badge>
                        )}
                        <Badge className={getStatusColor(order.status)}>
                          {order.status?.replace("_", " ") || "Unknown"}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {/* Progress */}
                      <div>
                        <div className="mb-2 flex items-center justify-between">
                          <span className="text-sm font-medium text-gray-700">
                            {order.progress.current_stage}
                          </span>
                          <span className="text-sm text-gray-500">
                            {order.progress.completed_steps}/
                            {order.progress.total_steps} steps
                          </span>
                        </div>
                        <Progress
                          value={order.progress.percentage}
                          className="h-2"
                        />
                      </div>

                      {/* Order Details */}
                      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
                        <div>
                          <p className="text-sm text-gray-600">Order Value</p>
                          <p className="font-semibold">
                            {formatCurrency(order.total_amount, order.currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">
                            Payment Status
                          </p>
                          <Badge
                            variant="outline"
                            className={getPaymentStatusColor(
                              order.payment.status
                            )}
                          >
                            {order.payment.status}
                          </Badge>
                        </div>
                        <div>
                          <p className="text-sm text-gray-600">Outstanding</p>
                          <p className="font-semibold">
                            {formatCurrency(
                              order.payment.outstanding,
                              order.currency
                            )}
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </Button>
                        {order.needs_approval && (
                          <Button variant="default" size="sm">
                            <CheckCircle className="mr-2 h-4 w-4" />
                            Review Design
                          </Button>
                        )}
                        {order.payment.outstanding > 0 && (
                          <Button variant="outline" size="sm">
                            <CreditCard className="mr-2 h-4 w-4" />
                            Pay Now
                          </Button>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}

              {orders.length === 0 && (
                <Card>
                  <CardContent className="p-12 text-center">
                    <Package className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">
                      No orders yet
                    </h3>
                    <p className="text-gray-600">
                      Your recent orders will appear here once you start placing
                      orders.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            {notifications.map(notification => (
              <Card
                key={notification.id}
                className={!notification.is_read ? "bg-blue-50" : ""}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center space-x-2">
                        <h4 className="font-semibold text-gray-900">
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                        )}
                        <Badge
                          variant="outline"
                          className={getPriorityColor(notification.priority)}
                        >
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="mb-2 text-gray-600">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500">
                        {new Date(notification.created_at).toLocaleString()}
                      </p>
                    </div>
                    {notification.action_url && (
                      <Button variant="outline" size="sm">
                        View
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}

            {notifications.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <Bell className="mx-auto mb-4 h-12 w-12 text-gray-400" />
                  <h3 className="mb-2 text-lg font-semibold text-gray-900">
                    No notifications
                  </h3>
                  <p className="text-gray-600">
                    You&apos;ll receive updates about your orders and account here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
