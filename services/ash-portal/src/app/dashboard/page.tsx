'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
  MessageCircle
} from 'lucide-react'
import toast from 'react-hot-toast'

interface Order {
  id: string
  order_number: string
  status: string
  total_amount: number
  currency: string
  delivery_date: string | null
  created_at: string
  brand: { name: string } | null
  progress: {
    percentage: number
    current_stage: string
    completed_steps: number
    total_steps: number
  }
  payment: {
    status: string
    total_invoiced: number
    total_paid: number
    outstanding: number
  }
  needs_approval: boolean
}

interface Notification {
  id: string
  type: string
  title: string
  message: string
  priority: string
  created_at: string
  is_read: boolean
  action_url?: string
}

export default function DashboardPage() {
  const [orders, setOrders] = useState<Order[]>([])
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true)

      // Fetch recent orders
      const ordersResponse = await fetch('/api/portal/orders?limit=5')
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json()
        setOrders(ordersData.orders)
      }

      // Fetch notifications
      const notificationsResponse = await fetch('/api/portal/notifications?limit=5')
      if (notificationsResponse.ok) {
        const notificationsData = await notificationsResponse.json()
        setNotifications(notificationsData.notifications)
        setUnreadCount(notificationsData.unreadCount)
      }

    } catch (error) {
      console.error('Error fetching dashboard data:', error)
      toast.error('Failed to load dashboard data')
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'draft': 'bg-gray-500',
      'confirmed': 'bg-blue-500',
      'in_production': 'bg-yellow-500',
      'quality_check': 'bg-purple-500',
      'ready_to_ship': 'bg-orange-500',
      'shipped': 'bg-green-500',
      'delivered': 'bg-emerald-500',
      'cancelled': 'bg-red-500'
    }
    return colors[status] || 'bg-gray-500'
  }

  const getPaymentStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'paid': 'text-green-600 bg-green-50',
      'partial': 'text-orange-600 bg-orange-50',
      'pending': 'text-red-600 bg-red-50'
    }
    return colors[status] || 'text-gray-600 bg-gray-50'
  }

  const getPriorityColor = (priority: string) => {
    const colors: Record<string, string> = {
      'LOW': 'text-gray-600',
      'MEDIUM': 'text-blue-600',
      'HIGH': 'text-orange-600',
      'URGENT': 'text-red-600'
    }
    return colors[priority] || 'text-gray-600'
  }

  const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency
    }).format(amount)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <ShirtIcon className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">ASH AI Portal</h1>
                <p className="text-sm text-gray-600">Manufacturing Dashboard</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Button variant="outline" size="sm" className="relative">
                  <Bell className="h-4 w-4" />
                  {unreadCount > 0 && (
                    <span className="absolute -top-2 -right-2 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                      {unreadCount}
                    </span>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
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
                    {orders.filter(o => o.status === 'in_production').length}
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
                      orders[0]?.currency || 'PHP'
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
              {unreadCount > 0 && (
                <span className="ml-2 px-2 py-0.5 text-xs bg-red-500 text-white rounded-full">
                  {unreadCount}
                </span>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="orders" className="space-y-6">
            <div className="space-y-4">
              {orders.map((order) => (
                <Card key={order.id}>
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <div>
                        <CardTitle className="text-lg">
                          Order #{order.order_number}
                        </CardTitle>
                        <CardDescription>
                          {order.brand?.name && `${order.brand.name} • `}
                          Created {new Date(order.created_at).toLocaleDateString()}
                          {order.delivery_date && (
                            <> • Due {new Date(order.delivery_date).toLocaleDateString()}</>
                          )}
                        </CardDescription>
                      </div>
                      <div className="flex items-center space-x-2">
                        {order.needs_approval && (
                          <Badge variant="outline" className="bg-orange-50 text-orange-600 border-orange-200">
                            <AlertCircle className="h-3 w-3 mr-1" />
                            Needs Approval
                          </Badge>
                        )}
                        <Badge className={getStatusColor(order.status)}>
                          {order.status.replace('_', ' ')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
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
                        <Progress value={order.progress.percentage} className="h-2" />
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
                          <Badge variant="outline" className={getPaymentStatusColor(order.payment.status)}>
                            {order.payment.status}
                          </Badge>
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
                        <Button variant="outline" size="sm">
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Button>
                        {order.needs_approval && (
                          <Button variant="default" size="sm">
                            <CheckCircle className="h-4 w-4 mr-2" />
                            Review Design
                          </Button>
                        )}
                        {order.payment.outstanding > 0 && (
                          <Button variant="outline" size="sm">
                            <CreditCard className="h-4 w-4 mr-2" />
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
                    <Package className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      No orders yet
                    </h3>
                    <p className="text-gray-600">
                      Your recent orders will appear here once you start placing orders.
                    </p>
                  </CardContent>
                </Card>
              )}
            </div>
          </TabsContent>

          <TabsContent value="notifications" className="space-y-4">
            {notifications.map((notification) => (
              <Card key={notification.id} className={!notification.is_read ? 'bg-blue-50' : ''}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <h4 className="font-semibold text-gray-900">
                          {notification.title}
                        </h4>
                        {!notification.is_read && (
                          <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                        )}
                        <Badge variant="outline" className={getPriorityColor(notification.priority)}>
                          {notification.priority}
                        </Badge>
                      </div>
                      <p className="text-gray-600 mb-2">{notification.message}</p>
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
                  <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    No notifications
                  </h3>
                  <p className="text-gray-600">
                    You'll receive updates about your orders and account here.
                  </p>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}