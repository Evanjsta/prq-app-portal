import React, { useState, useEffect } from 'react';
import authService from '../services/authService';
import toast from 'react-hot-toast';

function UserModal({ isOpen, onClose, onUserSaved, user = null }) {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    displayName: '',
    email: '',
    googleId: '',
    hubspotUserId: '',
    isActive: true
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const isEditMode = !!user;

  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        displayName: user.displayName || '',
        email: user.email || '',
        googleId: user.googleId || '',
        hubspotUserId: user.hubspotUserId || '',
        isActive: user.status === 'active' || user.isActive === true
      });
    } else {
      // Reset form for new user
      setFormData({
        firstName: '',
        lastName: '',
        displayName: '',
        email: '',
        googleId: '',
        hubspotUserId: '',
        isActive: true
      });
    }
    setErrors({});
  }, [user, isOpen]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.displayName.trim()) {
      newErrors.displayName = 'Display name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }

    // Google ID is optional - will be populated on first login
    // No validation needed

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      let response;
      const submitData = {
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        displayName: formData.displayName.trim(),
        email: formData.email.trim(),
        hubspotUserId: formData.hubspotUserId.trim() || null,
        isActive: formData.isActive
      };

      if (isEditMode) {
        response = await authService.updateUser(user.id, submitData);
        toast.success('User updated successfully');
      } else {
        // Include googleId only if provided (optional)
        if (formData.googleId.trim()) {
          submitData.googleId = formData.googleId.trim();
        }
        response = await authService.createUser(submitData);
        toast.success('User created successfully. Google ID will be assigned on first login.');
      }

      onUserSaved(response.data.user);
      onClose();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error(error.message || 'Failed to save user');
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (!loading) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 dark:bg-black/70 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border border-border w-full max-w-md shadow-lg rounded-md card">
        <div className="mt-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-medium text-text-primary">
              {isEditMode ? 'Edit User' : 'Add New User'}
            </h3>
            <button
              onClick={handleClose}
              disabled={loading}
              className="text-text-tertiary hover:text-text-secondary disabled:opacity-50"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* First Name */}
            <div>
              <label htmlFor="firstName" className="block text-sm font-medium text-text-primary">
                First Name *
              </label>
              <input
                type="text"
                id="firstName"
                name="firstName"
                value={formData.firstName}
                onChange={handleInputChange}
                className={`input ${errors.firstName ? 'border-error-500' : ''}`}
                disabled={loading}
              />
              {errors.firstName && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.firstName}</p>
              )}
            </div>

            {/* Last Name */}
            <div>
              <label htmlFor="lastName" className="block text-sm font-medium text-text-primary">
                Last Name *
              </label>
              <input
                type="text"
                id="lastName"
                name="lastName"
                value={formData.lastName}
                onChange={handleInputChange}
                className={`input ${errors.lastName ? 'border-error-500' : ''}`}
                disabled={loading}
              />
              {errors.lastName && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.lastName}</p>
              )}
            </div>

            {/* Display Name */}
            <div>
              <label htmlFor="displayName" className="block text-sm font-medium text-text-primary">
                Display Name *
              </label>
              <input
                type="text"
                id="displayName"
                name="displayName"
                value={formData.displayName}
                onChange={handleInputChange}
                className={`input ${errors.displayName ? 'border-error-500' : ''}`}
                disabled={loading}
              />
              {errors.displayName && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.displayName}</p>
              )}
            </div>

            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-text-primary">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className={`input ${errors.email ? 'border-error-500' : ''}`}
                disabled={loading}
              />
              {errors.email && (
                <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.email}</p>
              )}
            </div>

            {/* Google ID - only for new users */}
            {!isEditMode && (
              <div>
                <label htmlFor="googleId" className="block text-sm font-medium text-text-primary">
                  Google ID <span className="text-text-tertiary">(Optional)</span>
                </label>
                <input
                  type="text"
                  id="googleId"
                  name="googleId"
                  value={formData.googleId}
                  onChange={handleInputChange}
                  className={`input ${errors.googleId ? 'border-error-500' : ''}`}
                  disabled={loading}
                  placeholder="e.g., 112233445566778899"
                />
                {errors.googleId && (
                  <p className="mt-1 text-sm text-error-600 dark:text-error-400">{errors.googleId}</p>
                )}
                <p className="mt-1 text-xs text-text-tertiary">
                  Leave blank - will be automatically populated when the user logs in with Google for the first time.
                </p>
              </div>
            )}

            {/* HubSpot User ID */}
            <div>
              <label htmlFor="hubspotUserId" className="block text-sm font-medium text-text-primary">
                HubSpot User ID
              </label>
              <input
                type="text"
                id="hubspotUserId"
                name="hubspotUserId"
                value={formData.hubspotUserId}
                onChange={handleInputChange}
                className="input"
                disabled={loading}
                placeholder="Optional"
              />
              <p className="mt-1 text-xs text-text-tertiary">
                Optional: Link to HubSpot contact record
              </p>
            </div>

            {/* Active Status */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="isActive"
                name="isActive"
                checked={formData.isActive}
                onChange={handleInputChange}
                className="h-4 w-4 text-primary-600 focus:ring-primary-500 border-border rounded"
                disabled={loading}
              />
              <label htmlFor="isActive" className="ml-2 block text-sm text-text-primary">
                Active user
              </label>
            </div>

            {/* Form Actions */}
            <div className="flex justify-end space-x-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="btn btn-secondary"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEditMode ? 'Updating...' : 'Creating...'}
                  </div>
                ) : (
                  isEditMode ? 'Update User' : 'Create User'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default UserModal;