'use client';

import { useState } from 'react';
import {
  Brain,
  DollarSign,
  AlertTriangle,
  Calendar,
  Zap,
  TrendingUp,
  Target,
  Activity
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
                  ? `border-${feature.color}-500 bg-${feature.color}-50`
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              <Icon className={`w-8 h-8 mb-3 ${isActive ? `text-${feature.color}-600` : 'text-gray-400'}`} />
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
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Dynamic Pricing AI</h2>

      {/* Pricing Calculator */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Calculate Price</h3>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
              <select className="w-full border border-gray-300 rounded-lg px-3 py-2">
                <option>ABC Corporation</option>
                <option>XYZ Industries</option>
                <option>Global Fashion</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Product Type</label>
              <input type="text" placeholder="e.g., T-Shirt" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quantity</label>
                <input type="number" placeholder="1000" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Material Cost</label>
                <input type="number" placeholder="₱50,000" className="w-full border border-gray-300 rounded-lg px-3 py-2" />
              </div>
            </div>

            <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
              Calculate Pricing
            </button>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 bg-blue-50">
          <h3 className="font-semibold text-gray-900 mb-4">AI Recommendation</h3>

          <div className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-gray-600">Recommended Price:</span>
              <span className="text-2xl font-bold text-blue-600">₱125,500</span>
            </div>

            <div className="h-px bg-gray-300"></div>

            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600">Minimum Price:</span>
                <span className="font-medium">₱115,000</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Optimal Price:</span>
                <span className="font-medium text-green-600">₱125,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Maximum Price:</span>
                <span className="font-medium">₱140,000</span>
              </div>
            </div>

            <div className="h-px bg-gray-300"></div>

            <div>
              <p className="text-sm font-medium text-gray-700 mb-2">Pricing Factors:</p>
              <ul className="space-y-1 text-sm">
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">High demand season (+10%)</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-green-500" />
                  <span className="text-gray-600">VIP client discount (-5%)</span>
                </li>
                <li className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-orange-500" />
                  <span className="text-gray-600">Rush order premium (+15%)</span>
                </li>
              </ul>
            </div>

            <div className="bg-white rounded p-3">
              <p className="text-sm text-gray-600">
                <strong>Confidence:</strong> 92% • <strong>Margin:</strong> 28.5%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function SchedulingAI() {
  const jobs = [
    { id: 'ORD-001', client: 'ABC Corp', priority: 'URGENT', deadline: '2 days', status: 'scheduled' },
    { id: 'ORD-002', client: 'XYZ Industries', priority: 'HIGH', deadline: '5 days', status: 'scheduled' },
    { id: 'ORD-003', client: 'Global Fashion', priority: 'NORMAL', deadline: '10 days', status: 'pending' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Smart Scheduling AI</h2>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-blue-50 rounded-lg p-4">
          <p className="text-sm text-blue-600 font-medium mb-1">Optimization Score</p>
          <p className="text-3xl font-bold text-blue-900">87%</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4">
          <p className="text-sm text-green-600 font-medium mb-1">On-Time Rate</p>
          <p className="text-3xl font-bold text-green-900">94%</p>
        </div>
        <div className="bg-purple-50 rounded-lg p-4">
          <p className="text-sm text-purple-600 font-medium mb-1">Resource Utilization</p>
          <p className="text-3xl font-bold text-purple-900">78%</p>
        </div>
      </div>

      <div className="border border-gray-200 rounded-lg overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Priority</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deadline</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {jobs.map((job) => (
              <tr key={job.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{job.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{job.client}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    job.priority === 'URGENT' ? 'bg-red-100 text-red-800' :
                    job.priority === 'HIGH' ? 'bg-orange-100 text-orange-800' :
                    'bg-blue-100 text-blue-800'
                  }`}>
                    {job.priority}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{job.deadline}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    job.status === 'scheduled' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                  }`}>
                    {job.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-6">
        <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition-colors">
          <Zap className="w-4 h-4 inline mr-2" />
          Re-optimize Schedule
        </button>
      </div>
    </div>
  );
}

function BottleneckAI() {
  const bottlenecks = [
    { station: 'Sewing Department', severity: 'CRITICAL', throughput_loss: 35, impact: '₱45,000/day' },
    { station: 'QC Station', severity: 'MEDIUM', throughput_loss: 15, impact: '₱12,000/day' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Bottleneck Detection AI</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div className="border-2 border-red-200 bg-red-50 rounded-lg p-6">
          <div className="flex items-center gap-3 mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600" />
            <div>
              <h3 className="font-semibold text-red-900">Critical Bottleneck Detected</h3>
              <p className="text-sm text-red-600">Sewing Department</p>
            </div>
          </div>

          <div className="space-y-2 text-sm">
            <p><strong>Throughput Loss:</strong> 35%</p>
            <p><strong>Impact:</strong> ₱45,000/day</p>
            <p><strong>Root Cause:</strong> Operator shortage (3/15 active)</p>
          </div>

          <div className="mt-4 pt-4 border-t border-red-200">
            <p className="text-sm font-medium text-red-900 mb-2">AI Recommendations:</p>
            <ul className="text-sm text-red-700 space-y-1">
              <li>• Assign 5 additional operators immediately</li>
              <li>• Redistribute workload from Finishing</li>
              <li>• Expected resolution: 4-6 hours</li>
            </ul>
          </div>
        </div>

        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">System Efficiency</h3>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">Overall Efficiency</span>
                <span className="font-medium">73%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-yellow-500 h-2 rounded-full" style={{ width: '73%' }}></div>
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-gray-600">System Throughput</span>
                <span className="font-medium">28 units/hr</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{ width: '65%' }}></div>
              </div>
            </div>

            <div className="pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                <strong>Optimal Throughput:</strong> 42 units/hr<br />
                <strong>Efficiency Loss:</strong> 27%
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function MaintenanceAI() {
  const predictions = [
    { asset: 'Sewing Machine #5', failure_prob: 85, days_until: 3, risk: 'CRITICAL' },
    { asset: 'Cutting Table #2', failure_prob: 45, days_until: 12, risk: 'MEDIUM' },
    { asset: 'Print Machine #1', failure_prob: 20, days_until: 30, risk: 'LOW' },
  ];

  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">Predictive Maintenance AI</h2>

      <div className="border border-gray-200 rounded-lg overflow-hidden mb-6">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Asset</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Failure Probability</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Predicted Failure</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Risk Level</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Action</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {predictions.map((pred, idx) => (
              <tr key={idx} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{pred.asset}</td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${
                          pred.failure_prob >= 75 ? 'bg-red-500' :
                          pred.failure_prob >= 40 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${pred.failure_prob}%` }}
                      ></div>
                    </div>
                    <span className="text-sm text-gray-600">{pred.failure_prob}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                  {pred.days_until} days
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    pred.risk === 'CRITICAL' ? 'bg-red-100 text-red-800' :
                    pred.risk === 'MEDIUM' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {pred.risk}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <button className="text-blue-600 hover:text-blue-800 text-sm font-medium">
                    Schedule Maintenance →
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="bg-blue-50 rounded-lg p-6">
        <h3 className="font-semibold text-blue-900 mb-3">AI Recommendations</h3>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Schedule immediate maintenance for Sewing Machine #5 (85% failure risk)</li>
          <li>• Inspect cooling system on Cutting Table #2 to prevent escalation</li>
          <li>• Continue monitoring Print Machine #1 - no immediate action required</li>
        </ul>
      </div>
    </div>
  );
}

function DefectDetectionAI() {
  return (
    <div>
      <h2 className="text-2xl font-bold text-gray-900 mb-4">AI Defect Detection</h2>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="border border-gray-200 rounded-lg p-6">
          <h3 className="font-semibold text-gray-900 mb-4">Upload Image for Analysis</h3>

          <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer">
            <Target className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600 mb-2">Drop image here or click to upload</p>
            <p className="text-xs text-gray-500">Supports: JPG, PNG (max 10MB)</p>
          </div>

          <button className="w-full mt-4 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition-colors">
            Analyze with AI
          </button>
        </div>

        <div className="border border-gray-200 rounded-lg p-6 bg-gray-50">
          <h3 className="font-semibold text-gray-900 mb-4">Detection Results</h3>

          <div className="space-y-4">
            <div className="bg-white rounded-lg p-4">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-900">Defects Found:</span>
                <span className="text-2xl font-bold text-red-600">2</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Quality Score:</span>
                <span className="text-lg font-semibold text-yellow-600">85%</span>
              </div>
            </div>

            <div className="bg-white rounded-lg p-4">
              <p className="text-sm font-medium text-gray-700 mb-3">Detected Issues:</p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-red-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Loose Thread (MINOR)</p>
                    <p className="text-xs text-gray-600">Location: Seam at coordinates (450, 320)</p>
                    <p className="text-xs text-gray-500 mt-1">Recommendation: Trim loose threads</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-2 h-2 bg-orange-500 rounded-full mt-1.5"></div>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-gray-900">Uneven Seam (MAJOR)</p>
                    <p className="text-xs text-gray-600">Location: Right side at (680, 450)</p>
                    <p className="text-xs text-gray-500 mt-1">Recommendation: Re-sew for uniformity</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 rounded p-3 border border-yellow-200">
              <p className="text-sm text-yellow-800">
                <strong>Verdict:</strong> PASS with minor corrections needed
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
