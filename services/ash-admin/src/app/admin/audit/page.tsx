'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import PermissionGate from '@/components/PermissionGate'
import {
  Shield,
  Search,
  Filter,
  Calendar,
  User,
  Activity,
  AlertTriangle,
  Eye,
  Download,
  RefreshCw,
  Clock,
  MapPin,
  Monitor,
  ChevronLeft,
  ChevronRight
} from 'lucide-react'

interface AuditLog {
  id: string
  action: string
  description: string
  performer_user_id?: string
  performer?: {
    first_name: string
    last_name: string
    email: string
  }
  target_user_id?: string
  target_user_email?: string
  metadata?: any
  ip_address: string
  user_agent: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  timestamp: string
  workspace_id: string
}

export default function AuditLogsPage() {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [actionFilter, setActionFilter] = useState('all')
  const [severityFilter, setSeverityFilter] = useState('all')
  const [dateFrom, setDateFrom] = useState('')
  const [dateTo, setDateTo] = useState('')
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [summary, setSummary] = useState({
    total: 0,
    today: 0,
    this_week: 0,
    severity_counts: { low: 0, medium: 0, high: 0, critical: 0 },
    action_counts: { user_actions: 0, security_events: 0, admin_actions: 0 }
  })
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null)

  const actions = [
    'USER_CREATED', 'USER_UPDATED', 'USER_DELETED', 'USER_ROLE_CHANGED',
    'USER_LOGIN', 'USER_LOGOUT', 'USER_PASSWORD_CHANGED', 'USER_ACTIVATED', 'USER_DEACTIVATED',
    'PERMISSION_GRANTED', 'PERMISSION_REVOKED', 'DEPARTMENT_CHANGED',
    'ONBOARDING_CREATED', 'ONBOARDING_UPDATED', 'ONBOARDING_COMPLETED',
    'SYSTEM_SETTING_CHANGED', 'BULK_USER_UPDATE', 'SECURITY_ALERT'
  ]

  useEffect(() => {
    fetchAuditLogs()
  }, [search, actionFilter, severityFilter, dateFrom, dateTo, page])

  const fetchAuditLogs = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams({
        page: page.toString(),
        limit: '50',
        ...(search && { search }),
        ...(actionFilter !== 'all' && { action: actionFilter }),
        ...(severityFilter !== 'all' && { severity: severityFilter }),
        ...(dateFrom && { date_from: dateFrom }),
        ...(dateTo && { date_to: dateTo })
      })

      const token = localStorage.getItem('ash_token')
      const response = await fetch(`/api/admin/audit?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAuditLogs(data.data.audit_logs)
        setTotalPages(data.data.pagination.totalPages)
        setSummary(data.data.summary)
      } else {
        console.error('Failed to fetch audit logs')
      }
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-gray-100 text-gray-800'
      case 'medium': return 'bg-blue-100 text-blue-800'
      case 'high': return 'bg-orange-100 text-orange-800'
      case 'critical': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'low': return <div className="w-2 h-2 bg-gray-400 rounded-full" />
      case 'medium': return <div className="w-2 h-2 bg-blue-400 rounded-full" />
      case 'high': return <div className="w-2 h-2 bg-orange-400 rounded-full" />
      case 'critical': return <div className="w-2 h-2 bg-red-400 rounded-full" />
      default: return <div className="w-2 h-2 bg-gray-400 rounded-full" />
    }
  }

  const getActionIcon = (action: string) => {
    if (action.startsWith('USER_')) return <User className="w-4 h-4" />
    if (action === 'SECURITY_ALERT') return <AlertTriangle className="w-4 h-4" />
    if (['SYSTEM_SETTING_CHANGED', 'BULK_USER_UPDATE'].includes(action)) return <Shield className="w-4 h-4" />
    return <Activity className="w-4 h-4" />
  }

  const formatTimestamp = (timestamp: string) => {
    const date = new Date(timestamp)
    return {
      date: date.toLocaleDateString(),
      time: date.toLocaleTimeString(),
      relative: getRelativeTime(date)
    }
  }

  const getRelativeTime = (date: Date) => {
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays < 7) return `${diffDays}d ago`
    return date.toLocaleDateString()
  }

  const exportAuditLogs = () => {
    const csvContent = [
      ['Timestamp', 'Action', 'Description', 'Performer', 'Target User', 'Severity', 'IP Address'].join(','),
      ...auditLogs.map(log => [
        log.timestamp,
        log.action,
        `"${log.description}"`,
        log.performer ? `"${log.performer.first_name} ${log.performer.last_name}"` : 'System',
        log.target_user_email || '',
        log.severity,
        log.ip_address
      ].join(','))
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv' })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
    a.click()
    window.URL.revokeObjectURL(url)
  }

  return (
    <PermissionGate roles={['admin']} fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You need Administrator privileges to access Audit Logs.</p>
        </div>
      </div>
    }>
      <DashboardLayout>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
          {/* Header */}
          <header className="bg-white border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  <Shield className="w-8 h-8 mr-3 text-purple-600" />
                  Audit Logs
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">System security and user activity monitoring</p>
              </div>
              <div className="flex space-x-3">
                <button
                  onClick={fetchAuditLogs}
                  className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center"
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </button>
                <button
                  onClick={exportAuditLogs}
                  className="bg-purple-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-purple-700 transition-colors flex items-center"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Export
                </button>
              </div>
            </div>
          </header>

          {/* Summary Cards */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.total}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Events</p>
                  </div>
                  <Activity className="w-8 h-8 text-blue-600" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.today}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Today</p>
                  </div>
                  <Clock className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{summary.this_week}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">This Week</p>
                  </div>
                  <Calendar className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-red-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">
                      {summary.severity_counts.high + summary.severity_counts.critical}
                    </p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">High Priority</p>
                  </div>
                  <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
              <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                {/* Search */}
                <div className="md:col-span-2">
                  <div className="relative">
                    <Search className="w-4 h-4 absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      placeholder="Search audit logs..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10 pr-4 py-2 border border-gray-300 rounded-md text-sm w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                    />
                  </div>
                </div>

                {/* Action Filter */}
                <select
                  value={actionFilter}
                  onChange={(e) => setActionFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Actions</option>
                  {actions.map(action => (
                    <option key={action} value={action}>{action.replace(/_/g, ' ')}</option>
                  ))}
                </select>

                {/* Severity Filter */}
                <select
                  value={severityFilter}
                  onChange={(e) => setSeverityFilter(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500"
                >
                  <option value="all">All Severities</option>
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>

                {/* Date From */}
                <input
                  type="date"
                  value={dateFrom}
                  onChange={(e) => setDateFrom(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500"
                />

                {/* Date To */}
                <input
                  type="date"
                  value={dateTo}
                  onChange={(e) => setDateTo(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-purple-500"
                />
              </div>
            </div>

            {/* Audit Logs Table */}
            <div className="bg-white rounded-lg shadow">
              {loading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-purple-600 rounded-full animate-spin mx-auto mb-4" />
                  <p className="text-gray-600 dark:text-gray-400">Loading audit logs...</p>
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200 dark:border-gray-700">
                        <tr>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Timestamp</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Action</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Performer</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Target</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Severity</th>
                          <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="bg-white divide-y divide-gray-200">
                        {auditLogs.map((log) => {
                          const timestamp = formatTimestamp(log.timestamp)
                          return (
                            <tr key={log.id} className="hover:bg-gray-50 dark:bg-gray-800">
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">{timestamp.relative}</div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">{timestamp.date} {timestamp.time}</div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getActionIcon(log.action)}
                                  <span className="ml-2 text-sm font-medium text-gray-900 dark:text-white">
                                    {log.action.replace(/_/g, ' ')}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="text-sm text-gray-900 max-w-md">
                                  {log.description}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {log.performer
                                    ? `${log.performer.first_name} ${log.performer.last_name}`
                                    : 'System'
                                  }
                                </div>
                                <div className="text-xs text-gray-500 dark:text-gray-400">
                                  {log.performer?.email || 'Automated'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="text-sm text-gray-900 dark:text-white">
                                  {log.target_user_email || '-'}
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap">
                                <div className="flex items-center">
                                  {getSeverityIcon(log.severity)}
                                  <span className={`ml-2 inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getSeverityColor(log.severity)}`}>
                                    {log.severity.toUpperCase()}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                <button
                                  onClick={() => setSelectedLog(log)}
                                  className="text-purple-600 hover:text-purple-900"
                                  title="View details"
                                >
                                  <Eye className="w-4 h-4" />
                                </button>
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                      <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-700 dark:text-gray-300">
                          Page {page} of {totalPages}
                        </div>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setPage(page - 1)}
                            disabled={page === 1}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center"
                          >
                            <ChevronLeft className="w-4 h-4 mr-1" />
                            Previous
                          </button>
                          <button
                            onClick={() => setPage(page + 1)}
                            disabled={page === totalPages}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 flex items-center"
                          >
                            Next
                            <ChevronRight className="w-4 h-4 ml-1" />
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Audit Log Detail Modal */}
          {selectedLog && (
            <AuditLogDetailModal
              log={selectedLog}
              onClose={() => setSelectedLog(null)}
            />
          )}
        </div>
      </DashboardLayout>
    </PermissionGate>
  )
}

// Audit Log Detail Modal Component
function AuditLogDetailModal({ log, onClose }: { log: AuditLog; onClose: () => void }) {
  const timestamp = new Date(log.timestamp)

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Audit Log Details</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-400">
            ✕
          </button>
        </div>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Timestamp</label>
              <p className="text-sm text-gray-900 dark:text-white">{timestamp.toLocaleString()}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Action</label>
              <p className="text-sm text-gray-900 dark:text-white">{log.action.replace(/_/g, ' ')}</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <p className="text-sm text-gray-900 dark:text-white">{log.description}</p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Performer</label>
              <p className="text-sm text-gray-900 dark:text-white">
                {log.performer
                  ? `${log.performer.first_name} ${log.performer.last_name} (${log.performer.email})`
                  : 'System'
                }
              </p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Target User</label>
              <p className="text-sm text-gray-900 dark:text-white">{log.target_user_email || 'N/A'}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                IP Address
              </label>
              <p className="text-sm text-gray-900 font-mono">{log.ip_address}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Severity</label>
              <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                log.severity === 'low' ? 'bg-gray-100 text-gray-800' :
                log.severity === 'medium' ? 'bg-blue-100 text-blue-800' :
                log.severity === 'high' ? 'bg-orange-100 text-orange-800' :
                'bg-red-100 text-red-800'
              }`}>
                {log.severity.toUpperCase()}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
              <Monitor className="w-4 h-4 mr-1" />
              User Agent
            </label>
            <p className="text-xs text-gray-600 break-all bg-gray-50 p-2 rounded">{log.user_agent}</p>
          </div>

          {log.metadata && Object.keys(log.metadata).length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Metadata</label>
              <pre className="text-xs text-gray-600 bg-gray-50 p-3 rounded overflow-x-auto">
                {JSON.stringify(log.metadata, null, 2)}
              </pre>
            </div>
          )}
        </div>

        <div className="flex justify-end mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}