'use client';

import { useState, useEffect } from 'react';
import {
  Smartphone,
  Users,
  Activity,
  Clock,
  AlertCircle,
  RefreshCw,
  Trash2,
  CheckCircle,
  XCircle,
  Apple,
  Monitor
} from 'lucide-react';

interface MobileSession {
  id: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    position?: string;
    avatar_url?: string;
  };
  device: {
    platform: string;
    model?: string;
    os_version?: string;
  };
  app_version: string;
  status: string;
  ip_address?: string;
  location?: string;
  started_at: string;
  last_activity_at: string;
  expires_at: string;
  ended_at?: string;
}

interface SessionStats {
  total: number;
  by_status: Record<string, number>;
  by_version: Array<{ version: string; count: number }>;
  by_platform: Record<string, number>;
}

export default function MobileManagePage() {
  const [sessions, setSessions] = useState<MobileSession[]>([]);
  const [stats, setStats] = useState<SessionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [filter, setFilter] = useState<'all' | 'active' | 'expired' | 'revoked'>('all');

  useEffect(() => {
    fetchSessions();
  }, [filter]);

  const fetchSessions = async () => {
    try {
      setLoading(true);
      setError('');

      const params = new URLSearchParams();
      if (filter !== 'all') {
        params.append('status', filter);
      }

      const response = await fetch(`/api/mobile/sessions?${params}`);
      const data = await response.json();

      if (data.success) {
        setSessions(data.sessions);
        setStats(data.stats);
      } else {
        setError(data.error || 'Failed to fetch sessions');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch sessions');
    } finally {
      setLoading(false);
    }
  };

  const revokeSession = async (sessionId: string) => {
    if (!confirm('Are you sure you want to revoke this session? The user will be logged out.')) {
      return;
    }

    try {
      setError('');
      setSuccess('');

      const response = await fetch('/api/mobile/sessions', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId }),
      });

      const data = await response.json();

      if (data.success) {
        setSuccess('Session revoked successfully');
        fetchSessions();
      } else {
        setError(data.error || 'Failed to revoke session');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to revoke session');
    }
  };

  const getStatusBadge = (status: string) => {
    const badges: Record<string, { color: string; icon: any; text: string }> = {
      active: { color: 'bg-green-100 text-green-800', icon: CheckCircle, text: 'Active' },
      expired: { color: 'bg-gray-100 text-gray-800', icon: Clock, text: 'Expired' },
      revoked: { color: 'bg-red-100 text-red-800', icon: XCircle, text: 'Revoked' },
    };

    const badge = badges[status] || badges.active!; // Safe: badges.active always exists
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3" />
        {badge.text}
      </span>
    );
  };

  const getPlatformIcon = (platform: string) => {
    if (platform === 'ios') {
      return <Apple className="w-5 h-5 text-gray-600" />;
    } else if (platform === 'android') {
      return <Monitor className="w-5 h-5 text-gray-600" />;
    }
    return <Smartphone className="w-5 h-5 text-gray-600" />;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return 'Just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Mobile App Management</h1>
          <p className="text-gray-600">Monitor and manage mobile app sessions and usage</p>
        </div>
        <button
          onClick={fetchSessions}
          disabled={loading}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 text-white rounded-md flex items-center gap-2"
        >
          <RefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </button>
      </div>

      {/* Alerts */}
      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-md text-red-800 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          {error}
        </div>
      )}
      {success && (
        <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-md text-green-800 flex items-center gap-2">
          <CheckCircle className="w-5 h-5" />
          {success}
        </div>
      )}

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          {/* Total Sessions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Total Sessions</h3>
              <Smartphone className="w-5 h-5 text-blue-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">{stats.total}</div>
          </div>

          {/* Active Sessions */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Active Sessions</h3>
              <Activity className="w-5 h-5 text-green-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.by_status.active || 0}
            </div>
          </div>

          {/* iOS Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">iOS Users</h3>
              <Apple className="w-5 h-5 text-gray-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.by_platform.ios || 0}
            </div>
          </div>

          {/* Android Users */}
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-medium text-gray-600">Android Users</h3>
              <Monitor className="w-5 h-5 text-gray-600" />
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {stats.by_platform.android || 0}
            </div>
          </div>
        </div>
      )}

      {/* App Version Distribution */}
      {stats && stats.by_version.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">App Version Distribution</h2>
          <div className="space-y-3">
            {stats.by_version.map((version, index) => {
              const percentage = stats.total > 0 ? (version.count / stats.total) * 100 : 0;
              return (
                <div key={index}>
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium text-gray-700">v{version.version}</span>
                    <span className="text-sm text-gray-600">
                      {version.count} users ({percentage.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {['all', 'active', 'expired', 'revoked'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status as any)}
                className={`px-6 py-3 text-sm font-medium capitalize ${
                  filter === status
                    ? 'border-b-2 border-blue-600 text-blue-600'
                    : 'text-gray-600 hover:text-gray-900 hover:border-b-2 hover:border-gray-300'
                }`}
              >
                {status}
                {stats && stats.by_status[status] && (
                  <span className="ml-2 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs">
                    {stats.by_status[status]}
                  </span>
                )}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Sessions List */}
      <div className="bg-white rounded-lg shadow">
        <div className="p-6">
          <h2 className="text-xl font-semibold mb-4">Mobile Sessions</h2>

          {loading && sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">Loading sessions...</div>
          ) : sessions.length === 0 ? (
            <div className="text-center py-12 text-gray-500">No sessions found</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">User</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Device</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">App Version</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Last Activity</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-600 uppercase">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {sessions.map((session) => (
                    <tr key={session.id} className="hover:bg-gray-50">
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-3">
                          {session.user.avatar_url ? (
                            <img
                              src={session.user.avatar_url}
                              alt={session.user.name}
                              className="w-10 h-10 rounded-full"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                              <span className="text-blue-600 font-semibold text-sm">
                                {session.user.name.charAt(0)}
                              </span>
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-gray-900">{session.user.name}</div>
                            <div className="text-sm text-gray-600">{session.user.email}</div>
                            {session.user.position && (
                              <div className="text-xs text-gray-500">{session.user.position}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <div className="flex items-center gap-2">
                          {getPlatformIcon(session.device.platform)}
                          <div>
                            <div className="text-sm font-medium text-gray-900 capitalize">
                              {session.device.platform}
                            </div>
                            {session.device.model && (
                              <div className="text-xs text-gray-600">{session.device.model}</div>
                            )}
                            {session.device.os_version && (
                              <div className="text-xs text-gray-500">OS: {session.device.os_version}</div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        <span className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                          v{session.app_version}
                        </span>
                      </td>
                      <td className="px-4 py-4">
                        {getStatusBadge(session.status)}
                      </td>
                      <td className="px-4 py-4">
                        <div className="text-sm text-gray-900">{formatDate(session.last_activity_at)}</div>
                        <div className="text-xs text-gray-500">
                          Started: {formatDate(session.started_at)}
                        </div>
                      </td>
                      <td className="px-4 py-4">
                        {session.status === 'active' && (
                          <button
                            onClick={() => revokeSession(session.id)}
                            className="text-red-600 hover:text-red-800 flex items-center gap-1 text-sm"
                          >
                            <Trash2 className="w-4 h-4" />
                            Revoke
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
