'use client';
"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = CAPAPage;
const react_1 = require("react");
const lucide_react_1 = require("lucide-react");
function CAPAPage() {
    const [capaTasks, setCapaTasks] = (0, react_1.useState)([]);
    const [analytics, setAnalytics] = (0, react_1.useState)(null);
    const [loading, setLoading] = (0, react_1.useState)(true);
    const [selectedStatus, setSelectedStatus] = (0, react_1.useState)('all');
    const [selectedPriority, setSelectedPriority] = (0, react_1.useState)('all');
    const [selectedType, setSelectedType] = (0, react_1.useState)('all');
    const [searchTerm, setSearchTerm] = (0, react_1.useState)('');
    (0, react_1.useEffect)(() => {
        loadData();
        loadAnalytics();
    }, [selectedStatus, selectedPriority, selectedType]);
    const loadData = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: '1',
                limit: '50',
                sort_by: 'created_at',
                sort_order: 'desc'
            });
            if (selectedStatus !== 'all')
                params.append('status', selectedStatus);
            if (selectedPriority !== 'all')
                params.append('priority', selectedPriority);
            if (selectedType !== 'all')
                params.append('type', selectedType);
            const response = await fetch(`/api/capa?${params}`);
            const data = await response.json();
            if (data.capa_tasks) {
                setCapaTasks(data.capa_tasks);
            }
        }
        catch (error) {
            console.error('Error loading CAPA data:', error);
        }
        finally {
            setLoading(false);
        }
    };
    const loadAnalytics = async () => {
        try {
            const response = await fetch('/api/capa/analytics/summary');
            const data = await response.json();
            setAnalytics(data);
        }
        catch (error) {
            console.error('Error loading CAPA analytics:', error);
        }
    };
    const filteredTasks = capaTasks.filter(task => searchTerm === '' ||
        task.capa_number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        task.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (task.assignee &&
            (`${task.assignee.first_name} ${task.assignee.last_name}`.toLowerCase().includes(searchTerm.toLowerCase()))));
    const getStatusBadge = (status) => {
        switch (status) {
            case 'OPEN':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
          <lucide_react_1.XCircle className="w-3 h-3 mr-1"/>
          Open
        </span>;
            case 'IN_PROGRESS':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          <lucide_react_1.Clock className="w-3 h-3 mr-1"/>
          In Progress
        </span>;
            case 'PENDING_VERIFICATION':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
          <lucide_react_1.AlertTriangle className="w-3 h-3 mr-1"/>
          Pending Verification
        </span>;
            case 'CLOSED':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
          <lucide_react_1.CheckCircle className="w-3 h-3 mr-1"/>
          Closed
        </span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
          {status}
        </span>;
        }
    };
    const getPriorityBadge = (priority) => {
        const colors = {
            'LOW': 'bg-green-100 text-green-800',
            'MEDIUM': 'bg-yellow-100 text-yellow-800',
            'HIGH': 'bg-orange-100 text-orange-800',
            'CRITICAL': 'bg-red-100 text-red-800'
        };
        return (<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${colors[priority] || 'bg-gray-100 text-gray-800'}`}>
        {priority}
      </span>);
    };
    const getTypeBadge = (type) => {
        return (<span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${type === 'CORRECTIVE' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
        {type}
      </span>);
    };
    const isOverdue = (dueDate) => {
        if (!dueDate)
            return false;
        return new Date(dueDate) < new Date();
    };
    if (loading) {
        return (<div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading CAPA data...</p>
        </div>
      </div>);
    }
    return (<div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="md:flex md:items-center md:justify-between mb-8">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
              CAPA Management
            </h1>
            <p className="mt-1 text-sm text-gray-500">
              Corrective and Preventive Action tracking and management
            </p>
          </div>
          <div className="mt-4 flex md:mt-0 md:ml-4 space-x-3">
            <button className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50">
              <lucide_react_1.TrendingUp className="w-4 h-4 mr-2"/>
              Analytics
            </button>
            <button className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700">
              <lucide_react_1.Plus className="w-4 h-4 mr-2"/>
              New CAPA
            </button>
          </div>
        </div>

        {/* Analytics Cards */}
        {analytics && (<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <lucide_react_1.FileText className="h-6 w-6 text-gray-400"/>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Total CAPAs</dt>
                      <dd className="text-lg font-medium text-gray-900">{analytics.total_tasks}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <lucide_react_1.AlertTriangle className="h-6 w-6 text-red-400"/>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Overdue</dt>
                      <dd className="text-lg font-medium text-gray-900">{analytics.overdue_count}</dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white overflow-hidden shadow rounded-lg">
              <div className="p-5">
                <div className="flex items-center">
                  <div className="flex-shrink-0">
                    <lucide_react_1.Target className="h-6 w-6 text-green-400"/>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Effectiveness Rate</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analytics.effectiveness_distribution.length > 0
                ? Math.round((analytics.effectiveness_distribution.find(e => e.effectiveness === 'EFFECTIVE')?._count.id || 0) /
                    analytics.effectiveness_distribution.reduce((sum, e) => sum + e._count.id, 0) * 100)
                : 0}%
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
                    <lucide_react_1.Calendar className="h-6 w-6 text-blue-400"/>
                  </div>
                  <div className="ml-5 w-0 flex-1">
                    <dl>
                      <dt className="text-sm font-medium text-gray-500 truncate">Avg Completion</dt>
                      <dd className="text-lg font-medium text-gray-900">
                        {analytics.average_completion_days} days
                      </dd>
                    </dl>
                  </div>
                </div>
              </div>
            </div>
          </div>)}

        {/* Filters */}
        <div className="bg-white shadow rounded-lg mb-6">
          <div className="px-6 py-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
              <div className="flex flex-col sm:flex-row sm:items-center space-y-4 sm:space-y-0 sm:space-x-4">
                <div className="relative">
                  <lucide_react_1.Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400"/>
                  <input type="text" placeholder="Search CAPA tasks..." className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}/>
                </div>
                
                <select className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
                  <option value="all">All Status</option>
                  <option value="OPEN">Open</option>
                  <option value="IN_PROGRESS">In Progress</option>
                  <option value="PENDING_VERIFICATION">Pending Verification</option>
                  <option value="CLOSED">Closed</option>
                </select>

                <select className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" value={selectedPriority} onChange={(e) => setSelectedPriority(e.target.value)}>
                  <option value="all">All Priority</option>
                  <option value="LOW">Low</option>
                  <option value="MEDIUM">Medium</option>
                  <option value="HIGH">High</option>
                  <option value="CRITICAL">Critical</option>
                </select>

                <select className="border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500" value={selectedType} onChange={(e) => setSelectedType(e.target.value)}>
                  <option value="all">All Types</option>
                  <option value="CORRECTIVE">Corrective</option>
                  <option value="PREVENTIVE">Preventive</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* CAPA Tasks Table */}
        <div className="bg-white shadow rounded-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h3 className="text-lg font-medium text-gray-900">CAPA Tasks</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CAPA Number
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Type / Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Source
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredTasks.map((task) => (<tr key={task.id} className={`hover:bg-gray-50 ${isOverdue(task.due_date) ? 'bg-red-50' : ''}`}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {task.capa_number}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                        {task.title}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="space-y-1">
                        {getTypeBadge(task.type)}
                        {getPriorityBadge(task.priority)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(task.status)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {task.assignee
                ? `${task.assignee.first_name} ${task.assignee.last_name}`
                : 'Unassigned'}
                      </div>
                      {task.assignee && (<div className="text-sm text-gray-500">
                          {task.assignee.employee_number}
                        </div>)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {task.due_date ? (<div className={`text-sm ${isOverdue(task.due_date) ? 'text-red-600 font-medium' : 'text-gray-900'}`}>
                          {new Date(task.due_date).toLocaleDateString()}
                          {isOverdue(task.due_date) && (<div className="text-xs text-red-500">Overdue</div>)}
                        </div>) : (<span className="text-sm text-gray-500">No due date</span>)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {task.source_type.replace('_', ' ')}
                      </div>
                      {task.inspection && (<div className="text-sm text-gray-500">
                          Order: {task.inspection.order.order_number}
                        </div>)}
                      {task.defect && (<div className="text-sm text-gray-500">
                          {task.defect.defect_code.code}: {task.defect.defect_code.name}
                        </div>)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center space-x-2">
                        <button className="text-blue-600 hover:text-blue-900">
                          <lucide_react_1.Eye className="w-4 h-4"/>
                        </button>
                        <button className="text-gray-600 hover:text-gray-900">
                          <lucide_react_1.Edit className="w-4 h-4"/>
                        </button>
                      </div>
                    </td>
                  </tr>))}
              </tbody>
            </table>
          </div>
          
          {filteredTasks.length === 0 && (<div className="text-center py-12">
              <lucide_react_1.FileText className="mx-auto h-12 w-12 text-gray-400"/>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No CAPA tasks found</h3>
              <p className="mt-1 text-sm text-gray-500">
                Get started by creating your first CAPA task.
              </p>
            </div>)}
        </div>
      </div>
    </div>);
}
