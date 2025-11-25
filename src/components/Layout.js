import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useUser, UserButton } from '@clerk/clerk-react';
import { useTheme } from '../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
  HiHome,
  HiUsers,
  HiViewGrid,
  HiShieldCheck,
  HiMenu,
  HiX,
  HiSearch,
  HiMoon,
  HiSun,
  HiBell,
  HiChevronRight
} from 'react-icons/hi';

function Layout({ children }) {
  const location = useLocation();
  const { user: clerkUser } = useUser();
  const { theme, toggleTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  // Map Clerk user to expected format
  const user = clerkUser ? {
    name: clerkUser.fullName,
    email: clerkUser.primaryEmailAddress?.emailAddress,
    profilePicture: clerkUser.imageUrl,
  } : null;

  const navigation = [
    {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HiHome,
      description: 'System overview and metrics',
      badge: null
    },
    {
      name: 'Users',
      href: '/users',
      icon: HiUsers,
      description: 'Manage users across all apps',
      badge: null
    },
    {
      name: 'Applications',
      href: '/applications',
      icon: HiViewGrid,
      description: 'Business app management',
      badge: '5'
    },
    {
      name: 'Roles',
      href: '/roles',
      icon: HiShieldCheck,
      description: 'Role-based access control',
      badge: null
    },
  ];

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs = [{ name: 'Home', href: '/' }];

    let currentPath = '';
    pathSegments.forEach(segment => {
      currentPath += `/${segment}`;
      breadcrumbs.push({
        name: segment.charAt(0).toUpperCase() + segment.slice(1),
        href: currentPath
      });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="min-h-screen bg-background">
      {/* Mobile Sidebar Overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="fixed inset-0 bg-neutral-900/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.aside
              initial={{ x: -280 }}
              animate={{ x: 0 }}
              exit={{ x: -280 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed inset-y-0 left-0 z-50 w-64 bg-surface-elevated border-r border-border lg:hidden"
            >
              <SidebarContent
                navigation={navigation}
                location={location}
                user={user}
                onClose={() => setSidebarOpen(false)}
              />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:fixed lg:inset-y-0 lg:flex lg:w-64 lg:flex-col z-30">
        <div className="flex grow flex-col gap-y-5 overflow-y-auto bg-surface-elevated border-r border-border scrollbar-thin">
          <SidebarContent navigation={navigation} location={location} user={user} />
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="lg:pl-64">
        {/* Top Bar */}
        <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-x-4 border-b border-border bg-surface-elevated/95 backdrop-blur-light px-4 sm:gap-x-6 sm:px-6 lg:px-8">
          {/* Mobile Menu Button */}
          <button
            type="button"
            className="lg:hidden -m-2.5 p-2.5 text-text-secondary hover:text-text-primary transition-colors"
            onClick={() => setSidebarOpen(true)}
          >
            <HiMenu className="h-6 w-6" />
          </button>

          {/* Breadcrumbs */}
          <nav className="flex flex-1 items-center gap-x-2 text-sm">
            {breadcrumbs.map((crumb, index) => (
              <React.Fragment key={crumb.href}>
                {index > 0 && (
                  <HiChevronRight className="h-4 w-4 text-text-tertiary" />
                )}
                {index === breadcrumbs.length - 1 ? (
                  <span className="font-medium text-text-primary">
                    {crumb.name}
                  </span>
                ) : (
                  <Link
                    to={crumb.href}
                    className="text-text-secondary hover:text-text-primary transition-colors"
                  >
                    {crumb.name}
                  </Link>
                )}
              </React.Fragment>
            ))}
          </nav>

          {/* Right Side Actions */}
          <div className="flex items-center gap-x-3">
            {/* Search Button */}
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={() => setSearchOpen(!searchOpen)}
            >
              <HiSearch className="h-5 w-5" />
              <span className="hidden sm:inline ml-2">Search</span>
              <kbd className="hidden sm:inline ml-2 px-2 py-0.5 text-xs bg-surface border border-border rounded">
                ⌘K
              </kbd>
            </button>

            {/* Notifications */}
            <button type="button" className="btn btn-ghost btn-sm relative">
              <HiBell className="h-5 w-5" />
              <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-error-500 ring-2 ring-surface-elevated"></span>
            </button>

            {/* Theme Toggle */}
            <button
              type="button"
              onClick={toggleTheme}
              className="btn btn-ghost btn-sm"
              title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
            >
              {theme === 'light' ? (
                <HiMoon className="h-5 w-5" />
              ) : (
                <HiSun className="h-5 w-5" />
              )}
            </button>

            {/* User Menu - Clerk UserButton */}
            <UserButton
              afterSignOutUrl="/login"
              appearance={{
                elements: {
                  avatarBox: "h-8 w-8 ring-2 ring-border",
                }
              }}
            />
          </div>
        </header>

        {/* Main Content */}
        <main className="py-6 px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
}

// Sidebar Content Component
function SidebarContent({ navigation, location, user, onClose }) {
  return (
    <div className="flex flex-col h-full">
      {/* Logo / Branding */}
      <div className="flex h-16 shrink-0 items-center gap-x-3 px-6 border-b border-border">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-primary-600 to-primary-500 shadow-md">
          <HiShieldCheck className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-base font-semibold text-text-primary">
            Auth Admin
          </h1>
          <p className="text-xs text-text-tertiary">
            Centralized System
          </p>
        </div>
        {onClose && (
          <button
            onClick={onClose}
            className="ml-auto lg:hidden btn btn-ghost btn-sm"
          >
            <HiX className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-1">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <li key={item.name}>
                <Link
                  to={item.href}
                  onClick={onClose}
                  title={item.description}
                  className={`
                    group flex items-center gap-x-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200
                    ${
                      isActive
                        ? 'bg-primary-500/10 text-primary-600 dark:text-primary-400'
                        : 'text-text-secondary hover:text-text-primary hover:bg-surface'
                    }
                  `}
                >
                  <Icon
                    className={`h-5 w-5 shrink-0 transition-transform duration-200 group-hover:scale-110 ${
                      isActive ? 'text-primary-600 dark:text-primary-400' : 'text-text-tertiary'
                    }`}
                  />
                  <span className="flex-1">{item.name}</span>
                  {item.badge && (
                    <span className="badge badge-neutral text-xs">
                      {item.badge}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* User Info Footer */}
      <div className="sticky bottom-0 border-t border-border bg-surface-elevated/95 backdrop-blur-light p-4">
        <div className="flex items-center gap-x-3">
          <img
            className="h-9 w-9 rounded-full ring-2 ring-border"
            src={
              user?.profilePicture ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                user?.name || user?.email || 'User'
              )}&background=3b82f6&color=ffffff`
            }
            alt={user?.name || user?.email}
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-text-primary truncate">
              {user?.name || 'User'}
            </p>
            <p className="text-xs text-text-tertiary truncate">
              {user?.email}
            </p>
          </div>
          <div className="status-dot status-dot-success" title="Online"></div>
        </div>
      </div>
    </div>
  );
}

export default Layout;
