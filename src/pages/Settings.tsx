import { useState } from 'react';
import { Switch } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import {
  SunIcon,
  MoonIcon,
  LanguageIcon,
  KeyIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  CloudIcon,
} from '@heroicons/react/24/outline';

interface ThemeSettings {
  theme: 'light' | 'dark' | 'system';
  enableAnimations: boolean;
}

interface FormSettings {
  defaultRequireVoiceInput: boolean;
  enableAutoSave: boolean;
  defaultLanguage: string;
}

interface SecuritySettings {
  requireAuthForResponses: boolean;
  enableTwoFactor: boolean;
  allowEmbedding: boolean;
}

export function Settings() {
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    theme: 'system',
    enableAnimations: true,
  });

  const [formSettings, setFormSettings] = useState<FormSettings>({
    defaultRequireVoiceInput: true,
    enableAutoSave: true,
    defaultLanguage: 'en',
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    requireAuthForResponses: false,
    enableTwoFactor: false,
    allowEmbedding: true,
  });

  const handleExportSettings = () => {
    const settings = {
      theme: themeSettings,
      form: formSettings,
      security: securitySettings,
    };
    const blob = new Blob([JSON.stringify(settings, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'voiceform-settings.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImportSettings = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const settings = JSON.parse(event.target?.result as string);
        if (settings.theme) setThemeSettings(settings.theme);
        if (settings.form) setFormSettings(settings.form);
        if (settings.security) setSecuritySettings(settings.security);
      } catch (err) {
        console.error('Failed to parse settings file:', err);
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-secondary-900 dark:text-white">
          Settings
        </h1>
        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
          Manage your application settings and preferences
        </p>
      </div>

      {/* Theme Settings */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-secondary-800">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
              <SunIcon className="mr-2 -mt-1 inline-block h-5 w-5" />
              Theme Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Theme
                </label>
                <div className="mt-2 space-x-2">
                  {['light', 'dark', 'system'].map((theme) => (
                    <Button
                      key={theme}
                      variant={themeSettings.theme === theme ? 'primary' : 'secondary'}
                      onClick={() => setThemeSettings(prev => ({ ...prev, theme: theme as 'light' | 'dark' | 'system' }))}
                    >
                      {theme.charAt(0).toUpperCase() + theme.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Enable animations
                  </p>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    Show animations for transitions and interactions
                  </p>
                </div>
                <Switch
                  checked={themeSettings.enableAnimations}
                  onChange={(checked) => setThemeSettings(prev => ({ ...prev, enableAnimations: checked }))}
                  className={twMerge(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
                    themeSettings.enableAnimations ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
                  )}
                >
                  <span
                    className={twMerge(
                      'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      themeSettings.enableAnimations ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </Switch>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Form Settings */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-secondary-800">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
              <CloudIcon className="mr-2 -mt-1 inline-block h-5 w-5" />
              Form Settings
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Default voice input requirement
                  </p>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    Require voice input by default for new forms
                  </p>
                </div>
                <Switch
                  checked={formSettings.defaultRequireVoiceInput}
                  onChange={(checked) => setFormSettings(prev => ({ ...prev, defaultRequireVoiceInput: checked }))}
                  className={twMerge(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
                    formSettings.defaultRequireVoiceInput ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
                  )}
                >
                  <span
                    className={twMerge(
                      'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      formSettings.defaultRequireVoiceInput ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </Switch>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Enable auto-save
                  </p>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    Automatically save form changes while editing
                  </p>
                </div>
                <Switch
                  checked={formSettings.enableAutoSave}
                  onChange={(checked) => setFormSettings(prev => ({ ...prev, enableAutoSave: checked }))}
                  className={twMerge(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
                    formSettings.enableAutoSave ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
                  )}
                >
                  <span
                    className={twMerge(
                      'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      formSettings.enableAutoSave ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </Switch>
              </div>

              <div>
                <label className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Default language
                </label>
                <div className="mt-2">
                  <select
                    value={formSettings.defaultLanguage}
                    onChange={(e) => setFormSettings(prev => ({ ...prev, defaultLanguage: e.target.value }))}
                    className={twMerge(
                      'mt-1 block w-full rounded-md shadow-sm',
                      'border-secondary-300 focus:border-primary-500 focus:ring-primary-500',
                      'dark:border-secondary-700 dark:bg-secondary-800 dark:text-white',
                      'dark:focus:border-primary-500 dark:focus:ring-primary-500'
                    )}
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-secondary-800">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
              <KeyIcon className="mr-2 -mt-1 inline-block h-5 w-5" />
              Security Settings
            </h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Require authentication for responses
                  </p>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    Only allow authenticated users to submit form responses
                  </p>
                </div>
                <Switch
                  checked={securitySettings.requireAuthForResponses}
                  onChange={(checked) => setSecuritySettings(prev => ({ ...prev, requireAuthForResponses: checked }))}
                  className={twMerge(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
                    securitySettings.requireAuthForResponses ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
                  )}
                >
                  <span
                    className={twMerge(
                      'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      securitySettings.requireAuthForResponses ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </Switch>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Two-factor authentication
                  </p>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    Enable two-factor authentication for your account
                  </p>
                </div>
                <Switch
                  checked={securitySettings.enableTwoFactor}
                  onChange={(checked) => setSecuritySettings(prev => ({ ...prev, enableTwoFactor: checked }))}
                  className={twMerge(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
                    securitySettings.enableTwoFactor ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
                  )}
                >
                  <span
                    className={twMerge(
                      'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      securitySettings.enableTwoFactor ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </Switch>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                    Allow form embedding
                  </p>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    Allow forms to be embedded in other websites
                  </p>
                </div>
                <Switch
                  checked={securitySettings.allowEmbedding}
                  onChange={(checked) => setSecuritySettings(prev => ({ ...prev, allowEmbedding: checked }))}
                  className={twMerge(
                    'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
                    securitySettings.allowEmbedding ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
                  )}
                >
                  <span
                    className={twMerge(
                      'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                      securitySettings.allowEmbedding ? 'translate-x-5' : 'translate-x-0'
                    )}
                  />
                </Switch>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Import/Export Settings */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-secondary-800">
        <div className="px-4 py-5 sm:p-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
              Import/Export Settings
            </h3>
            <div className="flex items-center gap-x-4">
              <Button variant="secondary" onClick={handleExportSettings}>
                <DocumentArrowDownIcon className="-ml-1 mr-2 h-5 w-5" />
                Export Settings
              </Button>
              <label className="block">
                <div
                  className={twMerge(
                    'inline-flex items-center justify-center gap-x-2 rounded-md px-3.5 py-2.5 text-sm font-semibold shadow-sm',
                    'bg-white text-secondary-900 ring-1 ring-inset ring-secondary-300 hover:bg-secondary-50',
                    'dark:bg-secondary-800 dark:text-white dark:ring-secondary-700 dark:hover:bg-secondary-700'
                  )}
                >
                  <DocumentArrowUpIcon className="-ml-1 mr-2 h-5 w-5" />
                  Import Settings
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportSettings}
                  className="hidden"
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 