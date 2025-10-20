'use client'

import { useState, useEffect } from 'react'
import DashboardLayout from '@/components/dashboard-layout'
import PermissionGate from '@/components/PermissionGate'
import {
  BarChart3,
  Download,
  Calendar,
  Filter,
  FileText,
  TrendingUp,
  Users,
  Shield,
  Clock,
  AlertTriangle,
  CheckCircle,
  Eye,
  RefreshCw,
  Settings,
  PieChart,
  Activity
} from 'lucide-react'

interface Report {
  id: string
  name: string
  description: string
  category: string
  departments: string[]
  last_generated: string
  frequency: string
}

interface RecentReport {
  id: string
  type: string
  name: string
  generated_by: string
  generated_at: string
  status: string
  file_size: string
  format: string
}

export default function ReportsPage() {
  const [availableReports, setAvailableReports] = useState<Report[]>([])
  const [recentReports, setRecentReports] = useState<RecentReport[]>([])
  const [loading, setLoading] = useState(true)
  const [generatingReport, setGeneratingReport] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [selectedDepartment, setSelectedDepartment] = useState('all')
  const [showReportModal, setShowReportModal] = useState(false)
  const [selectedReportType, setSelectedReportType] = useState('')
  const [reportData, setReportData] = useState<any>(null)

  const categories = ['Security', 'Operations', 'HR', 'Management', 'Compliance']
  const departments = ['Administration', 'Production', 'Quality', 'Design', 'Finance', 'HR', 'Maintenance']

  useEffect(() => {
    fetchReports()
  }, [])

  const fetchReports = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('ash_token')
      const response = await fetch('/api/admin/reports', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      })

      if (response.ok) {
        const data = await response.json()
        setAvailableReports(data.data.available_reports)
        setRecentReports(data.data.recent_reports)
      } else {
        console.error('Failed to fetch reports')
      }
    } catch (error) {
      console.error('Error fetching reports:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateReport = async (reportType: string, filters: any = {}) => {
    try {
      setGeneratingReport(reportType)
      const token = localStorage.getItem('ash_token')
      const response = await fetch('/api/admin/reports', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          report_type: reportType,
          ...filters
        })
      })

      if (response.ok) {
        const data = await response.json()
        setReportData(data.data)
        setSelectedReportType(reportType)
        setShowReportModal(true)
        fetchReports() // Refresh recent reports
      } else {
        const error = await response.json()
        alert(`Error: ${error.error}`)
      }
    } catch (error) {
      console.error('Error generating report:', error)
      alert('Failed to generate report')
    } finally {
      setGeneratingReport(null)
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Security': return <Shield className="w-5 h-5" />
      case 'Operations': return <Activity className="w-5 h-5" />
      case 'HR': return <Users className="w-5 h-5" />
      case 'Management': return <TrendingUp className="w-5 h-5" />
      case 'Compliance': return <CheckCircle className="w-5 h-5" />
      default: return <FileText className="w-5 h-5" />
    }
  }

  const getCategoryColor = (category: string) => {
    switch (category) {
      case 'Security': return 'bg-red-100 text-red-800'
      case 'Operations': return 'bg-blue-100 text-blue-800'
      case 'HR': return 'bg-green-100 text-green-800'
      case 'Management': return 'bg-purple-100 text-purple-800'
      case 'Compliance': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const filteredReports = availableReports.filter(report => {
    let matches = true

    if (selectedCategory !== 'all') {
      matches = matches && report.category === selectedCategory
    }

    if (selectedDepartment !== 'all') {
      matches = matches && (
        report.departments.includes(selectedDepartment) ||
        report.departments.includes('All')
      )
    }

    return matches
  })

  return (
    <PermissionGate roles={['admin']} fallback={
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-600 dark:text-gray-400">You need Administrator privileges to access Reports.</p>
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
                  <BarChart3 className="w-8 h-8 mr-3 text-blue-600" />
                  Reports & Analytics
                </h1>
                <p className="text-sm text-gray-600 dark:text-gray-400">Generate comprehensive reports and analytics</p>
              </div>
              <button
                onClick={fetchReports}
                className="bg-gray-100 text-gray-700 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-200 transition-colors flex items-center"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </button>
            </div>
          </header>

          {/* Summary Cards */}
          <div className="px-6 py-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-blue-500">
                <div className="flex items-center">
                  <FileText className="w-8 h-8 text-blue-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{availableReports.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Available Reports</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-green-500">
                <div className="flex items-center">
                  <Clock className="w-8 h-8 text-green-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{recentReports.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Recent Reports</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-purple-500">
                <div className="flex items-center">
                  <PieChart className="w-8 h-8 text-purple-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{categories.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Categories</p>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-4 shadow-sm border-l-4 border-orange-500">
                <div className="flex items-center">
                  <TrendingUp className="w-8 h-8 text-orange-600 mr-3" />
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{departments.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Departments</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg p-4 shadow-sm mb-6">
              <div className="flex flex-wrap gap-4 items-center">
                <div className="flex items-center">
                  <Filter className="w-4 h-4 text-gray-400 mr-2" />
                  <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Filters:</span>
                </div>

                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Categories</option>
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>

                <select
                  value={selectedDepartment}
                  onChange={(e) => setSelectedDepartment(e.target.value)}
                  className="px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500"
                >
                  <option value="all">All Departments</option>
                  {departments.map(dept => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Available Reports */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Available Reports</h2>
                  </div>

                  {loading ? (
                    <div className="p-8 text-center">
                      <div className="w-8 h-8 border-4 border-gray-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
                      <p className="text-gray-600 dark:text-gray-400">Loading reports...</p>
                    </div>
                  ) : (
                    <div className="p-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {filteredReports.map((report) => (
                          <div key={report.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex items-center">
                                {getCategoryIcon(report.category)}
                                <h3 className="text-sm font-semibold text-gray-900 ml-2">{report.name}</h3>
                              </div>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${getCategoryColor(report.category)}`}>
                                {report.category}
                              </span>
                            </div>

                            <p className="text-xs text-gray-600 mb-3">{report.description}</p>

                            <div className="flex items-center justify-between text-xs text-gray-500 mb-3">
                              <span>Last: {formatDate(report.last_generated)}</span>
                              <span>Freq: {report.frequency}</span>
                            </div>

                            <div className="flex items-center justify-between">
                              <div className="flex flex-wrap gap-1">
                                {report.departments.slice(0, 2).map((dept) => (
                                  <span key={dept} className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                    {dept}
                                  </span>
                                ))}
                                {report.departments.length > 2 && (
                                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-600 rounded">
                                    +{report.departments.length - 2}
                                  </span>
                                )}
                              </div>

                              <button
                                onClick={() => generateReport(report.id)}
                                disabled={generatingReport === report.id}
                                className="bg-blue-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center"
                              >
                                {generatingReport === report.id ? (
                                  <RefreshCw className="w-3 h-3 animate-spin mr-1" />
                                ) : (
                                  <Download className="w-3 h-3 mr-1" />
                                )}
                                Generate
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Recent Reports */}
              <div>
                <div className="bg-white rounded-lg shadow-sm">
                  <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
                    <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Recent Reports</h2>
                  </div>

                  <div className="p-6">
                    {recentReports.length === 0 ? (
                      <div className="text-center py-8">
                        <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                        <p className="text-gray-500 dark:text-gray-400">No recent reports</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {recentReports.map((report) => (
                          <div key={report.id} className="border border-gray-200 rounded-lg p-3">
                            <div className="flex items-center justify-between mb-2">
                              <h4 className="text-sm font-medium text-gray-900 dark:text-white">{report.name}</h4>
                              <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                                report.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                              }`}>
                                {report.status}
                              </span>
                            </div>

                            <div className="text-xs text-gray-600 space-y-1">
                              <p>By: {report.generated_by}</p>
                              <p>Generated: {formatDate(report.generated_at)}</p>
                              <p>Size: {report.file_size} • Format: {report.format.toUpperCase()}</p>
                            </div>

                            <div className="flex justify-end mt-3">
                              <button
                                className="text-blue-600 hover:text-blue-800 text-xs flex items-center"
                                title="View report"
                              >
                                <Eye className="w-3 h-3 mr-1" />
                                View
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Report Data Modal */}
          {showReportModal && reportData && (
            <ReportDataModal
              reportType={selectedReportType}
              data={reportData}
              onClose={() => {
                setShowReportModal(false)
                setReportData(null)
                setSelectedReportType('')
              }}
            />
          )}
        </div>
      </DashboardLayout>
    </PermissionGate>
  )
}

// Report Data Modal Component
function ReportDataModal({ reportType, data, onClose }: any) {
  const downloadReport = (format: string) => {
    if (format === 'json') {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${data.report_id}.json`
      a.click()
      window.URL.revokeObjectURL(url)
    } else if (format === 'csv') {
      // Convert data to CSV format
      const csvContent = convertToCSV(data)
      const blob = new Blob([csvContent], { type: 'text/csv' })
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `${data.report_id}.csv`
      a.click()
      window.URL.revokeObjectURL(url)
    }
  }

  const convertToCSV = (data: any) => {
    // Simple CSV conversion - in real app, this would be more sophisticated
    return `Report,${data.title}\nGenerated,${data.generated_at}\nType,${data.report_type}\n`
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-4xl max-h-screen overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">{data.title}</h3>
          <div className="flex space-x-2">
            <button
              onClick={() => downloadReport('json')}
              className="bg-blue-600 text-white px-3 py-1 rounded text-sm hover:bg-blue-700 flex items-center"
            >
              <Download className="w-4 h-4 mr-1" />
              JSON
            </button>
            <button
              onClick={() => downloadReport('csv')}
              className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700 flex items-center"
            >
              <Download className="w-4 h-4 mr-1" />
              CSV
            </button>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 dark:text-gray-400">
              ✕
            </button>
          </div>
        </div>

        <div className="space-y-6">
          {/* Report Summary */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium text-gray-900 mb-3">Report Summary</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <span className="text-gray-600 dark:text-gray-400">Report ID:</span>
                <p className="font-medium">{data.report_id}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Generated:</span>
                <p className="font-medium">{new Date(data.generated_at).toLocaleString()}</p>
              </div>
              <div>
                <span className="text-gray-600 dark:text-gray-400">Type:</span>
                <p className="font-medium">{data.report_type}</p>
              </div>
              {data.period && (
                <div>
                  <span className="text-gray-600 dark:text-gray-400">Period:</span>
                  <p className="font-medium">
                    {new Date(data.period.from).toLocaleDateString()} - {new Date(data.period.to).toLocaleDateString()}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Report Data */}
          <div className="space-y-4">
            {data.summary && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Key Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {Object.entries(data.summary).map(([key, value]) => (
                    <div key={key} className="bg-white border border-gray-200 rounded-lg p-3">
                      <p className="text-sm text-gray-600 capitalize">{key.replace(/_/g, ' ')}</p>
                      <p className="text-lg font-semibold text-gray-900 dark:text-white">{String(value)}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Additional data sections based on report type */}
            {data.department_breakdown && (
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Department Breakdown</h4>
                <div className="overflow-x-auto">
                  <table className="w-full border border-gray-200 rounded-lg">
                    <thead className="bg-gray-50 dark:bg-gray-800">
                      <tr>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Department</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Users</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Active</th>
                        <th className="px-4 py-2 text-left text-sm font-medium text-gray-900 dark:text-white">Logins</th>
                      </tr>
                    </thead>
                    <tbody>
                      {data.department_breakdown.map((dept: any, index: number) => (
                        <tr key={index} className="border-t border-gray-200 dark:border-gray-700">
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{dept.department}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{dept.users}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{dept.active}</td>
                          <td className="px-4 py-2 text-sm text-gray-900 dark:text-white">{dept.logins}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Raw Data */}
            <div>
              <h4 className="font-medium text-gray-900 mb-3">Raw Data</h4>
              <pre className="bg-gray-50 rounded-lg p-4 text-xs overflow-x-auto">
                {JSON.stringify(data, null, 2)}
              </pre>
            </div>
          </div>
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