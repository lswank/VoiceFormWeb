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
} from '@heroicons/react/24/outline';
import { Link, useLocation, useParams } from 'react-router-dom';
import { ThemeToggle } from '../components/ThemeToggle';
import { Button } from '../components/Button';
import { useForm } from '../hooks/useForm';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: ChartBarIcon },
  { name: 'Forms', href: '/forms', icon: DocumentTextIcon },
];

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
    <div>
      <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-x-4 border-b border-secondary-200 bg-white px-4 shadow-sm dark:border-secondary-700 dark:bg-secondary-900 sm:gap-x-6 sm:px-6 lg:px-8">
        <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
          <div className="flex flex-1 items-center justify-between">
            {renderBreadcrumbs()}
            <div className="flex items-center gap-x-4">
              <Link to="/forms/new">
                <Button>
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  New Form
                </Button>
              </Link>
              <ThemeToggle />
              
              {/* Profile dropdown */}
              <Menu as="div" className="relative ml-3">
                <div>
                  <Menu.Button className="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:bg-secondary-800">
                    <span className="sr-only">Open user menu</span>
                    <UserCircleIcon className="h-8 w-8 text-secondary-400" />
                  </Menu.Button>
                </div>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-secondary-800 dark:ring-secondary-700">
                    {userNavigation.map((item) => (
                      <Menu.Item key={item.name}>
                        {({ active }) => (
                          <Link
                            to={item.href}
                            className={`block px-4 py-2 text-sm ${
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
        <div className="px-4 sm:px-6 lg:px-8">{children}</div>
      </main>
    </div>
  );
} 