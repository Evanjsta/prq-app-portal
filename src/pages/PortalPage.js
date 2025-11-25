import React from 'react';
import { useUser, UserButton } from '@clerk/clerk-react';

// PRQ business applications - these would ideally come from a config or API
const applications = [
  {
    id: 'prq-prezy',
    name: 'PRQ Prezy',
    description: 'Sales presentation tool',
    url: 'https://prezy.prqexteriors.com',
    icon: '🎯',
    color: 'bg-blue-500',
  },
  {
    id: 'commission-calculator',
    name: 'Commission Calculator',
    description: 'Calculate sales commissions',
    url: 'https://commission.prqexteriors.com',
    icon: '💰',
    color: 'bg-green-500',
  },
  {
    id: 'permit-data-manager',
    name: 'Permit Data Manager',
    description: 'Manage permit information',
    url: 'https://permits.prqexteriors.com',
    icon: '📋',
    color: 'bg-purple-500',
  },
  {
    id: 'hubspot-data-manager',
    name: 'HubSpot Data Manager',
    description: 'Sync and manage HubSpot data',
    url: 'https://datahub.prqexteriors.com',
    icon: '🔄',
    color: 'bg-orange-500',
  },
];

function PortalPage() {
  const { user } = useUser();

  const handleAppClick = (app) => {
    // Open app in new tab
    window.open(app.url, '_blank');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Welcome, {user?.firstName || 'Employee'}!
              </h1>
              <p className="mt-1 text-sm text-gray-500">
                Select an application to get started
              </p>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm font-medium text-gray-900">{user?.fullName}</p>
                <p className="text-xs text-gray-500">{user?.primaryEmailAddress?.emailAddress}</p>
              </div>
              <UserButton afterSignOutUrl="/login" />
            </div>
          </div>
        </div>
      </div>

      {/* App Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {applications.map((app) => (
            <button
              key={app.id}
              onClick={() => handleAppClick(app)}
              className="group relative bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-lg hover:border-blue-300 transition-all duration-200 text-left"
            >
              {/* App Icon */}
              <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${app.color} text-white text-2xl mb-4`}>
                {app.icon}
              </div>

              {/* App Info */}
              <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors">
                {app.name}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {app.description}
              </p>

              {/* Launch indicator */}
              <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>
            </button>
          ))}
        </div>

        {/* Help Section */}
        <div className="mt-12 text-center">
          <p className="text-sm text-gray-500">
            Need access to an application? Contact your administrator.
          </p>
        </div>
      </div>
    </div>
  );
}

export default PortalPage;
