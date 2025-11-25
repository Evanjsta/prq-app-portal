import React, { useState, useEffect } from 'react';
import { useUser } from '@clerk/clerk-react';
import authService from '../services/authService';
import UserModal from '../components/UserModal';
import RoleAssignmentModal from '../components/RoleAssignmentModal';
import ProfileEditModal from '../components/ProfileEditModal';
import toast from 'react-hot-toast';

function UsersPage() {
  const { user: clerkUser } = useUser();
  // Map Clerk user to expected format for components
  const currentUser = clerkUser ? {
    id: clerkUser.id,
    name: clerkUser.fullName,
    email: clerkUser.primaryEmailAddress?.emailAddress,
    profilePicture: clerkUser.imageUrl,
  } : null;
  const [users, setUsers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [usersResponse, appsResponse] = await Promise.all([
          authService.getUsers({
            search: searchTerm,
            status: 'all',
            limit: 50
          }),
          authService.getApplications()
        ]);

        if (usersResponse.success) {
          setUsers(usersResponse.data.users);
        } else {
          throw new Error(usersResponse.message || 'Failed to fetch users');
        }

        if (appsResponse.success) {
          console.log('📦 Applications fetched:', appsResponse.data);
          setApplications(appsResponse.data);
        } else {
          console.log('❌ Failed to fetch applications:', appsResponse);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error('Failed to load data: ' + error.message);
        setUsers([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [searchTerm]);

  // Modal handlers
  const handleAddUser = () => {
    setSelectedUser(null);
    setIsModalOpen(true);
  };

  const handleEditUser = (user) => {
    setSelectedUser(user);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setSelectedUser(null);
  };

  const handleUserSaved = (savedUser) => {
    if (selectedUser) {
      // Update existing user
      setUsers(prev => prev.map(user =>
        user.id === savedUser.id ? savedUser : user
      ));
    } else {
      // Add new user
      setUsers(prev => [savedUser, ...prev]);
    }
  };

  const handleManageRole = (user) => {
    setSelectedUser(user);
    setIsRoleModalOpen(true);
  };

  const handleRoleUpdated = async () => {
    // Refresh users list after role update
    try {
      const response = await authService.getUsers({
        search: searchTerm,
        status: 'all',
        limit: 50
      });
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  };

  const handleEditProfile = (user) => {
    setSelectedUser(user);
    setIsProfileModalOpen(true);
  };

  const handleProfileUpdated = async () => {
    // Refresh users list after profile update
    try {
      const response = await authService.getUsers({
        search: searchTerm,
        status: 'all',
        limit: 50
      });
      if (response.success) {
        setUsers(response.data.users);
      }
    } catch (error) {
      console.error('Error refreshing users:', error);
    }
  };

  // Filter users by role
  const filteredUsers = roleFilter === 'all'
    ? users
    : users.filter(user => user.systemRole === roleFilter);

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'badge-success';
      case 'inactive': return 'badge-neutral';
      case 'suspended': return 'badge-error';
      default: return 'badge-neutral';
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'administrator':
        return 'badge-error';
      case 'app_manager':
        return 'badge-primary';
      case 'user':
      default:
        return 'badge-neutral';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Never';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
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
      {/* Header */}
      <div className="md:flex md:items-center md:justify-between">
        <div className="flex-1 min-w-0">
          <h2 className="text-2xl font-bold leading-7 text-text-primary sm:text-3xl sm:truncate">
            Users
          </h2>
          <p className="mt-1 text-sm text-text-secondary">
            Manage users across all business applications
          </p>
        </div>
        <div className="mt-4 flex md:mt-0 md:ml-4">
          <button
            type="button"
            onClick={handleAddUser}
            className="btn btn-primary btn-md"
          >
            Add User
          </button>
        </div>
      </div>

      {/* Search and Filters */}
      <div className="card">
        <div className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <label htmlFor="search" className="sr-only">Search users</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="h-5 w-5 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  id="search"
                  name="search"
                  className="input pl-10"
                  placeholder="Search users by name or email..."
                  type="search"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
            <div className="flex space-x-3">
              <select
                value={roleFilter}
                onChange={(e) => setRoleFilter(e.target.value)}
                className="input"
              >
                <option value="all">All Roles</option>
                <option value="user">User</option>
                <option value="app_manager">App Manager</option>
                <option value="administrator">Administrator</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card overflow-hidden">
        <ul className="divide-y divide-border">
          {filteredUsers.length > 0 ? (
            filteredUsers.map((user) => (
              <li key={user.id}>
                <div className="px-4 py-4 flex items-center justify-between hover:bg-surface transition-colors">
                  <div className="flex items-center">
                    <div className="flex-shrink-0 h-10 w-10">
                      <img
                        className="h-10 w-10 rounded-full ring-2 ring-border"
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user.name)}&background=3b82f6&color=ffffff`}
                        alt={user.name}
                      />
                    </div>
                    <div className="ml-4">
                      <div className="flex items-center space-x-2">
                        <div className="text-sm font-medium text-text-primary">{user.name}</div>
                        <span className={`badge ${getRoleBadgeClass(user.systemRole)}`}>
                          {user.systemRole || 'user'}
                        </span>
                        {user.hubspotUserId && (
                          <span className="badge bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400">
                            HubSpot
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-text-secondary">{user.email}</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="text-right">
                      <div className="text-sm text-text-primary">
                        Last login: {formatDate(user.lastLogin)}
                      </div>
                      <div className="text-sm text-text-secondary">
                        Joined: {formatDate(user.createdAt)}
                      </div>
                    </div>
                    <div className={`badge ${getStatusColor(user.status)}`}>
                      {user.status}
                    </div>
                    <div className="flex-shrink-0 flex space-x-2">
                      <button
                        onClick={() => handleManageRole(user)}
                        className="text-primary-600 hover:text-primary-700 dark:text-primary-400 dark:hover:text-primary-300 p-1 rounded hover:bg-primary-50 dark:hover:bg-primary-900/20 transition-colors"
                        title="Manage role"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEditProfile(user)}
                        className="text-green-600 hover:text-green-700 dark:text-green-400 dark:hover:text-green-300 p-1 rounded hover:bg-green-50 dark:hover:bg-green-900/20 transition-colors"
                        title="Edit profile"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => handleEditUser(user)}
                        className="text-text-tertiary hover:text-text-secondary p-1 rounded hover:bg-surface transition-colors"
                        title="Edit user"
                      >
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                </div>
              </li>
            ))
          ) : (
            <li className="px-4 py-8 text-center text-text-secondary">
              {searchTerm ? 'No users found matching your search.' : 'No users found.'}
            </li>
          )}
        </ul>
      </div>

      {/* Stats */}
      <div className="card">
        <div className="p-6">
          <h3 className="text-lg leading-6 font-medium text-text-primary mb-4">
            User Statistics
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-text-primary">{users.length}</div>
              <div className="text-sm text-text-secondary">Total Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-success-600 dark:text-success-500">
                {users.filter(u => u.status === 'active').length}
              </div>
              <div className="text-sm text-text-secondary">Active Users</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-error-600 dark:text-error-500">
                {users.filter(u => u.systemRole === 'administrator').length}
              </div>
              <div className="text-sm text-text-secondary">Administrators</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary-600 dark:text-primary-400">
                {users.filter(u => u.systemRole === 'app_manager').length}
              </div>
              <div className="text-sm text-text-secondary">App Managers</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {users.filter(u => u.hubspotUserId).length}
              </div>
              <div className="text-sm text-text-secondary">HubSpot Linked</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-warning-600 dark:text-warning-500">
                {users.filter(u => new Date(u.lastLogin) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
              </div>
              <div className="text-sm text-text-secondary">Active This Week</div>
            </div>
          </div>
        </div>
      </div>

      {/* User Modal */}
      <UserModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        onUserSaved={handleUserSaved}
        user={selectedUser}
      />

      {/* Profile Edit Modal */}
      <ProfileEditModal
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        user={selectedUser}
        currentUser={currentUser}
        onProfileUpdated={handleProfileUpdated}
      />

      {/* Role Assignment Modal */}
      <RoleAssignmentModal
        isOpen={isRoleModalOpen}
        onClose={() => {
          console.log('🚪 Closing role modal');
          setIsRoleModalOpen(false);
        }}
        user={selectedUser}
        currentUser={currentUser}
        applications={applications}
        onRoleUpdated={handleRoleUpdated}
      />
      {isRoleModalOpen && console.log('🎭 Role modal open with applications:', applications)}
    </div>
  );
}

export default UsersPage;