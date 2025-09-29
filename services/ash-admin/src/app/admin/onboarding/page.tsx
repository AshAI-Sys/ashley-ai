'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import DashboardLayout from '@/components/dashboard-layout'
import PermissionGate from '@/components/PermissionGate'
import {
  UserPlus,
  Clock,
  CheckCircle,
  AlertCircle,
  Users,
  Calendar,
  FileText,
  Settings,
  Play,
  Pause,
  RotateCcw,
  Eye,
  Plus,
  Filter,
  Search
} from 'lucide-react'

interface OnboardingProcess {
  id: string
  employee_id: string
  employee: {
    first_name: string
    last_name: string
    email: string
    position: string
  }
  status: 'pending' | 'in_progress' | 'completed' | 'on_hold'
  current_step: string
  progress_percentage: number
  template_type: string
  priority: 'low' | 'normal' | 'high' | 'urgent'
  created_at: string
  expected_completion_date: string
  completion_date?: string
  steps_completed: string[]
  next_action?: string
  assigned_hr: string
}

export default function OnboardingManagementPage() {
  const [onboardingProcesses, setOnboardingProcesses] = useState<OnboardingProcess[]>([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [summary, setSummary] = useState({
    total: 0,
    pending: 0,
    in_progress: 0,
    completed: 0,
    overdue: 0
  })
  const [showCreateModal, setShowCreateModal] = useState(false)
  const router = useRouter()

  useEffect(() => {
    fetchOnboardingProcesses()
  }, [statusFilter, priorityFilter, search, page])

  const fetchOnboardingProcesses = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '10',
        ...(statusFilter !== 'all' && { status: statusFilter }),
        ...(priorityFilter !== 'all' && { priority: priorityFilter }),
        ...(search && { search })
      })

      const token = localStorage.getItem('ash_token')
      const response = await fetch(`/api/admin/onboarding?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setOnboardingProcesses(data.data.onboarding_processes)
        setTotalPages(data.data.pagination.totalPages)
        setSummary(data.data.summary)
      } else {
        console.error('Failed to fetch onboarding processes')
      }
    } catch (error) {
      console.error('Error fetching onboarding processes:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOnboarding = async (onboardingData: any) => {
    try {
      const token = localStorage.getItem('ash_token')
      const response = await fetch('/api/admin/onboarding', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(onboardingData)
      })

      if (response.ok) {
        setShowCreateModal(false)
        fetchOnboardingProcesses()
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error creating onboarding process:', error)
      alert('Failed to create onboarding process')
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'in_progress': return 'bg-blue-100 text-blue-800'
      case 'completed': return 'bg-green-100 text-green-800'
      case 'on_hold': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent': return 'bg-red-100 text-red-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'normal': return 'bg-blue-100 text-blue-800'
      case 'low': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4" />
      case 'in_progress': return <Play className="w-4 h-4" />
      case 'completed': return <CheckCircle className="w-4 h-4" />
      case 'on_hold': return <Pause className="w-4 h-4" />
      default: return <Clock className="w-4 h-4" />
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  const isOverdue = (process: OnboardingProcess) => {
    return process.status !== 'completed' && new Date(process.expected_completion_date) < new Date()
  }

  return (
    <PermissionGate permissions={['admin:read', 'hr:read']} fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <UserPlus className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600">You need HR or Admin privileges to access Employee Onboarding.</p>
        </div>
      </div>
    }>
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <UserPlus className="w-8 h-8 mr-3 text-green-600" />
                  Employee Onboarding
                </h1>
                <p className="text-sm text-gray-600">Manage new employee onboarding processes</p>
              </div>
              <PermissionGate permissions={['admin:create', 'hr:create']}>
                <button
                  onClick={() => setShowCreateModal(true)}
                  className="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 transition-colors flex items-center"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  New Onboarding
                </button>
              </PermissionGate>
            </div>
          </header>

          {/* Summary Cards */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center">
                  <Users className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{summary.total}</p>
                    <p className="text-sm text-gray-600">Total Processes</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-yellow-500">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-yellow-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{summary.pending}</p>
                    <p className="text-sm text-gray-600">Pending</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center">
                  <Play className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{summary.in_progress}</p>
                    <p className="text-sm text-gray-600">In Progress</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center">
                  <CheckCircle className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{summary.completed}</p>
                    <p className="text-sm text-gray-600">Completed</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
                <div className="flex items-center">
                  <AlertCircle className="w-8 h-8 text-red-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900">{summary.overdue}</p>
                    <p className="text-sm text-gray-600">Overdue</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
              <div className="flex flex-wrap gap-4">
                {/* Search */}
                <div className="flex-1 min-w-64">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search employees..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-full focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                  </div>
                </div>

                {/* Status Filter */}
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Status</option>
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>

                {/* Priority Filter */}
                <select
                  value={priorityFilter}
                  onChange={(e) => setPriorityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500"
                >
                  <option value="all">All Priorities</option>
                  <option value="urgent">Urgent</option>
                  <option value="high">High</option>
                  <option value="normal">Normal</option>
                  <option value="low">Low</option>
                </select>
              </div>
            </div>

            {/* Onboarding Processes Table */}
            <div className="bg-white rounded-lg shadow">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-green-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600">Loading onboarding processes...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Employee</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Priority</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Due Date</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Next Action</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {onboardingProcesses.map((process) => (
                          <tr key={process.id} className="hover:bg-gray-50">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-sm font-medium text-gray-900">
                                  {process.employee.first_name} {process.employee.last_name}
                                </div>
                                <div className="text-sm text-gray-500">{process.employee.email}</div>
                                <div className="text-xs text-gray-400">{process.employee.position}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                {getStatusIcon(process.status)}
                                <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(process.status)}`}>
                                  {process.status.replace('_', ' ').toUpperCase()}
                                </span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                                  <div
                                    className="bg-green-600 h-2 rounded-full"
                                    style={{ width: `${process.progress_percentage}%` }}
                                  ></div>
                                </div>
                                <span className="text-sm text-gray-600">{process.progress_percentage}%</span>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPriorityColor(process.priority)}`}>
                                {process.priority.toUpperCase()}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className={`text-sm ${isOverdue(process) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                                {formatDate(process.expected_completion_date)}
                                {isOverdue(process) && (
                                  <div className="text-xs text-red-500">Overdue</div>
                                )}
                              </div>
                            </td>
                            <td className="px-6 py-4">
                              <div className="text-sm text-gray-900 max-w-48">
                                {process.next_action || 'No action required'}
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => router.push(`/admin/onboarding/${process.id}`)}
                                  className="text-green-600 hover:text-green-900"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                                <PermissionGate permissions={['admin:update', 'hr:update']}>
                                  <button
                                    className="text-blue-600 hover:text-blue-900"
                                    title="Edit process"
                                  >
                                    <Settings className="w-4 h-4" />
                                  </button>
                                </PermissionGate>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                          Page {page} of {totalPages}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            Previous
                          </button>
                          <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
                          >
                            Next
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Create Onboarding Modal */}
          {showCreateModal && (
            <CreateOnboardingModal
              onClose={() => setShowCreateModal(false)}
              onSubmit={handleCreateOnboarding}
            />
          )}
        </div>
      </DashboardLayout>
    </PermissionGate>
  )
}

// Create Onboarding Modal Component
function CreateOnboardingModal({ onClose, onSubmit }: any) {
  const [formData, setFormData] = useState({
    employee_id: '',
    template_type: 'basic',
    priority: 'normal',
    expected_completion_date: ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSubmit(formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-md">
        <h3 className="text-lg font-semibold mb-4">Create New Onboarding Process</h3>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Employee ID</label>
            <input
              type="text"
              required
              value={formData.employee_id}
              onChange={(e) => setFormData({...formData, employee_id: e.target.value})}
              placeholder="e.g., EMP-001"
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Template Type</label>
            <select
              value={formData.template_type}
              onChange={(e) => setFormData({...formData, template_type: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="basic">Basic (3 days)</option>
              <option value="production">Production (7 days)</option>
              <option value="office">Office (5 days)</option>
              <option value="management">Management (10 days)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
            <select
              value={formData.priority}
              onChange={(e) => setFormData({...formData, priority: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500"
            >
              <option value="low">Low</option>
              <option value="normal">Normal</option>
              <option value="high">High</option>
              <option value="urgent">Urgent</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Expected Completion Date (Optional)</label>
            <input
              type="date"
              value={formData.expected_completion_date}
              onChange={(e) => setFormData({...formData, expected_completion_date: e.target.value})}
              className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-green-500"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Create Process
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}