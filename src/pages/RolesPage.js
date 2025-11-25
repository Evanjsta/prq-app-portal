import React, { useState } from 'react';

function RolesPage() {
  const [selectedApp, setSelectedApp] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedRole, setSelectedRole] = useState(null);
  const [roles] = useState([
    {
      id: '1',
      name: 'Admin',
      description: 'Full system administration access',
      applicationId: '1',
      applicationName: 'PRQ Prezy',
      permissions: ['read', 'write', 'delete', 'manage_users', 'manage_settings'],
      userCount: 3,
      createdAt: '2025-09-01T10:00:00Z'
    },
    {
      id: '2',
      name: 'Sales Manager',
      description: 'Sales team management and reporting',
      applicationId: '1',
      applicationName: 'PRQ Prezy',
      permissions: ['read', 'write', 'manage_team'],
      userCount: 5,
      createdAt: '2025-09-01T10:00:00Z'
    },
    {
      id: '3',
      name: 'Sales Rep',
      description: 'Standard sales representative access',
      applicationId: '1',
      applicationName: 'PRQ Prezy',
      permissions: ['read', 'write'],
      userCount: 17,
      createdAt: '2025-09-01T10:00:00Z'
    },
    {
      id: '4',
      name: 'Calculator Admin',
      description: 'Commission calculation administration',
      applicationId: '2',
      applicationName: 'Commission Calculator',
      permissions: ['read', 'write', 'manage_rates', 'export_data'],
      userCount: 2,
      createdAt: '2025-09-05T14:20:00Z'
    },
    {
      id: '5',
      name: 'Permit Manager',
      description: 'Building permit management access',
      applicationId: '3',
      applicationName: 'Permit Data Manager',
      permissions: ['read', 'write', 'approve_permits', 'manage_documents'],
      userCount: 8,
      createdAt: '2025-09-03T09:30:00Z'
    },
    {
      id: '6',
      name: 'HubSpot Sync Admin',
      description: 'CRM data synchronization management',
      applicationId: '4',
      applicationName: 'HubSpot Data Manager',
      permissions: ['read', 'write', 'manage_sync', 'configure_mappings'],
      userCount: 4,
      createdAt: '2025-09-02T16:45:00Z'
    }
  ]);

  const applications = [
    { id: 'all', name: 'All Applications' },
    { id: '1', name: 'PRQ Prezy' },
    { id: '2', name: 'Commission Calculator' },
    { id: '3', name: 'Permit Data Manager' },
    { id: '4', name: 'HubSpot Data Manager' }
  ];

  const filteredRoles = selectedApp === 'all'
    ? roles
    : roles.filter(role => role.applicationId === selectedApp);

  const getPermissionColor = (permission) => {
    const colors = {
      'read': 'bg-green-100 text-green-800',
      'write': 'bg-blue-100 text-blue-800',
      'delete': 'bg-red-100 text-red-800',
      'manage_users': 'bg-purple-100 text-purple-800',
      'manage_settings': 'bg-orange-100 text-orange-800',
      'manage_team': 'bg-indigo-100 text-indigo-800',
      'manage_rates': 'bg-yellow-100 text-yellow-800',
      'export_data': 'bg-pink-100 text-pink-800',
      'approve_permits': 'bg-teal-100 text-teal-800',
      'manage_documents': 'bg-cyan-100 text-cyan-800',
      'manage_sync': 'bg-lime-100 text-lime-800',
      'configure_mappings': 'bg-amber-100 text-amber-800'
    };
    return colors[permission] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-text-primary sm:text-3xl sm:truncate">
            Roles & Permissions
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Manage role-based access control across all applications
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={() => {
              console.log('🎯 Create Role clicked');
              setShowCreateModal(true);
            }}
            className="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Role
          </button>
        </div>
      </div>

      {/* Filter */}
      <div className="card">
        <div className="p-6">
          <div className="flex items-center space-x-4">
            <label htmlFor="application-filter" className="text-sm font-medium text-text-primary">
              Filter by Application:
            </label>
            <select
              id="application-filter"
              value={selectedApp}
              onChange={(e) => setSelectedApp(e.target.value)}
              className="input"
            >
              {applications.map(app => (
                <option key={app.id} value={app.id}>{app.name}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Roles Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {filteredRoles.map((role) => (
          <div key={role.id} className="card">
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium text-text-primary">{role.name}</h3>
                  <p className="text-sm text-text-secondary mt-1">{role.description}</p>
                </div>
                <div className="flex-shrink-0">
                  <button className="text-text-tertiary hover:text-text-secondary">
                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-sm text-text-secondary">
                  <span className="font-medium">Application:</span> {role.applicationName}
                </div>
                <div className="text-sm text-text-secondary mt-1">
                  <span className="font-medium">Users:</span> {role.userCount}
                </div>
                <div className="text-sm text-text-secondary mt-1">
                  <span className="font-medium">Created:</span> {formatDate(role.createdAt)}
                </div>
              </div>

              <div className="mt-4">
                <h4 className="text-sm font-medium text-text-primary mb-2">Permissions</h4>
                <div className="flex flex-wrap gap-1">
                  {role.permissions.map((permission, index) => (
                    <span
                      key={index}
                      className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getPermissionColor(permission)}`}
                    >
                      {permission.replace('_', ' ')}
                    </span>
                  ))}
                </div>
              </div>

              <div className="mt-6 flex space-x-3">
                <button
                  onClick={() => {
                    console.log('✏️ Edit Role clicked for:', role.name);
                    setSelectedRole(role);
                    setShowEditModal(true);
                  }}
                  className="btn btn-secondary flex-1"
                >
                  Edit Role
                </button>
                <button
                  onClick={() => {
                    console.log('👥 Assign Users clicked for:', role.name);
                    setSelectedRole(role);
                    setShowAssignModal(true);
                  }}
                  className="btn btn-primary"
                >
                  Assign Users
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Role Statistics */}
      <div className="card">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-text-primary mb-4">
            Role Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">{roles.length}</div>
              <div className="text-sm text-text-secondary">Total Roles</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {roles.reduce((sum, role) => sum + role.userCount, 0)}
              </div>
              <div className="text-sm text-text-secondary">Total Assignments</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600 dark:text-success-500">
                {new Set(roles.map(role => role.applicationId)).size}
              </div>
              <div className="text-sm text-text-secondary">Applications</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {new Set(roles.flatMap(role => role.permissions)).size}
              </div>
              <div className="text-sm text-text-secondary">Unique Permissions</div>
            </div>
          </div>
        </div>
      </div>

      {/* Permission Matrix */}
      <div className="card">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg leading-6 font-medium text-text-primary mb-4">
            Permission Matrix
          </h3>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-border">
              <thead className="bg-surface">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Application
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Read
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Write
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Manage
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-text-secondary uppercase tracking-wider">
                    Users
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filteredRoles.map((role) => (
                  <tr key={role.id} className="hover:bg-surface transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-text-primary">
                      {role.name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {role.applicationName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {role.permissions.includes('read') ? '✅' : '❌'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {role.permissions.includes('write') ? '✅' : '❌'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {role.permissions.some(p => p.includes('manage')) ? '✅' : '❌'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-text-secondary">
                      {role.userCount}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Placeholder Modals - console.log to show they're working */}
      {showCreateModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="card w-full max-w-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-text-primary mb-4">Create New Role</h2>
              <p className="text-text-secondary mb-6">Role creation form coming soon...</p>
              <button onClick={() => setShowCreateModal(false)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showEditModal && selectedRole && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="card w-full max-w-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-text-primary mb-4">Edit Role: {selectedRole.name}</h2>
              <p className="text-text-secondary mb-6">Role editing form coming soon...</p>
              <button onClick={() => setShowEditModal(false)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {showAssignModal && selectedRole && (
        <div className="fixed inset-0 flex items-center justify-center z-50" style={{ backgroundColor: 'rgba(0, 0, 0, 0.5)' }}>
          <div className="card w-full max-w-2xl">
            <div className="p-6">
              <h2 className="text-xl font-bold text-text-primary mb-4">Assign Users to: {selectedRole.name}</h2>
              <p className="text-text-secondary mb-6">User assignment form coming soon...</p>
              <button onClick={() => setShowAssignModal(false)} className="btn btn-primary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default RolesPage;