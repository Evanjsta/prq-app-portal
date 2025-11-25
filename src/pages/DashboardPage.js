import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';

function DashboardPage() {
  const { user: clerkUser } = useUser();
  const user = clerkUser ? { name: clerkUser.fullName } : null;
  const [systemHealth, setSystemHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSystemHealth();
  }, []);

  const fetchSystemHealth = async () => {
    try {
      const backendUrl = process.env.REACT_APP_AUTH_SERVICE_URL || 'http://localhost:3001';
      const response = await fetch(`${backendUrl}/api/monitoring/health`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('authToken')}`
        }
      });
      const data = await response.json();
      setSystemHealth(data);
    } catch (error) {
      console.error('Failed to fetch system health:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'healthy': return 'text-success-700 bg-success-50 dark:text-success-500 dark:bg-success-700/30';
      case 'warning': return 'text-warning-700 bg-warning-50 dark:text-warning-500 dark:bg-warning-700/30';
      case 'critical': return 'text-error-700 bg-error-50 dark:text-error-500 dark:bg-error-700/30';
      default: return 'text-text-secondary bg-surface dark:text-text-tertiary dark:bg-surface-elevated';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="card">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                <span className="text-primary-600 dark:text-primary-400 font-semibold text-sm">👋</span>
              </div>
            </div>
            <div className="ml-4">
              <h1 className="text-lg font-medium text-text-primary">
                Welcome back, {user?.name || 'Admin'}!
              </h1>
              <p className="text-sm text-text-secondary">
                Centralized Authentication System Dashboard
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* System Health */}
      <div className="card">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-text-primary mb-4">
            System Health
          </h3>

          {systemHealth ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-surface p-4 rounded-lg">
                <div className="flex items-center">
                  <div className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(systemHealth.data?.status)}`}>
                    {systemHealth.data?.status || 'Unknown'}
                  </div>
                </div>
                <p className="text-sm text-text-secondary mt-1">Overall Status</p>
              </div>

              <div className="bg-surface p-4 rounded-lg">
                <div className="text-lg font-semibold text-text-primary">
                  {Math.round(systemHealth.data?.uptime / 60) || 0}m
                </div>
                <p className="text-sm text-text-secondary">Uptime</p>
              </div>

              <div className="bg-surface p-4 rounded-lg">
                <div className="text-lg font-semibold text-text-primary">
                  {systemHealth.data?.errors?.lastHour || 0}
                </div>
                <p className="text-sm text-text-secondary">Errors (Last Hour)</p>
              </div>

              <div className="bg-surface p-4 rounded-lg">
                <div className="text-lg font-semibold text-text-primary">
                  {systemHealth.data?.errors?.critical || 0}
                </div>
                <p className="text-sm text-text-secondary">Critical Issues</p>
              </div>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-text-secondary">Unable to load system health data</p>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary-100 dark:bg-primary-900/30 rounded-full flex items-center justify-center">
                  <span className="text-primary-600 dark:text-primary-400">👥</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-text-secondary truncate">
                    Active Users
                  </dt>
                  <dd className="text-lg font-medium text-text-primary">
                    --
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-success-50 dark:bg-success-700/30 rounded-full flex items-center justify-center">
                  <span className="text-success-600 dark:text-success-400">🔧</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-text-secondary truncate">
                    Applications
                  </dt>
                  <dd className="text-lg font-medium text-text-primary">
                    4
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="p-5">
            <div className="flex items-center">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900/30 rounded-full flex items-center justify-center">
                  <span className="text-purple-600 dark:text-purple-400">📊</span>
                </div>
              </div>
              <div className="ml-5 w-0 flex-1">
                <dl>
                  <dt className="text-sm font-medium text-text-secondary truncate">
                    Sessions Today
                  </dt>
                  <dd className="text-lg font-medium text-text-primary">
                    --
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Target Applications */}
      <div className="card">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-text-primary mb-4">
            Target Applications
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { name: 'PRQ Prezy', status: 'active', priority: 'HIGH' },
              { name: 'Commission Calculator', status: 'development', priority: 'MEDIUM' },
              { name: 'Permit Data Manager', status: 'active', priority: 'HIGH' },
              { name: 'HubSpot Data Manager', status: 'active', priority: 'MEDIUM' }
            ].map((app, index) => (
              <div key={index} className="flex items-center justify-between p-3 border border-border rounded-lg bg-surface">
                <div className="flex items-center">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    app.status === 'active' ? 'bg-success-500' :
                    app.status === 'development' ? 'bg-warning-500' : 'bg-neutral-400'
                  }`}></div>
                  <span className="font-medium text-text-primary">{app.name}</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                    app.priority === 'HIGH' ? 'badge-error' : 'badge-warning'
                  }`}>
                    {app.priority}
                  </span>
                  <span className="text-sm text-text-secondary capitalize">{app.status}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default DashboardPage;