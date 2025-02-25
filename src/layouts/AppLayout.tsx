import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  UserCircleIcon,
  PlusIcon,
  HomeIcon,
  ChevronRightIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  BeakerIcon,
} from '@heroicons/react/24/outline';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { Button } from '../components/Button';
import { useForm } from '../hooks/useForm';
import { Logo } from '../components/Logo';
import { useTheme } from '../contexts/ThemeContext';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Forms', href: '/forms', icon: DocumentTextIcon },
];

// Admin navigation items
// Removed from main navigation

interface AppLayoutProps {
  children: React.ReactNode;
}

const userNavigation = [
  { name: 'Your Profile', href: '/profile' },
  { name: 'Settings', href: '/settings' },
  { name: 'Billing', href: '/billing' },
  { name: 'Sign out', href: '/logout' },
];

export function AppLayout({ children }: AppLayoutProps) {
  const location = useLocation();
  const { id } = useParams<{ id?: string }>();
  const { form, isLoading } = useForm(id);
  const { theme } = useTheme();
  
  // Generate breadcrumb items based on current path
  const getBreadcrumbItems = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const items = [];
    
    // Add home as first item
    items.push({
      name: 'Home',
      href: '/dashboard',
      icon: HomeIcon,
    });

    // Add forms section if we're in forms
    if (pathSegments[0] === 'forms') {
      items.push({
        name: 'Forms',
        href: '/forms',
        icon: DocumentTextIcon,
      });

      // Add form details if we're viewing a specific form
      if (id) {
        if (isLoading) {
          items.push({ 
            name: 'Loading...',
            href: `/forms/${id}`,
            isLoading: true,
          });
        } else if (form) {
          items.push({ 
            name: form.title || 'Untitled Form',
            href: `/forms/${id}`,
          });
        } else {
          items.push({
            name: 'Form Details',
            href: `/forms/${id}`,
          });
        }
      } else if (pathSegments[1] === 'new') {
        items.push({
          name: 'New Form',
          href: '/forms/new',
        });
      }
    }
    
    // Add feature toggles section if we're in features
    if (pathSegments[0] === 'features') {
      items.push({
        name: 'Feature Toggles',
        href: '/features',
        icon: BeakerIcon,
      });
    }
    
    return items;
  };

  const renderBreadcrumbs = () => {
    const items = getBreadcrumbItems();
    
    return (
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-2">
          {items.map((item, index) => (
            <li key={item.href} className="flex items-center">
              {index > 0 && (
                <ChevronRightIcon
                  className="mx-2 h-5 w-5 flex-shrink-0 text-secondary-300 dark:text-secondary-600"
                  aria-hidden="true"
                />
              )}
              {item.isLoading ? (
                <div className="flex items-center rounded-md py-1.5 pl-2 pr-1.5">
                  <div className="h-4 w-48 animate-pulse rounded bg-secondary-200 dark:bg-secondary-700" />
                </div>
              ) : (
                <Link
                  to={item.href}
                  className="flex items-center rounded-md py-1.5 pl-2 pr-1.5 text-sm font-medium text-secondary-600 hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-secondary-200"
                >
                  {item.icon && (
                    <item.icon className="mr-2 h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  )}
                  <span className="truncate">{item.name}</span>
                </Link>
              )}
            </li>
          ))}
        </ol>
      </nav>
    );
  };

  return (
    <div className="min-h-screen bg-gradient-mesh bg-white dark:bg-secondary-900">
      <div className="bg-white/80 backdrop-blur-sm dark:bg-secondary-800/80 shadow">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 justify-between">
            <div className="flex">
              <div className="flex flex-shrink-0 items-center">
                <Link to="/dashboard">
                  <Logo />
                </Link>
              </div>
              <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
                {navigation.map((item) => (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-all ${
                      location.pathname.startsWith(item.href)
                        ? 'border-b-2 border-primary-500 text-secondary-900 dark:border-primary-400 dark:text-white'
                        : 'text-secondary-500 hover:border-b-2 hover:border-secondary-300 hover:text-secondary-700 dark:text-secondary-400 dark:hover:border-secondary-600 dark:hover:text-secondary-300'
                    }`}
                  >
                    <item.icon className="mr-2 h-5 w-5 transition-colors group-hover:text-primary-500 dark:group-hover:text-primary-400" />
                    {item.name}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center space-x-4">
              {/* Feature Toggle Button */}
              <Link
                to="/features"
                className="flex h-8 w-8 items-center justify-center rounded-full text-secondary-400 hover:bg-secondary-100 hover:text-accent-purple-500 focus:outline-none focus:ring-2 focus:ring-accent-purple-500 dark:text-secondary-500 dark:hover:bg-secondary-700 dark:hover:text-accent-purple-400 dark:focus:ring-accent-purple-400"
                aria-label="Feature Toggles"
              >
                <BeakerIcon className="h-5 w-5" />
              </Link>
              
              <ThemeToggle />
              <Menu as="div" className="relative">
                <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-secondary-800 dark:focus:ring-primary-400 dark:focus:ring-offset-secondary-900">
                  <span className="sr-only">Open user menu</span>
                  <UserCircleIcon className="h-8 w-8 text-secondary-400 hover:text-secondary-500 dark:text-secondary-500 dark:hover:text-secondary-400" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-lg bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-secondary-800 dark:ring-secondary-700">
                    {userNavigation.map((item) => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <Link
                            to={item.href}
                            className={`block px-4 py-2 text-sm transition-colors ${
                              active
                                ? 'bg-secondary-100 text-secondary-900 dark:bg-secondary-700 dark:text-white'
                                : 'text-secondary-700 dark:text-secondary-300'
                            }`}
                          >
                            {item.name}
                          </Link>
                        )}
                      </Menu.Item>
                    ))}
                  </Menu.Items>
                </Transition>
              </Menu>
            </div>
          </div>
        </div>
      </div>

      <main className="py-10">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          {renderBreadcrumbs()}
          <div className="mt-4">{children}</div>
        </div>
      </main>
    </div>
  );
} 