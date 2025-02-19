import { useState } from 'react';
import { Input } from '../Input';
import { Switch } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';
import { FieldType, type Field as FormField } from '../../types/form';

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
      return 'text';
  }
}

interface FieldProps {
  config: FieldConfig;
  mode: 'builder' | 'display' | 'edit';
  onChange?: (value: any) => void;
  onConfigChange?: (config: FieldConfig) => void;
  className?: string;
}

export function Field({ config, mode, onChange, onConfigChange, className }: FieldProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [localConfig, setLocalConfig] = useState(config);

  const handleConfigChange = (updates: Partial<FieldConfig>) => {
    const newConfig = { ...localConfig, ...updates };
    setLocalConfig(newConfig);
    onConfigChange?.(newConfig);
  };

  const renderBuilderControls = () => (
    <div className="mt-2 space-y-4 rounded-md bg-secondary-50 p-4 dark:bg-secondary-800">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
          Required
        </label>
        <Switch
          checked={localConfig.required}
          onChange={(checked) => handleConfigChange({ required: checked })}
          className={twMerge(
            'relative inline-flex h-6 w-11 items-center rounded-full',
            localConfig.required ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
          )}
        >
          <span className="sr-only">Require this field</span>
          <span
            className={twMerge(
              'inline-block h-4 w-4 transform rounded-full bg-white transition',
              localConfig.required ? 'translate-x-6' : 'translate-x-1'
            )}
          />
        </Switch>
      </div>

      <Input
        label="Field Label"
        value={localConfig.label}
        onChange={(e) => handleConfigChange({ label: e.target.value })}
      />

      <Input
        label="Help Text"
        value={localConfig.helpText || ''}
        onChange={(e) => handleConfigChange({ helpText: e.target.value })}
      />

      {(localConfig.type === 'select' || localConfig.type === 'multiselect') && (
        <div className="space-y-2">
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            Options
          </label>
          {localConfig.options?.map((option, index) => (
            <div key={index} className="flex gap-2">
              <Input
                value={option.label}
                onChange={(e) => {
                  const newOptions = [...(localConfig.options || [])];
                  newOptions[index] = { ...option, label: e.target.value };
                  handleConfigChange({ options: newOptions });
                }}
              />
              <button
                type="button"
                onClick={() => {
                  const newOptions = localConfig.options?.filter((_, i) => i !== index);
                  handleConfigChange({ options: newOptions });
                }}
                className="text-secondary-500 hover:text-secondary-700 dark:text-secondary-400 dark:hover:text-secondary-300"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => {
              const newOptions = [...(localConfig.options || []), { value: '', label: '' }];
              handleConfigChange({ options: newOptions });
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
    
    if (inputType === 'select') {
      return (
        <div>
          <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
            {config.label}
          </label>
          <select
            value={config.value as string || ''}
            onChange={(e) => onChange?.(e.target.value)}
            required={config.required}
            disabled={mode === 'display'}
            className={twMerge(
              'mt-1 block w-full rounded-md shadow-sm',
              'border-secondary-300 focus:border-primary-500 focus:ring-primary-500',
              'dark:border-secondary-700 dark:bg-secondary-800 dark:text-white',
              'dark:focus:border-primary-500 dark:focus:ring-primary-500'
            )}
            multiple={config.type === 'multiselect'}
          >
            <option value="">Select an option</option>
            {config.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>
      );
    }

    return (
      <Input
        type={inputType}
        label={config.label}
        value={config.value as string || ''}
        onChange={(e) => onChange?.(e.target.value)}
        required={config.required}
        placeholder={config.placeholder}
        disabled={mode === 'display'}
      />
    );
  };

  return (
    <div
      className={twMerge(
        'rounded-lg border border-secondary-200 bg-white p-4 shadow-sm',
        'dark:border-secondary-700 dark:bg-secondary-800',
        mode === 'builder' && 'cursor-move',
        className
      )}
    >
      {renderField()}
      {config.helpText && (
        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
          {config.helpText}
        </p>
      )}
      {mode === 'builder' && renderBuilderControls()}
    </div>
  );
}

export type FieldType =
  | 'text'
  | 'number'
  | 'email'
  | 'select'
  | 'multiselect'
  | 'date'
  | 'time'
  | 'voice'; 