'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  FileText,
  Filter,
  Download,
  ChevronDown,
  ChevronUp,
  User,
  Shield,
  Lock,
  Settings,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Info,
  Clock
, ArrowLeft} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import toast from 'react-hot-toast'

interface AuditLog {
  id: string
  user_email: string
  user_name: string
  action: string
  category: string
  resource_type: string
  resource_id: string
  ip_address: string
  user_agent: string
  status: 'success' | 'failure' | 'warning'
  details: any
  created_at: string
}

export default function AuditLogsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [logs, setLogs] = useState<AuditLog[]>([])
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([])
  const [expandedLog, setExpandedLog] = useState<string | null>(null)
  const [filters, setFilters] = useState({
    search: '',
    category: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: ''
  })

  useEffect(() => {
    fetchAuditLogs()
  }, [])

  useEffect(() => {
    applyFilters()
  }, [logs, filters])

  const fetchAuditLogs = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/settings/audit-logs')
      if (response.ok) {
        const data = await response.json()
        setLogs(data.logs || [])
      }
    } catch (error) {
      console.error('Failed to fetch audit logs:', error)
      toast.error('Failed to load audit logs')
    } finally {
      setLoading(false)
    }
  }

  const applyFilters = () => {
    let filtered = [...logs]

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      filtered = filtered.filter(log =>
        log.action.toLowerCase().includes(searchLower) ||
        log.user_email.toLowerCase().includes(searchLower) ||
        log.user_name.toLowerCase().includes(searchLower) ||
        log.resource_type.toLowerCase().includes(searchLower)
      )
    }

    // Category filter
    if (filters.category !== 'all') {
      filtered = filtered.filter(log => log.category === filters.category)
    }

    // Status filter
    if (filters.status !== 'all') {
      filtered = filtered.filter(log => log.status === filters.status)
    }

    // Date range filter
    if (filters.dateFrom) {
      filtered = filtered.filter(log => new Date(log.created_at) >= new Date(filters.dateFrom))
    }
    if (filters.dateTo) {
      filtered = filtered.filter(log => new Date(log.created_at) <= new Date(filters.dateTo))
    }

    setFilteredLogs(filtered)
  }

  const exportLogs = async () => {
    try {
      const response = await fetch('/api/settings/audit-logs/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(filters),
      })

      if (!response.ok) {
        throw new Error('Failed to export logs')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `audit-logs-${new Date().toISOString().split('T')[0]}.csv`
      a.click()
      window.URL.revokeObjectURL(url)

      toast.success('Audit logs exported successfully!')
    } catch (error) {
      toast.error('Failed to export logs')
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'authentication':
        return <Lock className="w-5 h-5" />
      case 'security':
        return <Shield className="w-5 h-5" />
      case 'account':
        return <User className="w-5 h-5" />
      case 'settings':
        return <Settings className="w-5 h-5" />
      default:
        return <FileText className="w-5 h-5" />
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="w-5 h-5 text-green-600 dark:text-green-400" />
      case 'failure':
        return <XCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
      case 'warning':
        return <AlertTriangle className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
      default:
        return <Info className="w-5 h-5 text-blue-600 dark:text-blue-400" />
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="text-center py-12">
          <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="text-gray-500 dark:text-gray-400 mt-4">Loading audit logs...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Audit Logs</h2>
          <p className="text-gray-500 dark:text-gray-400 mt-1">
            View security events and account changes
          </p>
        </div>
        <Button onClick={exportLogs}>
          <Download className="w-4 h-4 mr-2" />
          Export CSV
        </Button>
      </div>

      {/* Filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 p-4 space-y-4">
        <div className="flex items-center gap-2 font-semibold text-gray-900 dark:text-white">
          <Filter className="w-5 h-5" />
          <span>Filters</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <Label htmlFor="search">Search</Label>
            <Input
              id="search"
              type="text"
              placeholder="Search logs..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <select
              id="category"
              value={filters.category}
              onChange={(e) => setFilters({ ...filters, category: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Categories</option>
              <option value="authentication">Authentication</option>
              <option value="security">Security</option>
              <option value="account">Account</option>
              <option value="settings">Settings</option>
              <option value="data">Data</option>
            </select>
          </div>

          <div>
            <Label htmlFor="status">Status</Label>
            <select
              id="status"
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
            >
              <option value="all">All Statuses</option>
              <option value="success">Success</option>
              <option value="failure">Failure</option>
              <option value="warning">Warning</option>
            </select>
          </div>

          <div>
            <Label htmlFor="dateFrom">From Date</Label>
            <Input
              id="dateFrom"
              type="date"
              value={filters.dateFrom}
              onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
              className="dark:bg-gray-700 dark:text-white"
            />
          </div>

          <div>
            <Label htmlFor="dateTo">To Date</Label>
            <Input
              id="dateTo"
              type="date"
              value={filters.dateTo}
              onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
              className="dark:bg-gray-700 dark:text-white"
            />
          </div>
        </div>

        <div className="flex items-center justify-between pt-2 border-t dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Showing {filteredLogs.length} of {logs.length} logs
          </p>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFilters({
              search: '',
              category: 'all',
              status: 'all',
              dateFrom: '',
              dateTo: ''
            })}
          >
            Clear Filters
          </Button>
        </div>
      </div>

      {/* Logs List */}
      <div className="space-y-2">
        {filteredLogs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-500 dark:text-gray-400">No audit logs found</p>
          </div>
        ) : (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="bg-white dark:bg-gray-800 rounded-lg border dark:border-gray-700 overflow-hidden"
            >
              <button
                onClick={() => setExpandedLog(expandedLog === log.id ? null : log.id)}
                className="w-full p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
              >
                <div className="flex items-start gap-4">
                  <div className="shrink-0 mt-1">
                    {getStatusIcon(log.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-gray-900 dark:text-white">
                            {log.action}
                          </span>
                          <span className="px-2 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 text-xs rounded">
                            {log.category}
                          </span>
                        </div>
                        <div className="flex items-center gap-4 mt-2 text-sm text-gray-600 dark:text-gray-400">
                          <div className="flex items-center gap-1">
                            <User className="w-4 h-4" />
                            {log.user_name} ({log.user_email})
                          </div>
                          <div className="flex items-center gap-1">
                            <Clock className="w-4 h-4" />
                            {formatDate(log.created_at)}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0">
                        {expandedLog === log.id ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </button>

              {expandedLog === log.id && (
                <div className="px-4 pb-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Resource
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white">
                        {log.resource_type} {log.resource_id && `(${log.resource_id})`}
                      </div>
                    </div>

                    <div>
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        IP Address
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white font-mono">
                        {log.ip_address}
                      </div>
                    </div>

                    <div className="md:col-span-2">
                      <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        User Agent
                      </div>
                      <div className="text-sm text-gray-900 dark:text-white break-all">
                        {log.user_agent}
                      </div>
                    </div>

                    {log.details && Object.keys(log.details).length > 0 && (
                      <div className="md:col-span-2">
                        <div className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Additional Details
                        </div>
                        <pre className="text-xs bg-white dark:bg-gray-800 p-3 rounded border dark:border-gray-700 overflow-x-auto">
                          {JSON.stringify(log.details, null, 2)}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  )
}
