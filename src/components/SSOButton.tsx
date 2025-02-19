import { type ButtonHTMLAttributes } from 'react';
import { twMerge } from 'tailwind-merge';

interface SSOButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  provider: 'google' | 'microsoft';
  icon: React.ReactNode;
}

export function SSOButton({ provider, icon, className, children, ...props }: SSOButtonProps) {
  return (
    <button
      type="button"
      className={twMerge(
        'flex w-full items-center justify-center gap-3 rounded-md border px-4 py-2 text-sm font-medium shadow-sm transition-colors',
        'border-secondary-300 bg-white text-secondary-700 hover:bg-secondary-50',
        'dark:border-secondary-700 dark:bg-secondary-800 dark:text-secondary-300 dark:hover:bg-secondary-700',
        'focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
        className
      )}
      {...props}
    >
      {icon}
      <span>Continue with {children}</span>
    </button>
  );
} 