import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className="rounded-lg p-2.5 text-sm hover:bg-secondary-100 focus:outline-none focus:ring-4 focus:ring-secondary-200 dark:text-secondary-400 dark:hover:bg-secondary-700 dark:focus:ring-secondary-700"
      onClick={toggleTheme}
      aria-label={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
    >
      {theme === 'light' ? (
        <MoonIcon className="h-5 w-5" />
      ) : (
        <SunIcon className="h-5 w-5" />
      )}
    </button>
  );
} 