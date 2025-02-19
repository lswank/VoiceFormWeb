import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';
import { ExclamationCircleIcon } from '@heroicons/react/20/solid';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  hint?: string;
  leftIcon?: React.ComponentType<{ className?: string }>;
  rightIcon?: React.ComponentType<{ className?: string }>;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      hint,
      leftIcon: LeftIcon,
      rightIcon: RightIcon,
      fullWidth = true,
      className,
      id,
      ...props
    },
    ref
  ) => {
    const inputId = id || label?.toLowerCase().replace(/\s+/g, '-');

    return (
      <div className={twMerge('relative', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="mb-1 block text-sm font-medium text-secondary-700 dark:text-secondary-300"
          >
            {label}
          </label>
        )}
        <div className="relative">
          {LeftIcon && (
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <LeftIcon className="h-5 w-5 text-secondary-400 dark:text-secondary-500" />
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={twMerge(
              'block rounded-lg border border-secondary-300 bg-white px-3 py-2 text-secondary-900 placeholder-secondary-400 shadow-sm transition-colors',
              'focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500',
              'disabled:cursor-not-allowed disabled:bg-secondary-50 disabled:text-secondary-500',
              'dark:border-secondary-600 dark:bg-secondary-800 dark:text-white dark:placeholder-secondary-500',
              'dark:focus:border-primary-400 dark:focus:ring-primary-400',
              'dark:disabled:bg-secondary-900 dark:disabled:text-secondary-600',
              error && 'border-red-500 pr-10 text-red-900 placeholder-red-300 focus:border-red-500 focus:ring-red-500',
              error && 'dark:border-red-500 dark:text-red-400 dark:placeholder-red-400 dark:focus:border-red-500 dark:focus:ring-red-500',
              LeftIcon && 'pl-10',
              RightIcon && !error && 'pr-10',
              fullWidth && 'w-full',
              className
            )}
            aria-invalid={error ? 'true' : 'false'}
            aria-describedby={error ? `${inputId}-error` : hint ? `${inputId}-hint` : undefined}
            {...props}
          />
          {RightIcon && !error && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <RightIcon className="h-5 w-5 text-secondary-400 dark:text-secondary-500" />
            </div>
          )}
          {error && (
            <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-3">
              <ExclamationCircleIcon className="h-5 w-5 text-red-500 dark:text-red-400" />
            </div>
          )}
        </div>
        {(error || hint) && (
          <p
            className={twMerge(
              'mt-1 text-sm',
              error
                ? 'text-red-600 dark:text-red-400'
                : 'text-secondary-500 dark:text-secondary-400'
            )}
            id={error ? `${inputId}-error` : `${inputId}-hint`}
          >
            {error || hint}
          </p>
        )}
      </div>
    );
  }
); 