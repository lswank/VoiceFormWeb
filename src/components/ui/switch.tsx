import * as React from 'react';
import { Switch as HeadlessSwitch } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  className?: string;
  disabled?: boolean;
}

export function Switch({ checked, onChange, className, disabled }: SwitchProps) {
  return (
    <HeadlessSwitch
      checked={checked}
      onChange={onChange}
      disabled={disabled}
      className={twMerge(
        'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 dark:focus:ring-offset-secondary-900',
        checked ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700',
        className
      )}
    >
      <span className="sr-only">Toggle</span>
      <span
        className={twMerge(
          'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
          checked ? 'translate-x-5' : 'translate-x-0'
        )}
      />
    </HeadlessSwitch>
  );
} 