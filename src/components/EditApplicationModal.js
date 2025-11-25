import React, { useState, useEffect } from 'react';
import authService from '../services/authService';

function EditApplicationModal({ application, isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    name: '',
    display_name: '',
    description: '',
    url: '',
    api_key: '',
    allowed_origins: [],
    callback_urls: [],
    environments: {
      localhost: { url: 'http://localhost:3000', enabled: true },
      development: { url: '', enabled: false },
      staging: { url: '', enabled: false },
      production: { url: '', enabled: false }
    },
    is_active: true,
    auto_assign_rules: {
      enabled: false,
      domain: '@prqexteriors.com',
      default_role: 'basic_user',
      requires_approval: true,
      auto_approve_roles: []
    }
  });

  const [newRole, setNewRole] = useState('');
  const [newOrigin, setNewOrigin] = useState('');
  const [newCallback, setNewCallback] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (application && isOpen) {
      console.log('📂 Loading application into modal:', application);

      // Handle both snake_case and camelCase from API
      const autoRules = typeof application.autoAssignRules === 'string'
        ? JSON.parse(application.autoAssignRules)
        : (application.autoAssignRules || application.auto_assign_rules || {});

      const settings = typeof application.settings === 'string'
        ? JSON.parse(application.settings)
        : application.settings || {};

      console.log('🔧 Parsed settings:', settings);

      setFormData({
        name: application.name || '',
        display_name: application.displayName || application.display_name || application.name || '',
        description: application.description || '',
        url: application.url || '',
        api_key: settings.api_key || '',
        allowed_origins: application.allowedOrigins || application.allowed_origins || [],
        callback_urls: application.callbackUrls || application.callback_urls || [],
        environments: settings.environments || {
          localhost: { url: 'http://localhost:3000', enabled: true },
          development: { url: '', enabled: false },
          staging: { url: '', enabled: false },
          production: { url: '', enabled: false }
        },
        is_active: (application.isActive !== undefined ? application.isActive : application.is_active) !== false,
        auto_assign_rules: {
          enabled: autoRules.enabled || false,
          domain: autoRules.domain || '@prqexteriors.com',
          default_role: autoRules.default_role || 'basic_user',
          requires_approval: autoRules.requires_approval !== false,
          auto_approve_roles: autoRules.auto_approve_roles || []
        }
      });
    }
  }, [application, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleAutoRuleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      auto_assign_rules: {
        ...prev.auto_assign_rules,
        [field]: value
      }
    }));
  };

  const addRole = () => {
    if (newRole.trim() && !formData.auto_assign_rules.auto_approve_roles.includes(newRole.trim())) {
      handleAutoRuleChange('auto_approve_roles', [
        ...formData.auto_assign_rules.auto_approve_roles,
        newRole.trim()
      ]);
      setNewRole('');
    }
  };

  const removeRole = (roleToRemove) => {
    handleAutoRuleChange(
      'auto_approve_roles',
      formData.auto_assign_rules.auto_approve_roles.filter(r => r !== roleToRemove)
    );
  };

  const addOrigin = () => {
    if (newOrigin.trim() && !formData.allowed_origins.includes(newOrigin.trim())) {
      setFormData(prev => ({
        ...prev,
        allowed_origins: [...prev.allowed_origins, newOrigin.trim()]
      }));
      setNewOrigin('');
    }
  };

  const removeOrigin = (originToRemove) => {
    setFormData(prev => ({
      ...prev,
      allowed_origins: prev.allowed_origins.filter(o => o !== originToRemove)
    }));
  };

  const addCallback = () => {
    if (newCallback.trim() && !formData.callback_urls.includes(newCallback.trim())) {
      setFormData(prev => ({
        ...prev,
        callback_urls: [...prev.callback_urls, newCallback.trim()]
      }));
      setNewCallback('');
    }
  };

  const removeCallback = (callbackToRemove) => {
    setFormData(prev => ({
      ...prev,
      callback_urls: prev.callback_urls.filter(c => c !== callbackToRemove)
    }));
  };

  const handleEnvironmentChange = (env, field, value) => {
    setFormData(prev => ({
      ...prev,
      environments: {
        ...prev.environments,
        [env]: {
          ...prev.environments[env],
          [field]: value
        }
      }
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError(null);

    try {
      // Prepare the update payload (don't send 'name' as it's not updatable)
      const updateData = {
        display_name: formData.display_name,
        description: formData.description,
        url: formData.url,
        is_active: formData.is_active,
        allowed_origins: formData.allowed_origins,
        callback_urls: formData.callback_urls,
        settings: {
          api_key: formData.api_key,
          environments: formData.environments
        },
        auto_assign_rules: formData.auto_assign_rules
      };

      console.log('🚀 Sending to backend:', { applicationId: application.id, updateData });

      const response = await authService.updateApplication(application.id, updateData);

      console.log('📥 Received from backend:', response);

      if (response.success) {
        await onSave(); // Wait for parent to refresh
        onClose();
      } else {
        throw new Error(response.message || 'Update failed');
      }
    } catch (err) {
      console.error('Update error:', err);
      setError(err.message || 'Failed to update application');
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border border-border w-full max-w-2xl shadow-lg rounded-md bg-surface-elevated">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-text-primary">
            Edit Application: {application?.display_name || application?.name}
          </h3>
          <button
            onClick={onClose}
            className="text-text-tertiary hover:text-text-secondary transition-colors"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-error-50 dark:bg-error-900/20 border border-error-200 dark:border-error-800 text-error-700 dark:text-error-400 px-4 py-3 rounded">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Info */}
          <div>
            <h4 className="text-sm font-medium text-text-primary mb-3">Basic Information</h4>
            <div className="space-y-4">
              <div>
                <label className="label">Display Name</label>
                <input
                  type="text"
                  name="display_name"
                  value={formData.display_name}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="label">Description</label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows="2"
                  className="input"
                />
              </div>

              <div>
                <label className="label">Global API Key (Fallback)</label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    name="api_key"
                    value={formData.api_key}
                    readOnly
                    placeholder="No global key (will use environment-specific keys)"
                    className="input font-mono text-sm flex-1 bg-surface"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const newKey = `sk_global_${application.name}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
                      setFormData(prev => ({ ...prev, api_key: newKey }));
                    }}
                    className="btn btn-secondary btn-md whitespace-nowrap"
                  >
                    {formData.api_key ? 'Reset' : 'Generate'}
                  </button>
                </div>
                <p className="mt-1 text-xs text-text-secondary">
                  Optional: Used as fallback if environment-specific key is not set. Add to Vercel environment variables as <code className="bg-surface px-1 py-0.5 rounded">CENTRALIZED_AUTH_API_KEY</code>
                </p>
                <div className="mt-2 bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded p-2">
                  <p className="text-xs text-primary-700 dark:text-primary-300">
                    <strong>Key Priority:</strong> Environment key → Global key → Reject
                  </p>
                </div>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  name="is_active"
                  checked={formData.is_active}
                  onChange={handleChange}
                  className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded"
                />
                <label className="ml-2 block text-sm text-text-primary">
                  Application is active
                </label>
              </div>
            </div>
          </div>

          {/* Environment URLs */}
          <div className="border-t border-border pt-6">
            <h4 className="text-sm font-medium text-text-primary mb-3">Environment Configuration</h4>
            <p className="text-xs text-text-secondary mb-4">Configure URLs and API keys for different deployment environments</p>
            <div className="space-y-4">
              {['localhost', 'development', 'staging', 'production'].map((env) => (
                <div key={env} className="border border-border rounded-lg p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <input
                      type="checkbox"
                      checked={formData.environments[env]?.enabled}
                      onChange={(e) => handleEnvironmentChange(env, 'enabled', e.target.checked)}
                      className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded"
                    />
                    <label className="text-sm font-medium text-text-primary capitalize">{env}</label>
                    {formData.environments[env]?.enabled && (
                      <span className="ml-auto badge badge-success text-xs">Active</span>
                    )}
                  </div>

                  {formData.environments[env]?.enabled && (
                    <div className="space-y-3 ml-7">
                      <div>
                        <label className="label text-xs">Environment URL</label>
                        <input
                          type="text"
                          value={formData.environments[env]?.url || ''}
                          onChange={(e) => handleEnvironmentChange(env, 'url', e.target.value)}
                          placeholder={env === 'localhost' ? 'http://localhost:3000' : `https://${env === 'production' ? 'app' : env}.myapp.com`}
                          className="input text-sm"
                        />
                      </div>

                      <div>
                        <label className="label text-xs">Environment API Key</label>
                        <div className="flex gap-2">
                          <input
                            type="text"
                            value={formData.environments[env]?.api_key || ''}
                            readOnly
                            placeholder="No key generated"
                            className="input font-mono text-xs flex-1 bg-surface"
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const newKey = `sk_${env}_${application.name}_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
                              handleEnvironmentChange(env, 'api_key', newKey);
                            }}
                            className="btn btn-secondary btn-sm text-xs"
                          >
                            {formData.environments[env]?.api_key ? 'Reset' : 'Generate'}
                          </button>
                        </div>
                        <p className="mt-1 text-xs text-text-secondary">
                          {env === 'localhost' ? (
                            <>Add to <code className="bg-surface px-1 py-0.5 rounded">.env.local</code> file as <code className="bg-surface px-1 py-0.5 rounded">CENTRALIZED_AUTH_API_KEY</code></>
                          ) : (
                            <>Add to Vercel environment variables as <code className="bg-surface px-1 py-0.5 rounded">CENTRALIZED_AUTH_API_KEY</code></>
                          )}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* OAuth Configuration */}
          <div className="border-t border-border pt-6">
            <h4 className="text-sm font-medium text-text-primary mb-3">OAuth Configuration</h4>
            <p className="text-xs text-text-secondary mb-4">Configure allowed origins and callback URLs for OAuth authentication</p>

            <div className="space-y-6">
              {/* Allowed Origins */}
              <div>
                <label className="label">Allowed Origins (CORS)</label>
                <p className="text-xs text-text-secondary mb-2">
                  Domains allowed to make authentication requests to this application
                </p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newOrigin}
                    onChange={(e) => setNewOrigin(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addOrigin())}
                    placeholder="https://app.prqexteriors.com"
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={addOrigin}
                    className="btn btn-secondary btn-md whitespace-nowrap"
                  >
                    Add Origin
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.allowed_origins.map((origin, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-surface px-3 py-2 rounded border border-border"
                    >
                      <span className="text-sm font-mono text-text-primary">{origin}</span>
                      <button
                        type="button"
                        onClick={() => removeOrigin(origin)}
                        className="text-error-600 hover:text-error-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {formData.allowed_origins.length === 0 && (
                    <p className="text-sm text-text-secondary">No origins configured</p>
                  )}
                </div>
              </div>

              {/* Callback URLs */}
              <div>
                <label className="label">OAuth Callback URLs</label>
                <p className="text-xs text-text-secondary mb-2">
                  Valid redirect URIs after OAuth authentication completes
                </p>
                <div className="flex gap-2 mb-2">
                  <input
                    type="text"
                    value={newCallback}
                    onChange={(e) => setNewCallback(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addCallback())}
                    placeholder="https://app.prqexteriors.com/auth/callback"
                    className="input flex-1"
                  />
                  <button
                    type="button"
                    onClick={addCallback}
                    className="btn btn-secondary btn-md whitespace-nowrap"
                  >
                    Add Callback
                  </button>
                </div>
                <div className="space-y-2">
                  {formData.callback_urls.map((callback, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between bg-surface px-3 py-2 rounded border border-border"
                    >
                      <span className="text-sm font-mono text-text-primary">{callback}</span>
                      <button
                        type="button"
                        onClick={() => removeCallback(callback)}
                        className="text-error-600 hover:text-error-700 text-sm font-medium"
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                  {formData.callback_urls.length === 0 && (
                    <p className="text-sm text-text-secondary">No callbacks configured</p>
                  )}
                </div>
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded p-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  <strong>Note:</strong> Make sure to add your Vercel preview deployment URLs (e.g., <code className="bg-surface-elevated px-1 py-0.5 rounded">https://your-app-git-branch-username.vercel.app</code>) to both allowed origins and callback URLs for OAuth to work in preview environments.
                </p>
              </div>
            </div>
          </div>

          {/* Auto-Assignment Rules */}
          <div className="border-t border-border pt-6">
            <h4 className="text-sm font-medium text-text-primary mb-3">Auto-Assignment Rules</h4>

            <div className="space-y-4">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.auto_assign_rules.enabled}
                  onChange={(e) => handleAutoRuleChange('enabled', e.target.checked)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border rounded"
                />
                <label className="ml-2 block text-sm text-text-primary">
                  Enable auto-assignment for this application
                </label>
              </div>

              {formData.auto_assign_rules.enabled && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-text-primary">Email Domain</label>
                    <input
                      type="text"
                      value={formData.auto_assign_rules.domain}
                      onChange={(e) => handleAutoRuleChange('domain', e.target.value)}
                      placeholder="@prqexteriors.com"
                      className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                    <p className="mt-1 text-xs text-text-secondary">Only users with this email domain can request access</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-text-primary">Default Role</label>
                    <select
                      value={formData.auto_assign_rules.default_role}
                      onChange={(e) => handleAutoRuleChange('default_role', e.target.value)}
                      className="mt-1 block w-full border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="basic_user">Basic User</option>
                      <option value="viewer">Viewer</option>
                      <option value="editor">Editor</option>
                      <option value="admin">Admin</option>
                    </select>
                    <p className="mt-1 text-xs text-text-secondary">Role assigned to new users</p>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.auto_assign_rules.requires_approval}
                      onChange={(e) => handleAutoRuleChange('requires_approval', e.target.checked)}
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-border rounded"
                    />
                    <label className="ml-2 block text-sm text-text-primary">
                      Requires admin approval (unless auto-approved by role)
                    </label>
                  </div>

                  {formData.auto_assign_rules.requires_approval && (
                    <div>
                      <label className="block text-sm font-medium text-text-primary mb-2">
                        Auto-Approve Roles (HubSpot)
                      </label>
                      <p className="text-xs text-text-secondary mb-2">
                        Users with these HubSpot roles will be auto-approved without admin review
                      </p>

                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={newRole}
                          onChange={(e) => setNewRole(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addRole())}
                          placeholder="e.g., Sales Rep, Manager, Admin"
                          className="flex-1 border border-border rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        />
                        <button
                          type="button"
                          onClick={addRole}
                          className="btn btn-primary btn-sm"
                        >
                          Add
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        {formData.auto_assign_rules.auto_approve_roles.map((role, index) => (
                          <span
                            key={index}
                            className="badge badge-primary"
                          >
                            {role}
                            <button
                              type="button"
                              onClick={() => removeRole(role)}
                              className="ml-2 hover:opacity-75"
                            >
                              ×
                            </button>
                          </span>
                        ))}
                        {formData.auto_assign_rules.auto_approve_roles.length === 0 && (
                          <span className="text-sm text-text-secondary">No auto-approve roles configured</span>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="bg-primary-50 dark:bg-primary-900/20 border border-primary-200 dark:border-primary-800 rounded-md p-3">
                    <h5 className="text-sm font-medium text-primary-900 dark:text-primary-200 mb-1">Current Configuration:</h5>
                    <ul className="text-xs text-primary-700 dark:text-primary-300 space-y-1">
                      {!formData.auto_assign_rules.requires_approval ? (
                        <li>✅ All {formData.auto_assign_rules.domain} users will be auto-approved as {formData.auto_assign_rules.default_role}</li>
                      ) : formData.auto_assign_rules.auto_approve_roles.length > 0 ? (
                        <>
                          <li>✅ Users with roles: {formData.auto_assign_rules.auto_approve_roles.join(', ')} will be auto-approved</li>
                          <li>⏳ Other users will require admin approval</li>
                        </>
                      ) : (
                        <li>⏳ All users will require admin approval</li>
                      )}
                    </ul>
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-end space-x-3 pt-4 border-t border-border">
            <button
              type="button"
              onClick={onClose}
              className="btn btn-secondary btn-md"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving}
              className="btn btn-primary btn-md"
            >
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditApplicationModal;
