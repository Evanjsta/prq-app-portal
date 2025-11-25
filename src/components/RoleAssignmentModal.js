import React, { useState, useEffect } from 'react';
import authService from '../services/authService';

const RoleAssignmentModal = ({ isOpen, onClose, user, currentUser, applications, onRoleUpdated }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [selectedScope, setSelectedScope] = useState('global'); // 'global' or applicationId
  const [selectedRole, setSelectedRole] = useState(user?.systemRole || 'user');
  const [userApplications, setUserApplications] = useState([]);

  useEffect(() => {
    if (user && isOpen) {
      loadUserApplications();
      setSelectedRole(user.systemRole || 'user');
    }
  }, [user, isOpen]);

  const loadUserApplications = async () => {
    try {
      const response = await authService.getUserApplications(user.id);
      setUserApplications(response.data || []);
    } catch (err) {
      console.error('Failed to load user applications:', err);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setError(null);
    setSuccess(null);

    try {
      if (selectedScope === 'global') {
        // Set global system role
        const result = await authService.setGlobalSystemRole(
          user.id,
          selectedRole,
          currentUser.id
        );

        if (result.success) {
          setSuccess(`Successfully updated ${user.firstName}'s global role to ${selectedRole}`);
          setTimeout(() => {
            onRoleUpdated();
            onClose();
          }, 1500);
        } else {
          setError(result.message || 'Failed to update role');
        }
      } else {
        // Set app-specific system role
        const applicationId = parseInt(selectedScope);
        const result = await authService.setAppSystemRole(
          user.id,
          applicationId,
          selectedRole,
          {},
          currentUser.id
        );

        if (result.success) {
          const app = applications.find(a => a.id === applicationId);
          setSuccess(`Successfully updated ${user.firstName}'s role for ${app?.display_name} to ${selectedRole}`);
          setTimeout(() => {
            onRoleUpdated();
            onClose();
          }, 1500);
        } else {
          setError(result.message || 'Failed to update role');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to update role');
    } finally {
      setLoading(false);
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'administrator':
        return 'bg-red-100 text-red-800 border border-red-200';
      case 'app_manager':
        return 'bg-blue-100 text-blue-800 border border-blue-200';
      case 'user':
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200';
    }
  };

  const getRoleDescription = (role) => {
    switch (role) {
      case 'administrator':
        return 'Full system access - can manage all users, applications, and settings';
      case 'app_manager':
        return 'Can assign users and manage settings for specific applications';
      case 'user':
      default:
        return 'Can access assigned applications';
    }
  };

  const canChangeRole = () => {
    console.log('🔐 canChangeRole check:', {
      currentUser,
      currentUserSystemRole: currentUser?.systemRole,
      selectedScope
    });

    // Only administrators can change global roles
    if (selectedScope === 'global') {
      return currentUser?.systemRole === 'administrator';
    }

    // Administrators can change any app role
    if (currentUser?.systemRole === 'administrator') {
      return true;
    }

    // App managers can only change roles for their managed apps
    if (currentUser.systemRole === 'app_manager') {
      const appId = parseInt(selectedScope);
      const currentUserApp = currentUser.userApplications?.find(
        ua => ua.applicationId === appId && ua.systemRole === 'app_manager'
      );
      return !!currentUserApp;
    }

    return false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 flex items-center justify-center z-50">
      <div className="card w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6 border-b border-border">
          <div className="flex justify-between items-start">
            <div>
              <h2 className="text-2xl font-bold text-text-primary">Manage User Role</h2>
              <p className="text-sm text-text-secondary mt-1">
                {user?.name || `${user?.firstName} ${user?.lastName}`} ({user?.email})
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-text-tertiary hover:text-text-secondary"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Current Role Display */}
          <div className="bg-surface p-4 rounded-lg border border-border">
            <h3 className="text-sm font-medium text-text-primary mb-2">Current System Role</h3>
            <div className="flex items-center space-x-2">
              <span className={`badge ${getRoleBadgeClass(user?.systemRole)}`}>
                {user?.systemRole || 'user'}
              </span>
              <span className="text-sm text-text-secondary">
                {getRoleDescription(user?.systemRole)}
              </span>
            </div>
          </div>

          {/* User's Applications */}
          {userApplications.length > 0 && (
            <div className="bg-primary-50 dark:bg-primary-900/20 p-4 rounded-lg border border-primary-200 dark:border-primary-800">
              <h3 className="text-sm font-medium text-text-primary mb-2">Current Application Access</h3>
              <div className="space-y-2">
                {userApplications.map(ua => {
                  const app = applications.find(a => a.id === ua.applicationId);
                  return (
                    <div key={ua.id} className="flex items-center justify-between">
                      <span className="text-sm text-text-primary">{app?.display_name || 'Unknown App'}</span>
                      <span className={`badge ${getRoleBadgeClass(ua.systemRole)}`}>
                        {ua.systemRole || 'user'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Role Assignment Form */}
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                Role Scope
              </label>
              <select
                value={selectedScope}
                onChange={(e) => {
                  console.log('🔄 Scope changed to:', e.target.value);
                  setSelectedScope(e.target.value);
                  // Reset role selection when changing scope
                  if (e.target.value === 'global') {
                    setSelectedRole(user?.systemRole || 'user');
                  } else {
                    const appId = parseInt(e.target.value);
                    const userApp = userApplications.find(ua => ua.applicationId === appId);
                    setSelectedRole(userApp?.systemRole || 'user');
                  }
                }}
                className="input"
              >
                <option value="global">Global (All Applications)</option>
                {(() => {
                  console.log('📱 Applications in modal:', applications);
                  console.log('📱 Active apps:', applications?.filter(app => app.isActive || app.is_active));
                  return applications?.filter(app => app.isActive || app.is_active).map(app => (
                    <option key={app.id} value={app.id}>
                      {app.displayName || app.display_name} (App-Specific)
                    </option>
                  ));
                })()}
              </select>
              <p className="text-xs text-text-tertiary mt-1">
                {selectedScope === 'global'
                  ? 'Global role applies across all applications'
                  : 'App-specific role only affects access to this application'}
              </p>
            </div>

            <div>
              <label className="block text-sm font-medium text-text-primary mb-2">
                System Role
              </label>
              <div className="space-y-3">
                {['user', 'app_manager', 'administrator'].map(role => (
                  <label
                    key={role}
                    className={`flex items-start p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedRole === role
                        ? 'border-primary-500 bg-primary-50 dark:bg-primary-900/20 dark:border-primary-600'
                        : 'border-border hover:bg-surface'
                    }`}
                  >
                    <input
                      type="radio"
                      name="role"
                      value={role}
                      checked={selectedRole === role}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="mt-1 mr-3"
                    />
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`badge ${getRoleBadgeClass(role)}`}>
                          {role}
                        </span>
                      </div>
                      <p className="text-sm text-text-secondary mt-1">
                        {getRoleDescription(role)}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          </div>

          {/* Permission Warning */}
          {!canChangeRole() && (
            <div className="bg-warning-50 dark:bg-warning-900/20 border border-warning-200 dark:border-warning-800 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-warning-600 dark:text-warning-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
                <div>
                  <p className="text-sm font-medium text-warning-800 dark:text-warning-400">Insufficient Permissions</p>
                  <p className="text-sm text-warning-700 dark:text-warning-500 mt-1">
                    You don't have permission to change this role. {selectedScope === 'global' ? 'Only administrators can change global roles.' : 'You can only manage roles for applications you manage.'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 rounded-lg p-4">
              <div className="flex">
                <svg className="w-5 h-5 text-error-600 dark:text-error-500 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                <p className="text-sm text-error-800 dark:text-error-400">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {success && (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="w-5 h-5 text-green-600 dark:text-green-400 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <p className="text-sm font-medium text-green-800 dark:text-green-200">{success}</p>
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-border flex justify-end space-x-3">
          <button
            onClick={onClose}
            disabled={loading}
            className="btn btn-secondary"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              console.log('💾 Save button clicked:', {
                loading,
                canChangeRole: canChangeRole(),
                selectedRole,
                userSystemRole: user?.systemRole,
                selectedScope,
                isDisabled: loading || !canChangeRole()
              });
              handleSave();
            }}
            disabled={loading || !canChangeRole()}
            className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Updating...' : 'Update Role'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleAssignmentModal;
