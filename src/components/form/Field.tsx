import { useState } from 'react';
import { Input } from '../Input';
import { Switch } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';
import type { FieldType, Field as FormField } from '../../schemas/form';

// HTML input types we support
type InputType = 'text' | 'number' | 'email' | 'date' | 'time' | 'datetime-local' | 'select' | 'tel' | 'url' | 'radio' | 'checkbox' | 'range' | 'currency';

interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig extends Omit<FormField, 'type' | 'options'> {
  type: FieldType;
  helpText?: string;
  options?: FieldOption[];
  value?: string | string[] | Record<string, string>;
  min?: number;
  max?: number;
  step?: number;
}

// Map form field type to HTML input type
function getInputType(fieldType: FieldType): InputType {
  switch (fieldType) {
    case 'text':
    case 'number':
    case 'email':
    case 'date':
    case 'time':
    case 'select':
      return fieldType;
    case 'phone':
      return 'tel';
    case 'url':
      return 'url';
    case 'radio':
      return 'radio';
    case 'checkbox':
    case 'checkbox-group':
      return 'checkbox';
    case 'toggle':
      return 'checkbox'; // We'll use a custom UI component
    case 'datetime':
      return 'datetime-local';
    case 'slider':
      return 'range';
    case 'currency':
      return 'currency';
    case 'multiselect':
      return 'select';
    case 'voice':
    case 'star-rating':
    case 'address':
    default:
      return 'text';
  }
}

interface FieldProps {
  config: FieldConfig;
  onChange?: (value: string | string[] | Record<string, string>) => void;
  onUpdate?: (updates: Partial<FieldConfig>) => void;
  readOnly?: boolean;
  className?: string;
}

export function Field({
  config,
  onChange,
  onUpdate,
  readOnly = false,
  className,
}: FieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);

  const handleUpdate = (updates: Partial<FieldConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    onUpdate?.(updates);
  };

  const renderFieldControls = () => (
    <div className="mt-2 space-y-2">
      <div className="flex items-center justify-between">
        <Switch.Group as="div" className="flex items-center">
          <Switch
            checked={localConfig.required}
            onChange={(checked) => handleUpdate({ required: checked })}
            className={twMerge(
              'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
              localConfig.required
                ? 'bg-primary-600 dark:bg-primary-500'
                : 'bg-secondary-200 dark:bg-secondary-700'
            )}
          >
            <span
              className={twMerge(
                'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                localConfig.required ? 'translate-x-5' : 'translate-x-0'
              )}
            />
          </Switch>
          <Switch.Label className="ml-3 text-sm text-secondary-600 dark:text-secondary-400">
            Required
          </Switch.Label>
        </Switch.Group>
      </div>

      <Input
        type="text"
        value={localConfig.helpText || ''}
        onChange={(e) => handleUpdate({ helpText: e.target.value })}
        placeholder="Help text (optional)"
        className="text-sm"
      />

      {(localConfig.type === 'select' || localConfig.type === 'multiselect' || localConfig.type === 'radio' || localConfig.type === 'checkbox-group') && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Options
          </label>
          {localConfig.options?.map((option, index) => (
            <div key={index} className="flex gap-2">
              <Input
                type="text"
                value={option.label}
                onChange={(e) => {
                  const newOptions = [...(localConfig.options || [])];
                  newOptions[index] = {
                    ...newOptions[index],
                    label: e.target.value,
                    value: e.target.value.toLowerCase().replace(/\s+/g, '-'),
                  };
                  handleUpdate({ options: newOptions });
                }}
                placeholder="Option label"
                className="text-sm"
              />
              <button
                type="button"
                onClick={() => {
                  const newOptions = [...(localConfig.options || [])];
                  newOptions.splice(index, 1);
                  handleUpdate({ options: newOptions });
                }}
                className="rounded-md p-2 text-secondary-400 hover:text-secondary-500 dark:text-secondary-500 dark:hover:text-secondary-400"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newOptions = [...(localConfig.options || [])];
              newOptions.push({
                value: `option-${newOptions.length + 1}`,
                label: `Option ${newOptions.length + 1}`,
              });
              handleUpdate({ options: newOptions });
            }}
            className="text-sm text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Add Option
          </button>
        </div>
      )}
    </div>
  );

  const renderField = () => {
    const inputType = getInputType(config.type);

    switch (config.type) {
      case 'select':
      case 'multiselect':
        return config.type === 'multiselect' ? (
          <select
            multiple
            value={Array.isArray(config.value) ? config.value : []}
            onChange={(e) => {
              const values = Array.from(e.target.selectedOptions).map(
                (option) => option.value
              );
              onChange?.(values);
            }}
            className={twMerge(
              'block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white sm:text-sm',
              className
            )}
            disabled={readOnly}
          >
            {config.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        ) : (
          <select
            value={config.value as string}
            onChange={(e) => onChange?.(e.target.value)}
            className={twMerge(
              'block w-full rounded-md border-secondary-300 shadow-sm focus:border-primary-500 focus:ring-primary-500 dark:border-secondary-700 dark:bg-secondary-800 dark:text-white sm:text-sm',
              className
            )}
            disabled={readOnly}
          >
            <option value="">Select an option</option>
            {config.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      
      case 'radio':
        return (
          <div className="space-y-2">
            {config.options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${config.id}-${option.value}`}
                  name={config.id}
                  value={option.value}
                  checked={config.value === option.value}
                  onChange={(e) => onChange?.(e.target.value)}
                  disabled={readOnly}
                  className="h-4 w-4 border-secondary-300 text-primary-600 focus:ring-primary-500 dark:border-secondary-600 dark:focus:ring-primary-400"
                />
                <label
                  htmlFor={`${config.id}-${option.value}`}
                  className="ml-2 block text-sm text-secondary-700 dark:text-secondary-300"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'checkbox':
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={`${config.id}-checkbox`}
              checked={config.value === 'true'}
              onChange={(e) => onChange?.(e.target.checked ? 'true' : 'false')}
              disabled={readOnly}
              className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500 dark:border-secondary-600 dark:focus:ring-primary-400"
            />
            <label
              htmlFor={`${config.id}-checkbox`}
              className="ml-2 block text-sm text-secondary-700 dark:text-secondary-300"
            >
              {config.placeholder || 'Yes/No'}
            </label>
          </div>
        );
      
      case 'checkbox-group':
        return (
          <div className="space-y-2">
            {config.options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="checkbox"
                  id={`${config.id}-${option.value}`}
                  value={option.value}
                  checked={Array.isArray(config.value) && config.value.includes(option.value)}
                  onChange={(e) => {
                    const currentValues = Array.isArray(config.value) ? [...config.value] : [];
                    if (e.target.checked) {
                      onChange?.([...currentValues, option.value]);
                    } else {
                      onChange?.(currentValues.filter(val => val !== option.value));
                    }
                  }}
                  disabled={readOnly}
                  className="h-4 w-4 rounded border-secondary-300 text-primary-600 focus:ring-primary-500 dark:border-secondary-600 dark:focus:ring-primary-400"
                />
                <label
                  htmlFor={`${config.id}-${option.value}`}
                  className="ml-2 block text-sm text-secondary-700 dark:text-secondary-300"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );
      
      case 'toggle':
        return (
          <Switch
            checked={config.value === 'true'}
            onChange={(checked) => onChange?.(checked ? 'true' : 'false')}
            disabled={readOnly}
            className={`${
              config.value === 'true' ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
            } relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2`}
          >
            <span className="sr-only">{config.placeholder || 'Toggle'}</span>
            <span
              className={`${
                config.value === 'true' ? 'translate-x-6' : 'translate-x-1'
              } inline-block h-4 w-4 transform rounded-full bg-white transition-transform`}
            />
          </Switch>
        );
      
      case 'slider':
        return (
          <div className="space-y-2">
            <input
              type="range"
              id={`${config.id}-slider`}
              min={config.min || 0}
              max={config.max || 100}
              step={config.step || 1}
              value={typeof config.value === 'string' ? config.value : (config.value as unknown as number) || 0}
              onChange={(e) => onChange?.(e.target.value)}
              disabled={readOnly}
              className="w-full"
            />
            <div className="flex justify-between text-xs text-secondary-500 dark:text-secondary-400">
              <span>{config.min || 0}</span>
              <span>{typeof config.value === 'string' ? config.value : (config.value as unknown as number) || 0}</span>
              <span>{config.max || 100}</span>
            </div>
          </div>
        );
      
      case 'star-rating':
        return (
          <div className="flex space-x-1">
            {Array.from({ length: 5 }).map((_, index) => (
              <button
                key={index}
                type="button"
                onClick={() => onChange?.((index + 1).toString())}
                disabled={readOnly}
                className={`h-8 w-8 ${
                  parseInt(config.value as string || '0') > index
                    ? 'text-yellow-400'
                    : 'text-secondary-300 dark:text-secondary-600'
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="h-full w-full"
                >
                  <path
                    fillRule="evenodd"
                    d="M10.788 3.21c.448-1.077 1.976-1.077 2.424 0l2.082 5.007 5.404.433c1.164.093 1.636 1.545.749 2.305l-4.117 3.527 1.257 5.273c.271 1.136-.964 2.033-1.96 1.425L12 18.354 7.373 21.18c-.996.608-2.231-.29-1.96-1.425l1.257-5.273-4.117-3.527c-.887-.76-.415-2.212.749-2.305l5.404-.433 2.082-5.006z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            ))}
          </div>
        );
      
      case 'address':
        return (
          <div className="space-y-2">
            <Input
              type="text"
              value={(config.value as Record<string, string>)?.street || ''}
              onChange={(e) => {
                const currentValue = (config.value as Record<string, string>) || {};
                onChange?.({ ...currentValue, street: e.target.value });
              }}
              placeholder="Street address"
              className={className}
              disabled={readOnly}
            />
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="text"
                value={(config.value as Record<string, string>)?.city || ''}
                onChange={(e) => {
                  const currentValue = (config.value as Record<string, string>) || {};
                  onChange?.({ ...currentValue, city: e.target.value });
                }}
                placeholder="City"
                className={className}
                disabled={readOnly}
              />
              <Input
                type="text"
                value={(config.value as Record<string, string>)?.state || ''}
                onChange={(e) => {
                  const currentValue = (config.value as Record<string, string>) || {};
                  onChange?.({ ...currentValue, state: e.target.value });
                }}
                placeholder="State/Province"
                className={className}
                disabled={readOnly}
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="text"
                value={(config.value as Record<string, string>)?.zip || ''}
                onChange={(e) => {
                  const currentValue = (config.value as Record<string, string>) || {};
                  onChange?.({ ...currentValue, zip: e.target.value });
                }}
                placeholder="ZIP/Postal code"
                className={className}
                disabled={readOnly}
              />
              <Input
                type="text"
                value={(config.value as Record<string, string>)?.country || ''}
                onChange={(e) => {
                  const currentValue = (config.value as Record<string, string>) || {};
                  onChange?.({ ...currentValue, country: e.target.value });
                }}
                placeholder="Country"
                className={className}
                disabled={readOnly}
              />
            </div>
          </div>
        );
      
      case 'currency':
        return (
          <div className="relative">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <span className="text-secondary-500 sm:text-sm">$</span>
            </div>
            <Input
              type="number"
              step="0.01"
              min="0"
              value={typeof config.value === 'string' ? config.value : ''}
              onChange={(e) => onChange?.(e.target.value)}
              placeholder="0.00"
              className={twMerge("pl-7", className)}
              disabled={readOnly}
            />
          </div>
        );
      
      case 'captcha':
        return (
          <div className="border border-secondary-300 rounded-md p-4 bg-white dark:bg-secondary-800 dark:border-secondary-700">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center">
                <svg className="w-5 h-5 text-primary-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="text-sm font-medium">CAPTCHA Verification</span>
              </div>
              {!readOnly && (
                <button
                  type="button"
                  className="text-secondary-400 hover:text-secondary-500 dark:text-secondary-500 dark:hover:text-secondary-400"
                  onClick={() => onChange?.('refreshed')}
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                </button>
              )}
            </div>
            <div className="bg-secondary-100 dark:bg-secondary-700 rounded p-2 mb-3 text-center">
              <div className="select-none font-mono text-lg tracking-wider text-secondary-800 dark:text-secondary-200" 
                   style={{ fontFamily: 'monospace', letterSpacing: '0.2em' }}>
                {readOnly ? '••••••' : 'X7A9P2'}
              </div>
            </div>
            {!readOnly && (
              <Input
                type="text" 
                value={typeof config.value === 'string' ? config.value : ''}
                onChange={(e) => onChange?.(e.target.value)}
                placeholder="Enter the code above"
                className={className}
                disabled={readOnly}
              />
            )}
            <div className="text-xs text-secondary-500 mt-2">
              Please enter the characters you see in the image above to verify you are human.
            </div>
          </div>
        );
      
      default:
        return (
          <Input
            type={inputType}
            value={typeof config.value === 'string' ? config.value : ''}
            onChange={(e) => onChange?.(e.target.value)}
            placeholder={config.placeholder}
            className={className}
            disabled={readOnly}
          />
        );
    }
  };

  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between">
        {isEditing ? (
          <Input
            type="text"
            value={localConfig.label}
            onChange={(e) => handleUpdate({ label: e.target.value })}
            className="font-medium"
            onBlur={() => setIsEditing(false)}
            onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
            autoFocus
          />
        ) : (
          <label
            className="block text-sm font-medium text-secondary-900 dark:text-white"
            onClick={() => !readOnly && setIsEditing(true)}
          >
            {localConfig.label}
            {localConfig.required && (
              <span className="ml-1 text-red-500">*</span>
            )}
          </label>
        )}
      </div>

      {renderField()}

      {!readOnly && renderFieldControls()}

      {config.helpText && (
        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
          {config.helpText}
        </p>
      )}
    </div>
  );
}

export type { FieldType };