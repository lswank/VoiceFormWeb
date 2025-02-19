import { Fragment } from 'react';
import { Menu, Transition } from '@headlessui/react';
import {
  UserCircleIcon,
  PlusIcon,
  HomeIcon,
  ChevronDownIcon,
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
    
    // Add home button as first item
    items.push({
      name: 'Home',
      href: '/dashboard',
      isHome: true,
    });

    // Add current section as second item
    const currentSection = navigation.find(nav => location.pathname.startsWith(nav.href)) || {
      name: 'Dashboard',
      href: '/dashboard',
      icon: HomeIcon
    };
    items.push({
      name: currentSection.name,
      href: currentSection.href,
      isSection: true,
      icon: currentSection.icon,
    });
    
    // Skip the first segment if it's "dashboard"
    const startIndex = pathSegments[0] === 'dashboard' ? 1 : 0;
    
    let currentPath = '';
    for (let i = startIndex; i < pathSegments.length; i++) {
      // Skip if this is the current section
      if (pathSegments[i] === currentSection.href.split('/')[1]) continue;
      
      currentPath += `/${pathSegments[i]}`;
      
      // If we're on a form page and have the form data, use the form title
      if (pathSegments[i] === id) {
        if (isLoading) {
          items.push({ 
            name: '...', 
            href: currentPath, 
            current: i === pathSegments.length - 1 
          });
        } else if (form) {
          items.push({ 
            name: form.title, 
            href: currentPath, 
            current: i === pathSegments.length - 1 
          });
        } else {
          items.push({ 
            name: 'Form not found', 
            href: currentPath, 
            current: i === pathSegments.length - 1 
          });
        }
      } else {
        const name = pathSegments[i].charAt(0).toUpperCase() + pathSegments[i].slice(1);
        items.push({ 
          name, 
          href: currentPath,
          current: i === pathSegments.length - 1 
        });
      }
    }
    
    return items;
  };

  const renderBreadcrumbs = () => {
    const items = getBreadcrumbItems();
    
    return (
      <nav className="flex" aria-label="Breadcrumb">
        <ol className="flex items-center space-x-4">
          {items.map((item, index) => (
            <li key={item.href}>
              <div className="flex items-center">
                {index > 0 && (
                  <ChevronDownIcon
                    className="h-4 w-4 flex-shrink-0 text-secondary-300 dark:text-secondary-600"
                    style={{ transform: 'rotate(-90deg)' }}
                    aria-hidden="true"
                  />
                )}
                {item.isHome ? (
                  <Link
                    to={item.href}
                    className="flex items-center rounded-md p-1.5 text-sm font-medium text-secondary-400 hover:bg-secondary-50 hover:text-secondary-500 dark:text-secondary-500 dark:hover:bg-secondary-800 dark:hover:text-secondary-400"
                  >
                    <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
                  </Link>
                ) : item.isSection ? (
                  <Menu as="div" className="relative">
                    <Menu.Button className="flex items-center gap-x-1 rounded-md py-1.5 pl-2 pr-1.5 text-sm font-medium text-secondary-600 hover:bg-secondary-50 hover:text-secondary-900 dark:text-secondary-400 dark:hover:bg-secondary-800 dark:hover:text-secondary-200">
                      <span>{item.name}</span>
                      <ChevronDownIcon className="h-5 w-5" aria-hidden="true" />
                    </Menu.Button>
                    <Transition
                      as={Fragment}
                      enter="transition ease-out duration-100"
                      enterFrom="transform opacity-0 scale-95"
                      enterTo="transform opacity-100 scale-100"
                      leave="transition ease-in duration-75"
                      leaveFrom="transform opacity-100 scale-100"
                      leaveTo="transform opacity-0 scale-95"
                    >
                      <Menu.Items className="absolute left-0 z-10 mt-2 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-secondary-800 dark:ring-secondary-700">
                        {navigation.map((navItem) => {
                          const Icon = navItem.icon;
                          const isCurrentPage = location.pathname.startsWith(navItem.href);
                          return (
                            <Menu.Item key={navItem.name}>
                              {({ active }) => (
                                <Link
                                  to={navItem.href}
                                  className={`flex items-center px-4 py-2 text-sm ${
                                    active || isCurrentPage
                                      ? 'bg-secondary-100 text-secondary-900 dark:bg-secondary-700 dark:text-white'
                                      : 'text-secondary-700 dark:text-secondary-300'
                                  }`}
                                >
                                  <Icon className="mr-3 h-5 w-5 text-secondary-400" aria-hidden="true" />
                                  {navItem.name}
                                  {isCurrentPage && (
                                    <span className="ml-auto text-secondary-400 dark:text-secondary-500">
                                      Current
                                    </span>
                                  )}
                                </Link>
                              )}
                            </Menu.Item>
                          );
                        })}
                      </Menu.Items>
                    </Transition>
                  </Menu>
                ) : (
                  <Link
                    to={item.href}
                    className={`ml-4 text-sm font-medium ${
                      item.current
                        ? 'text-secondary-700 dark:text-secondary-200'
                        : 'text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-200'
                    }`}
                    aria-current={item.current ? 'page' : undefined}
                  >
                    {item.name}
                  </Link>
                )}
              </div>
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