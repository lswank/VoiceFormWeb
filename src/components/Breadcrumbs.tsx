import { Link } from 'react-router-dom';
import { ChevronRightIcon, HomeIcon } from '@heroicons/react/20/solid';

interface BreadcrumbItem {
  name: string;
  href: string;
  current?: boolean;
}

interface BreadcrumbsProps {
  items: BreadcrumbItem[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-4">
        <li>
          <div>
            <Link
              to="/dashboard"
              className="text-secondary-400 hover:text-secondary-500 dark:text-secondary-500 dark:hover:text-secondary-400"
            >
              <HomeIcon className="h-5 w-5 flex-shrink-0" aria-hidden="true" />
              <span className="sr-only">Dashboard</span>
            </Link>
          </div>
        </li>
        {items.map((item) => (
          <li key={item.name}>
            <div className="flex items-center">
              <ChevronRightIcon
                className="h-5 w-5 flex-shrink-0 text-secondary-400 dark:text-secondary-500"
                aria-hidden="true"
              />
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
            </div>
          </li>
        ))}
      </ol>
    </nav>
  );
} 