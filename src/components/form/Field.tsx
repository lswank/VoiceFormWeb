import { useState } from 'react';
import { Input } from '../Input';
import { Switch } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';
import type { FieldType, Field as FormField } from '../../schemas/form';

// HTML input types we support
type InputType = 'text' | 'number' | 'email' | 'date' | 'time' | 'select';

interface FieldOption {
  value: string;
  label: string;
}

export interface FieldConfig extends Omit<FormField, 'type' | 'options'> {
  type: FieldType;
  helpText?: string;
  options?: FieldOption[];
  value?: string | string[];
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
    case 'multiselect':
      return 'select';
    case 'voice':
    default:
      return 'text';
  }
}

interface FieldProps {
  config: FieldConfig;
  onChange?: (value: any) => void;
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

      {(localConfig.type === 'select' || localConfig.type === 'multiselect') && (
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

    switch (inputType) {
      case 'select':
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
      default:
        return (
          <Input
            type={inputType}
            value={config.value || ''}
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