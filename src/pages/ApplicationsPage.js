import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import EditApplicationModal from '../components/EditApplicationModal';
import ViewIntegrationModal from '../components/ViewIntegrationModal';

function ApplicationsPage() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [editingApp, setEditingApp] = useState(null);
  const [viewingApp, setViewingApp] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const response = await authService.getApplications();
      if (response.success && response.data) {
        setApplications(response.data);
      }
    } catch (error) {
      console.error('Failed to fetch applications:', error);
      setError('Failed to load applications');
    } finally {
      setLoading(false);
    }
  };

  const handleEditApp = (app) => {
    setEditingApp(app);
    setIsModalOpen(true);
  };

  const handleViewIntegration = (app) => {
    console.log('🔍 View Integration clicked for app:', app);
    setViewingApp(app);
    setIsViewModalOpen(true);
    console.log('Modal should be open now. viewingApp:', app, 'isViewModalOpen:', true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingApp(null);
  };

  const handleCloseViewModal = () => {
    setIsViewModalOpen(false);
    setViewingApp(null);
  };

  const handleManageRoles = (app) => {
    console.log('🔐 Manage Roles clicked for:', app.displayName || app.name);
    // TODO: Navigate to roles page filtered by this app or open roles modal
    alert(`Manage Roles for ${app.displayName || app.name}\n\nThis will open a role management interface for this application.`);
  };

  const handleSaveApp = async () => {
    await fetchApplications(); // Refresh the list
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'development': return 'badge-warning';
      case 'inactive': return 'badge-neutral';
      default: return 'badge-neutral';
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'badge-error';
      case 'MEDIUM': return 'badge-warning';
      case 'LOW': return 'badge-success';
      default: return 'badge-neutral';
    }
  };

  const getEnvironmentColor = (environment) => {
    switch (environment) {
      case 'production': return 'badge-primary';
      case 'staging': return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400';
      case 'development': return 'badge-warning';
      default: return 'badge-neutral';
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  // Separate applications into active and queue based on migration_required
  // Filter out any apps with missing data
  const validApps = applications.filter(app => app && (app.name || app.displayName));

  const activeApps = validApps.filter(app => {
    const settings = typeof app.settings === 'string' ? JSON.parse(app.settings) : app.settings;
    return !settings?.migration_required;
  });

  const queueApps = validApps.filter(app => {
    const settings = typeof app.settings === 'string' ? JSON.parse(app.settings) : app.settings;
    return settings?.migration_required;
  });

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-text-primary sm:text-3xl sm:truncate">
            Applications
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Manage business applications and their authentication settings
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Register Application
          </button>
        </div>
      </div>

      {/* Active Applications */}
      {activeApps.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Active Applications</h3>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {activeApps.map((app) => {
              const settings = typeof app.settings === 'string' ? JSON.parse(app.settings) : app.settings;
              return (
                <div key={app.id} className="card border-2 border-success-500 dark:border-success-600">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-success-50 dark:bg-success-700/30 rounded-lg flex items-center justify-center">
                            <span className="text-success-600 dark:text-success-500 font-semibold text-lg">
                              {((app.displayName || app.name || 'A') + '').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-text-primary">{app.displayName || app.name}</h3>
                          <p className="text-sm text-text-secondary">{app.description || 'No description'}</p>
                        </div>
                      </div>
                      <span className="badge badge-success">
                        Active
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center text-sm text-text-secondary">
                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="truncate">{app.url}</span>
                      </div>
                    </div>

                    <div className="mt-6 space-y-2">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditApp(app)}
                          className="btn btn-secondary flex-1"
                        >
                          Configure Auth
                        </button>
                        <button
                          onClick={() => handleViewIntegration(app)}
                          className="btn btn-primary flex-1"
                        >
                          View Integration
                        </button>
                      </div>
                      <button
                        onClick={() => handleManageRoles(app)}
                        className="btn btn-primary w-full"
                      >
                        Manage Roles
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Integration Queue */}
      {queueApps.length > 0 && (
        <div>
          <h3 className="text-lg font-medium text-text-primary mb-4">Integration Queue</h3>
          <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
            {queueApps.map((app) => {
              const settings = typeof app.settings === 'string' ? JSON.parse(app.settings) : app.settings;
              return (
                <div key={app.id} className="card border-2 border-warning-500 dark:border-warning-600">
                  <div className="p-6">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center">
                        <div className="flex-shrink-0">
                          <div className="h-10 w-10 bg-warning-50 dark:bg-warning-700/30 rounded-lg flex items-center justify-center">
                            <span className="text-warning-600 dark:text-warning-500 font-semibold text-lg">
                              {((app.displayName || app.name || 'A') + '').charAt(0).toUpperCase()}
                            </span>
                          </div>
                        </div>
                        <div className="ml-4">
                          <h3 className="text-lg font-medium text-text-primary">{app.displayName || app.name}</h3>
                          <p className="text-sm text-text-secondary">{app.description || 'No description'}</p>
                        </div>
                      </div>
                      <span className={`badge ${getPriorityColor(settings?.migration_priority)}`}>
                        {settings?.migration_priority} Priority
                      </span>
                    </div>

                    <div className="mt-4">
                      <div className="flex items-center text-sm text-text-secondary">
                        <svg className="flex-shrink-0 mr-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <span className="truncate">{app.url}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex items-center space-x-2">
                      <span className="text-xs text-text-secondary">Status:</span>
                      <span className={`badge ${getEnvironmentColor(settings?.environment)}`}>
                        {settings?.environment || 'development'}
                      </span>
                      <span className="badge bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-400">
                        Pending Integration
                      </span>
                    </div>

                    <div className="mt-6 space-y-2">
                      <div className="flex space-x-3">
                        <button
                          onClick={() => handleEditApp(app)}
                          className="btn btn-secondary flex-1"
                        >
                          Configure Auth
                        </button>
                        <button
                          onClick={() => handleViewIntegration(app)}
                          className="btn btn-primary flex-1"
                        >
                          View Integration
                        </button>
                      </div>
                      <button
                        onClick={() => handleManageRoles(app)}
                        className="btn btn-primary w-full"
                      >
                        Manage Roles
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}


      {/* Integration Guide */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-medium text-blue-900 mb-2">
          Application Integration Guide
        </h3>
        <p className="text-sm text-blue-700 mb-4">
          Follow these steps to integrate your applications with the centralized authentication system:
        </p>
        <ol className="list-decimal list-inside space-y-2 text-sm text-blue-700">
          <li>Install the auth middleware in your application</li>
          <li>Configure environment-specific settings</li>
          <li>Update your authentication routes</li>
          <li>Test the integration thoroughly</li>
          <li>Deploy and monitor the changes</li>
        </ol>
        <div className="mt-4">
          <button className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500">
            View Integration Docs
          </button>
        </div>
      </div>

      {/* Edit Application Modal */}
      <EditApplicationModal
        application={editingApp}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onSave={handleSaveApp}
      />

      {/* View Integration Modal */}
      <ViewIntegrationModal
        application={viewingApp}
        isOpen={isViewModalOpen}
        onClose={handleCloseViewModal}
      />
    </div>
  );
}

export default ApplicationsPage;