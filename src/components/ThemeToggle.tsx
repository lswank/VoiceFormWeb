import { SunIcon, MoonIcon, ComputerDesktopIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../contexts/ThemeContext';

export function ThemeToggle() {
  const { theme, setTheme, effectiveTheme } = useTheme();

  const handleClick = () => {
    // Cycle through themes: light -> dark -> system
    if (theme === 'light') setTheme('dark');
    else if (theme === 'dark') setTheme('system');
    else setTheme('light');
  };

  return (
    <button
      type="button"
      className="rounded-lg p-2.5 text-sm hover:bg-secondary-100 focus:outline-none focus:ring-4 focus:ring-secondary-200 dark:text-secondary-400 dark:hover:bg-secondary-700 dark:focus:ring-secondary-700"
      onClick={handleClick}
      aria-label={`Current theme: ${theme}. Click to cycle themes.`}
    >
      {theme === 'system' ? (
        <ComputerDesktopIcon className="h-5 w-5" />
      ) : effectiveTheme === 'light' ? (
        <MoonIcon className="h-5 w-5" />
      ) : (
        <SunIcon className="h-5 w-5" />
      )}
    </button>
  );
} 