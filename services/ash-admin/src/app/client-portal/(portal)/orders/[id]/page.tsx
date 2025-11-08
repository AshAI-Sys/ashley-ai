'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Palette, Scissors, Printer, Shirt, CheckCircle2, Package, Truck } from 'lucide-react';

export default function OrderDetailPage() {
  const params = useParams();
  const router = useRouter();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOrder();
  }, []);

  const loadOrder = async () => {
    try {
      const response = await fetch(`/api/client-portal/orders/${params.id}`);
      const data = await response.json();

      if (data.success) {
        setOrder(data.order);
      }
    } catch (error) {
      console.error('Error loading order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="bg-white rounded-lg shadow-sm p-8 text-center">
        <p className="text-gray-600">Order not found</p>
      </div>
    );
  }

  const progress = order.production_progress;
  const stageIcons: Record<string, any> = {
    design: Palette,
    cutting: Scissors,
    printing: Printer,
    sewing: Shirt,
    qc: CheckCircle2,
    finishing: Package,
    delivery: Truck,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-purple-600 hover:text-purple-700 mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Orders
        </button>

        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 mb-2">{order.order_number}</h1>
            <p className="text-gray-600">{order.description}</p>
          </div>
          <div className="text-right">
            <p className="text-sm text-gray-600 mb-1">Total Amount</p>
            <p className="text-2xl font-bold text-purple-600">₱{order.total_amount.toFixed(2)}</p>
          </div>
        </div>
      </div>

      {/* 7-Stage Production Progress */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-6">Production Progress</h2>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-gray-700">Overall Progress</span>
            <span className="text-sm font-bold text-purple-600">{progress.overall_percentage}%</span>
          </div>
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-600 to-indigo-600 transition-all duration-500"
              style={{ width: `${progress.overall_percentage}%` }}
            ></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Current Stage: <strong>{progress.current_stage}</strong></p>
        </div>

        {/* Stage Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {progress.stages.map((stage: any) => {
            const Icon = stageIcons[stage.key] || Package;
            const statusColor =
              stage.status === 'completed'
                ? 'bg-green-100 text-green-800 border-green-300'
                : stage.status === 'in_progress'
                ? 'bg-blue-100 text-blue-800 border-blue-300'
                : 'bg-gray-100 text-gray-600 border-gray-300';

            return (
              <div key={stage.key} className={`border-2 rounded-lg p-4 ${statusColor}`}>
                <div className="flex items-center gap-3 mb-2">
                  <Icon className="w-6 h-6" />
                  <h3 className="font-semibold">{stage.stage}</h3>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-medium uppercase">{stage.status.replace('_', ' ')}</span>
                  <span className="text-sm font-bold">{stage.percentage}%</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Order Details Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Order Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Order Date</p>
              <p className="font-medium text-gray-900">{new Date(order.created_at).toLocaleDateString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Quantity</p>
              <p className="font-medium text-gray-900">{order.quantity} pieces</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Status</p>
              <p className="font-medium text-gray-900">{order.status}</p>
            </div>
            {order.delivery_date && (
              <div>
                <p className="text-sm text-gray-600">Expected Delivery</p>
                <p className="font-medium text-gray-900">{new Date(order.delivery_date).toLocaleDateString()}</p>
              </div>
            )}
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Client Information</h2>
          <div className="space-y-3">
            <div>
              <p className="text-sm text-gray-600">Name</p>
              <p className="font-medium text-gray-900">{order.client.name}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Company</p>
              <p className="font-medium text-gray-900">{order.client.company || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-600">Email</p>
              <p className="font-medium text-gray-900">{order.client.email}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
