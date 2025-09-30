'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import DashboardLayout from '@/components/dashboard-layout'
import {
  Users,
  ClipboardCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  TrendingUp,
  BarChart3,
  Search,
  Filter,
  Plus,
  Eye,
  FileText,
  RefreshCw
} from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { Alert, AlertTitle, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

interface QCInspection {
  id: string
  order: { order_number: string }
  bundle?: { qr_code: string, size_code: string, qty: number }
  checklist: { name: string, type: string }
  inspector: { first_name: string, last_name: string }
  stage: string
  lot_size: number
  sample_size: number
  critical_found: number
  major_found: number
  minor_found: number
  status: 'OPEN' | 'PASSED' | 'FAILED' | 'CLOSED'
  result?: 'PASSED' | 'FAILED'
  inspection_date: string
  started_at?: string
  completed_at?: string
  _count: { samples: number, defects: number, capa_tasks: number }
}

interface QCStats {
  total_inspections: number
  passed: number
  failed: number
  pending: number
  defect_rate: number
  avg_sample_size: number
}

export default function QualityControlPage() {
  const [selectedPeriod, setSelectedPeriod] = useState('today')
  const [filterType, setFilterType] = useState('all')
  const [filterResult, setFilterResult] = useState('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Calculate date range based on period
  const getDateRange = () => {
    const now = new Date()
    const fromDate = new Date()

    switch (selectedPeriod) {
      case 'today':
        fromDate.setHours(0, 0, 0, 0)
        break
      case 'week':
        fromDate.setDate(now.getDate() - 7)
        break
      case 'month':
        fromDate.setMonth(now.getMonth() - 1)
        break
      default:
        fromDate.setDate(now.getDate() - 7)
    }

    return { fromDate, toDate: now }
  }

  // Fetch QC inspections with filters
  const {
    data: inspections = [],
    isLoading: inspectionsLoading,
    error: inspectionsError,
    refetch: refetchInspections,
    isFetching: inspectionsFetching
  } = useQuery({
    queryKey: ['qc-inspections', selectedPeriod, filterType, filterResult],
    queryFn: async () => {
      const { fromDate, toDate } = getDateRange()
      const params = new URLSearchParams({
        from_date: fromDate.toISOString(),
        to_date: toDate.toISOString(),
        page: '1',
        limit: '50'
      })

      if (filterType !== 'all') params.append('inspection_type', filterType)
      if (filterResult !== 'all') params.append('result', filterResult)

      const response = await fetch(`/api/quality-control/inspections?${params}`)
      if (!response.ok) throw new Error('Failed to fetch QC inspections')
      const data = await response.json()
      return Array.isArray(data.inspections) ? data.inspections as QCInspection[] : []
    },
    staleTime: 30000,
    refetchInterval: 60000,
  })

  // Calculate stats from inspections data
  const stats: QCStats = {
    total_inspections: inspections.length,
    passed: inspections.filter(i => i.status === 'PASSED').length,
    failed: inspections.filter(i => i.status === 'FAILED').length,
    pending: inspections.filter(i => i.status === 'OPEN').length,
    defect_rate: inspections.length > 0
      ? (inspections.reduce((sum, i) => sum + i.critical_found + i.major_found + i.minor_found, 0) /
         inspections.reduce((sum, i) => sum + i.sample_size, 0)) * 100
      : 0,
    avg_sample_size: inspections.length > 0
      ? inspections.reduce((sum, i) => sum + i.sample_size, 0) / inspections.length
      : 0
  }

  const handleRefresh = () => {
    refetchInspections()
  }

  const isLoading = inspectionsLoading
  const isFetching = inspectionsFetching

  const filteredInspections = inspections.filter(inspection =>
    searchTerm === '' || 
    inspection.order.order_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.inspector.first_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    inspection.inspector.last_name.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getStatusBadge = (status: string, result?: string) => {
    switch (status) {
      case 'PASSED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <CheckCircle className="w-3 h-3 mr-1" />
          Passed
        </span>
      case 'FAILED':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <XCircle className="w-3 h-3 mr-1" />
          Failed
        </span>
      case 'CLOSED':
        return result ? getStatusBadge(result) : <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Closed
        </span>
      case 'OPEN':
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <Clock className="w-3 h-3 mr-1" />
          Open
        </span>
      default:
        return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          Unknown
        </span>
    }
  }

  const getStageBadge = (stage: string) => {
    const colors = {
      'PRINTING': 'bg-blue-100 text-blue-800',
      'SEWING': 'bg-purple-100 text-purple-800',
      'FINAL': 'bg-orange-100 text-orange-800'
    }
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[stage as keyof typeof colors] || 'bg-gray-100 text-gray-800'}`}>
        {stage}
      </span>
    )
  }

  // Error Alert Component
  const ErrorAlert = ({ error, onRetry }: { error: Error; onRetry: () => void }) => (
    <Alert className="mb-6 border-red-200 bg-red-50">
      <AlertCircle className="h-4 w-4 text-red-600" />
      <AlertTitle className="text-red-800">Error</AlertTitle>
      <AlertDescription className="text-red-700">
        {error.message}
        <Button variant="outline" size="sm" onClick={onRetry} className="ml-4">
          <RefreshCw className="w-4 h-4 mr-2" />
          Retry
        </Button>
      </AlertDescription>
    </Alert>
  )

  // Skeleton Loaders
  const StatCardSkeleton = () => (
    <div className="bg-white overflow-hidden shadow rounded-lg">
      <div className="p-5">
        <div className="flex items-center">
          <Skeleton className="h-6 w-6 rounded" />
          <div className="ml-5 w-0 flex-1">
            <Skeleton className="h-4 w-24 mb-2" />
            <Skeleton className="h-6 w-16" />
          </div>
        </div>
      </div>
    </div>
  )

  const InspectionRowSkeleton = () => (
    <tr>
      <td className="px-6 py-4"><Skeleton className="h-10 w-32" /></td>
      <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
      <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
      <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
      <td className="px-6 py-4"><Skeleton className="h-6 w-24" /></td>
      <td className="px-6 py-4"><Skeleton className="h-6 w-16" /></td>
      <td className="px-6 py-4"><Skeleton className="h-6 w-20" /></td>
      <td className="px-6 py-4"><Skeleton className="h-6 w-12" /></td>
    </tr>
  )

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              Quality Control
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Manage inspections, defects, and quality metrics
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <Button
              variant="outline"
              onClick={handleRefresh}
              disabled={isFetching}
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isFetching ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <button
              onClick={() => window.location.href = '/quality-control/analytics'}
              className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              <BarChart3 className="w-4 h-4 mr-2" />
              Analytics
            </button>
            <button
              onClick={() => window.location.href = '/quality-control/new'}
              className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="w-4 h-4 mr-2" />
              New Inspection
            </button>
          </div>
        </div>

        {/* Error Alert */}
        {inspectionsError && <ErrorAlert error={inspectionsError as Error} onRetry={refetchInspections} />}

        {/* Stats Cards */}
        {inspectionsLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[...Array(4)].map((_, i) => <StatCardSkeleton key={i} />)}
          </div>
        ) : stats ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <ClipboardCheck className="h-6 w-6 text-gray-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total Inspections</dt>
                      <dd className="text-lg font-medium text-gray-900">{stats.total_inspections}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <CheckCircle className="h-6 w-6 text-green-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Pass Rate</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.total_inspections > 0 ? Math.round((stats.passed / stats.total_inspections) * 100) : 0}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <AlertTriangle className="h-6 w-6 text-red-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Defect Rate</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {stats.defect_rate.toFixed(2)}%
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <TrendingUp className="h-6 w-6 text-blue-400" />
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg Sample Size</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {Math.round(stats.avg_sample_size)}
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ) : null}

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search inspections..."
                    className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
                </div>
                
                <select 
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  value={selectedPeriod}
                  onChange={(e) => setSelectedPeriod(e.target.value)}
                >
                  <option value="today">Today</option>
                  <option value="week">Past Week</option>
                  <option value="month">Past Month</option>
                </select>

                <select
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterType}
                  onChange={(e) => setFilterType(e.target.value)}
                >
                  <option value="all">All Stages</option>
                  <option value="PRINTING">Printing QC</option>
                  <option value="SEWING">Sewing QC</option>
                  <option value="FINAL">Final QC</option>
                </select>

                <select
                  className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                  value={filterResult}
                  onChange={(e) => setFilterResult(e.target.value)}
                >
                  <option value="all">All Status</option>
                  <option value="PASSED">Passed</option>
                  <option value="FAILED">Failed</option>
                  <option value="OPEN">Open</option>
                  <option value="CLOSED">Closed</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Inspections Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">Quality Inspections</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Order / Bundle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Inspector
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Sample Size
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Defects
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Result
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {inspectionsLoading ? (
                  [...Array(5)].map((_, i) => <InspectionRowSkeleton key={i} />)
                ) : filteredInspections.map((inspection) => (
                  <tr key={inspection.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {inspection.order.order_number}
                        </div>
                        {inspection.bundle && (
                          <div className="text-sm text-gray-500">
                            Bundle: {inspection.bundle.qr_code} ({inspection.bundle.size_code})
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {inspection.inspector.first_name} {inspection.inspector.last_name}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStageBadge(inspection.stage)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {inspection.sample_size} / {inspection.lot_size}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="text-red-600 font-medium">{inspection.critical_found}C</span>
                        {' / '}
                        <span className="text-orange-600 font-medium">{inspection.major_found}M</span>
                        {' / '}
                        <span className="text-yellow-600 font-medium">{inspection.minor_found}m</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(inspection.status, inspection.result)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {new Date(inspection.inspection_date).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <Eye className="w-4 h-4" />
                        </button>
                        {inspection._count.capa_tasks > 0 && (
                          <button className="text-orange-600 hover:text-orange-900">
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {!inspectionsLoading && filteredInspections.length === 0 && (
            <div className="text-center py-12">
              <ClipboardCheck className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No inspections found</h3>
              <p className="mt-1 text-sm text-gray-500">
                {searchTerm || filterType !== 'all' || filterResult !== 'all'
                  ? 'Try adjusting your filters or search criteria.'
                  : 'Get started by creating your first quality inspection.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  )
}