'use client';

import { useState, useEffect } from 'react';
import {
  Brain,
  DollarSign,
  AlertTriangle,
  Calendar,
  Zap,
  TrendingUp,
  Target,
  Activity,
  Loader2
} from 'lucide-react';

export default function AIFeaturesPage() {
  const [activeFeature, setActiveFeature] = useState<'pricing' | 'scheduling' | 'bottleneck' | 'maintenance' | 'defects'>('pricing');

  const features = [
    {
      id: 'pricing',
      name: 'Dynamic Pricing',
      icon: DollarSign,
      color: 'blue',
      description: 'AI-powered pricing recommendations',
      status: 'active'
    },
    {
      id: 'scheduling',
      name: 'Smart Scheduling',
      icon: Calendar,
      color: 'purple',
      description: 'Optimized production scheduling',
      status: 'active'
    },
    {
      id: 'bottleneck',
      name: 'Bottleneck Detection',
      icon: AlertTriangle,
      color: 'orange',
      description: 'Real-time production flow analysis',
      status: 'active'
    },
    {
      id: 'maintenance',
      name: 'Predictive Maintenance',
      icon: Activity,
      color: 'green',
      description: 'AI failure prediction',
      status: 'active'
    },
    {
      id: 'defects',
      name: 'Defect Detection',
      icon: Target,
      color: 'red',
      description: 'Computer vision quality control',
      status: 'active'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Brain className="w-8 h-8 text-indigo-600" />
          <h1 className="text-3xl font-bold text-gray-900">AI Features</h1>
        </div>
        <p className="text-gray-600">Advanced AI-powered manufacturing intelligence</p>
      </div>

      {/* Feature Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {features.map((feature) => {
          const Icon = feature.icon;
          const isActive = activeFeature === feature.id;

          return (
            <button
              key={feature.id}
              onClick={() => setActiveFeature(feature.id as any)}
              className={`p-6 rounded-lg border-2 transition-all text-left ${
                isActive
                  ? 'border-indigo-500 bg-indigo-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Icon className={`w-8 h-8 mb-3 ${isActive ? 'text-indigo-600' : 'text-gray-400'}`} />
              <h3 className="font-semibold text-gray-900 mb-1">{feature.name}</h3>
              <p className="text-xs text-gray-500">{feature.description}</p>
            </button>
          );
        })}
      </div>

      {/* Feature Content */}
      <div className="bg-white rounded-lg shadow-lg p-6">
        {activeFeature === 'pricing' && <PricingAI />}
        {activeFeature === 'scheduling' && <SchedulingAI />}
        {activeFeature === 'bottleneck' && <BottleneckAI />}
        {activeFeature === 'maintenance' && <MaintenanceAI />}
        {activeFeature === 'defects' && <DefectDetectionAI />}
      </div>
    </div>
  );
}

function PricingAI() {
  const [clients, setClients] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingClients, setLoadingClients] = useState(true);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [formData, setFormData] = useState({
    client_id: '',
    product_type: '',
    quantity: '',
    complexity: 'MEDIUM',
    material_cost: '',
    labor_hours_estimate: '',
    deadline_days: '',
    season: 'REGULAR'
  });

  // Fetch clients on mount
  useEffect(() => {
    fetchClients();
  }, []);

  async function fetchClients() {
    try {
      const response = await fetch('/api/clients?limit=100');
      const data = await response.json();
      if (data.success) {
        setClients(data.clients);
      }
    } catch (error) {
      console.error('Failed to fetch clients:', error);
    } finally {
      setLoadingClients(false);
    }
  }

  async function calculatePricing() {
    if (!formData.client_id || !formData.product_type || !formData.quantity || !formData.material_cost || !formData.labor_hours_estimate) {
      alert('Please fill in all required fields');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/ai/pricing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          quantity: parseInt(formData.quantity),
          material_cost: parseFloat(formData.material_cost),
          labor_hours_estimate: parseFloat(formData.labor_hours_estimate),
          deadline_days: formData.deadline_days ? parseInt(formData.deadline_days) : null,
        }),
      });

      const data = await response.json();
      if (data.success) {
        setRecommendation(data.recommendation);
      } else {
        alert('Failed to calculate pricing: ' + data.error);
      }
    } catch (error) {
      console.error('Pricing calculation failed:', error);
      alert('Failed to calculate pricing');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Dynamic Pricing AI</h2>

      {/* Pricing Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Calculate Price</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
              <select
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={formData.client_id}
                onChange={(e) => setFormData({...formData, client_id: e.target.value})}
                disabled={loadingClients}
              >
                <option value="">Select client...</option>
                {clients.map(client => (
                  <option key={client.id} value={client.id}>{client.name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Type *</label>
              <input
                type="text"
                placeholder="e.g., T-Shirt, Hoodie, Polo"
                className="w-full border border-gray-300 rounded-lg px-3 py-2"
                value={formData.product_type}
                onChange={(e) => setFormData({...formData, product_type: e.target.value})}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity *</label>
                <input
                  type="number"
                  placeholder="1000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material Cost *</label>
                <input
                  type="number"
                  placeholder="50000"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.material_cost}
                  onChange={(e) => setFormData({...formData, material_cost: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Labor Hours *</label>
                <input
                  type="number"
                  placeholder="120"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.labor_hours_estimate}
                  onChange={(e) => setFormData({...formData, labor_hours_estimate: e.target.value})}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Deadline (days)</label>
                <input
                  type="number"
                  placeholder="30"
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.deadline_days}
                  onChange={(e) => setFormData({...formData, deadline_days: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Complexity</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.complexity}
                  onChange={(e) => setFormData({...formData, complexity: e.target.value})}
                >
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Season</label>
                <select
                  className="w-full border border-gray-300 rounded-lg px-3 py-2"
                  value={formData.season}
                  onChange={(e) => setFormData({...formData, season: e.target.value})}
                >
                  <option value="REGULAR">Regular</option>
                  <option value="PEAK">Peak</option>
                  <option value="LOW">Low</option>
                </select>
              </div>
            </div>

            <button
              onClick={calculatePricing}
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading && <Loader2 className="w-4 h-4 animate-spin" />}
              {loading ? 'Calculating...' : 'Calculate Pricing'}
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
          <h3 className="font-semibold text-gray-900 mb-4">AI Recommendation</h3>

          {!recommendation ? (
            <div className="text-center py-12 text-gray-500">
              <Brain className="w-12 h-12 mx-auto mb-3 opacity-50" />
              <p>Fill in the form and click Calculate Pricing to get AI recommendations</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">Recommended Price:</span>
                <span className="text-2xl font-bold text-blue-600">₱{recommendation.recommended_price.toLocaleString()}</span>
              </div>

              <div className="h-px bg-gray-300"></div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Minimum Price:</span>
                  <span className="font-medium">₱{recommendation.minimum_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Optimal Price:</span>
                  <span className="font-medium text-green-600">₱{recommendation.optimal_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Maximum Price:</span>
                  <span className="font-medium">₱{recommendation.maximum_price.toLocaleString()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Profit Margin:</span>
                  <span className="font-medium text-green-600">{recommendation.profit_margin_percentage.toFixed(1)}%</span>
                </div>
              </div>

              <div className="h-px bg-gray-300"></div>

              <div>
                <p className="text-sm font-medium text-gray-700 mb-2">Pricing Factors:</p>
                <ul className="space-y-1 text-sm">
                  {recommendation.factors.map((factor: string, idx: number) => (
                    <li key={idx} className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-blue-500" />
                      <span className="text-gray-600">{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="bg-white rounded p-3">
                <p className="text-sm text-gray-600">
                  <strong>Confidence:</strong> {recommendation.confidence_score}% •
                  <strong> Strategy:</strong> {recommendation.strategy}
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// Placeholder components for other AI features (we'll implement these next)
function SchedulingAI() {
  return <div>Smart Scheduling AI - Coming soon with API integration</div>;
}

function BottleneckAI() {
  return <div>Bottleneck Detection AI - Coming soon with API integration</div>;
}

function MaintenanceAI() {
  return <div>Predictive Maintenance AI - Coming soon with API integration</div>;
}

function DefectDetectionAI() {
  return <div>Defect Detection AI - Coming soon with API integration</div>;
}
