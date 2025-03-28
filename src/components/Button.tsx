import { forwardRef } from 'react';
import { twMerge } from 'tailwind-merge';

const variants = {
  primary: 'bg-primary-600 text-white hover:bg-primary-700 dark:bg-primary-500 dark:hover:bg-primary-600',
  secondary: 'bg-secondary-100 text-secondary-700 hover:bg-secondary-200 dark:bg-secondary-700 dark:text-secondary-100 dark:hover:bg-secondary-600',
  outline: 'border border-secondary-300 bg-transparent text-secondary-700 hover:bg-secondary-50 dark:border-secondary-600 dark:text-secondary-300 dark:hover:bg-secondary-800',
  danger: 'bg-red-600 text-white hover:bg-red-700 dark:bg-red-500 dark:hover:bg-red-600',
  purple: 'bg-accent-purple-600 text-white hover:bg-accent-purple-700 dark:bg-accent-purple-500 dark:hover:bg-accent-purple-600',
  teal: 'bg-accent-teal-600 text-white hover:bg-accent-teal-700 dark:bg-accent-teal-500 dark:hover:bg-accent-teal-600',
  amber: 'bg-accent-amber-600 text-white hover:bg-accent-amber-700 dark:bg-accent-amber-500 dark:hover:bg-accent-amber-600',
  'primary-gradient': 'bg-gradient-to-r from-primary-600 to-accent-purple-600 text-white hover:from-primary-700 hover:to-accent-purple-700 dark:from-primary-500 dark:to-accent-purple-500 dark:hover:from-primary-600 dark:hover:to-accent-purple-600',
  'teal-gradient': 'bg-gradient-to-r from-accent-teal-600 to-primary-600 text-white hover:from-accent-teal-700 hover:to-primary-700 dark:from-accent-teal-500 dark:to-primary-500 dark:hover:from-accent-teal-600 dark:hover:to-primary-600',
  'amber-gradient': 'bg-gradient-to-r from-accent-amber-600 to-accent-purple-600 text-white hover:from-accent-amber-700 hover:to-accent-purple-700 dark:from-accent-amber-500 dark:to-accent-purple-500 dark:hover:from-accent-amber-600 dark:hover:to-accent-purple-600',
} as const;

const sizes = {
  xs: 'px-2 py-1 text-xs',
  sm: 'px-2 py-1 text-sm',
  md: 'px-4 py-2 text-sm',
  lg: 'px-4 py-2 text-base',
  xl: 'px-6 py-3 text-base',
} as const;

const iconSizes = {
  xs: 'h-3 w-3',
  sm: 'h-4 w-4',
  md: 'h-4 w-4',
  lg: 'h-5 w-5',
  xl: 'h-6 w-6',
} as const;

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof variants;
  size?: keyof typeof sizes;
  icon?: React.ComponentType<{ className?: string }>;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  loading?: boolean;
  shine?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = 'primary',
      size = 'md',
      icon: Icon,
      iconPosition = 'left',
      fullWidth = false,
      loading = false,
      shine = false,
      disabled,
      className,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles = 'relative inline-flex items-center justify-center font-medium rounded-lg focus:outline-none focus:ring-2 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden';
    const sizeStyles = sizes[size];
    const variantStyles = variants[variant];
    const focusRingColor = variant === 'primary' ? 'focus:ring-primary-500 dark:focus:ring-primary-400' : 'focus:ring-secondary-500 dark:focus:ring-secondary-400';
    
    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={twMerge(
          baseStyles,
          sizeStyles,
          variantStyles,
          focusRingColor,
          fullWidth && 'w-full',
          shine && 'group',
          className
        )}
        {...props}
      >
        {shine && (
          <div 
            className="absolute inset-0 bg-gradient-shine bg-[length:200%_100%] opacity-0 group-hover:animate-shine group-hover:opacity-100"
            style={{ backgroundSize: '200% 100%' }}
          />
        )}
        <span className="relative flex items-center justify-center">
          {loading ? (
            <>
              <svg
                className={twMerge('animate-spin -ml-1 mr-2', iconSizes[size])}
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                />
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                />
              </svg>
              Loading...
            </>
          ) : (
            <>
              {Icon && iconPosition === 'left' && (
                <Icon className={twMerge('-ml-0.5 mr-2', iconSizes[size])} />
              )}
              {children}
              {Icon && iconPosition === 'right' && (
                <Icon className={twMerge('ml-2 -mr-0.5', iconSizes[size])} />
              )}
            </>
          )}
        </span>
      </button>
    );
  }
); 