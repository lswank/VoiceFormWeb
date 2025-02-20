import { useState, useEffect, Fragment } from 'react';
import { Switch, Dialog, Transition } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { emailService } from '../services/emailService';
import {
  SunIcon,
  MoonIcon,
  LanguageIcon,
  KeyIcon,
  DocumentArrowDownIcon,
  DocumentArrowUpIcon,
  CloudIcon,
  BellIcon,
  QrCodeIcon,
  ShieldCheckIcon,
  XMarkIcon,
} from '@heroicons/react/24/outline';
import { toast } from 'react-hot-toast';
import { useTheme } from '../contexts/ThemeContext';

interface ThemeSettings {
  reduceMotion: boolean;
}

interface FormSettings {
  defaultRequireVoiceInput: boolean;
  enableAutoSave: boolean;
  defaultLanguage: string;
  requireAuthForResponses: boolean;
}

interface SecuritySettings {
  twoFactorEnabled: boolean;
  allowEmbedding: boolean;
}

interface NotificationSettings {
  receiveNewResponses: boolean;
  receiveDailyDigest: boolean;
  receiveWeeklyReport: boolean;
}

interface TwoFactorSetupState {
  qrCode: string | null;
  verificationCode: string;
  isVerifying: boolean;
  error: string | null;
}

export function Settings() {
  const { theme, setTheme } = useTheme();
  const [themeSettings, setThemeSettings] = useState<ThemeSettings>({
    reduceMotion: false,
  });

  const [formSettings, setFormSettings] = useState<FormSettings>({
    defaultRequireVoiceInput: true,
    enableAutoSave: true,
    defaultLanguage: 'en',
    requireAuthForResponses: true,
  });

  const [securitySettings, setSecuritySettings] = useState<SecuritySettings>({
    twoFactorEnabled: false,
    allowEmbedding: true,
  });

  const [notificationSettings, setNotificationSettings] = useState<NotificationSettings>({
    receiveNewResponses: true,
    receiveDailyDigest: true,
    receiveWeeklyReport: true,
  });

  const [showTwoFactorModal, setShowTwoFactorModal] = useState(false);
  const [twoFactorSetup, setTwoFactorSetup] = useState<TwoFactorSetupState>({
    qrCode: null,
    verificationCode: '',
    isVerifying: false,
    error: null,
  });

  useEffect(() => {
    // Save notification settings whenever they change
    const saveNotificationSettings = async () => {
      try {
        await emailService.updateNotificationPreferences('user-1', notificationSettings);
      } catch (err) {
        console.error('Failed to save notification settings:', err);
        toast.error('Failed to save notification settings');
      }
    };

    saveNotificationSettings();
  }, [notificationSettings]);

  const handleExportSettings = () => {
    const settings = {
      theme,
      reduceMotion: themeSettings.reduceMotion,
      form: formSettings,
      security: securitySettings,
      notifications: notificationSettings,
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
        if (settings.theme) setTheme(settings.theme);
        if (settings.reduceMotion !== undefined) setThemeSettings(prev => ({ ...prev, reduceMotion: settings.reduceMotion }));
        if (settings.form) setFormSettings(settings.form);
        if (settings.security) setSecuritySettings(settings.security);
        if (settings.notifications) setNotificationSettings(settings.notifications);
      } catch (err) {
        console.error('Failed to parse settings file:', err);
        toast.error('Failed to import settings');
      }
    };
    reader.readAsText(file);
  };

  const handleTwoFactorClick = async () => {
    if (securitySettings.twoFactorEnabled) {
      // Show management modal
      setShowTwoFactorModal(true);
    } else {
      // Start setup process
      setTwoFactorSetup({
        qrCode: null,
        verificationCode: '',
        isVerifying: true,
        error: null,
      });
      try {
        // TODO: Replace with actual API call
        const qrCode = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA...'; // Mock QR code
        setTwoFactorSetup(prev => ({
          ...prev,
          qrCode,
          isVerifying: false,
        }));
        setShowTwoFactorModal(true);
      } catch (err) {
        console.error('Failed to start 2FA setup:', err);
        toast.error('Failed to start 2FA setup');
      }
    }
  };

  const handleVerifyCode = async () => {
    setTwoFactorSetup(prev => ({
      ...prev,
      isVerifying: true,
      error: null,
    }));

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API delay
      
      if (twoFactorSetup.verificationCode === '123456') { // Mock verification
        setSecuritySettings(prev => ({
          ...prev,
          twoFactorEnabled: true,
        }));
        setShowTwoFactorModal(false);
        toast.success('Two-factor authentication enabled');
      } else {
        setTwoFactorSetup(prev => ({
          ...prev,
          error: 'Invalid verification code',
          isVerifying: false,
        }));
      }
    } catch (err) {
      console.error('Failed to verify code:', err);
      setTwoFactorSetup(prev => ({
        ...prev,
        error: 'Failed to verify code',
        isVerifying: false,
      }));
    }
  };

  const handleDisableTwoFactor = async () => {
    setTwoFactorSetup(prev => ({
      ...prev,
      isVerifying: true,
      error: null,
    }));

    try {
      // TODO: Replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000)); // Mock API delay
      
      if (twoFactorSetup.verificationCode === '123456') { // Mock verification
        setSecuritySettings(prev => ({
          ...prev,
          twoFactorEnabled: false,
        }));
        setShowTwoFactorModal(false);
        toast.success('Two-factor authentication disabled');
      } else {
        setTwoFactorSetup(prev => ({
          ...prev,
          error: 'Invalid verification code',
          isVerifying: false,
        }));
      }
    } catch (err) {
      console.error('Failed to disable 2FA:', err);
      setTwoFactorSetup(prev => ({
        ...prev,
        error: 'Failed to disable 2FA',
        isVerifying: false,
      }));
    }
  };

  return (
    <>
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
                    {['light', 'dark'].map((t) => (
                      <Button
                        key={t}
                        variant={theme === t ? 'primary' : 'secondary'}
                        onClick={() => setTheme(t as 'light' | 'dark')}
                      >
                        {t.charAt(0).toUpperCase() + t.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Reduce motion
                    </p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                      Minimize animations and transitions for improved accessibility
                    </p>
                  </div>
                  <Switch
                    checked={themeSettings.reduceMotion}
                    onChange={(checked) => setThemeSettings(prev => ({ ...prev, reduceMotion: checked }))}
                    className={twMerge(
                      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
                      themeSettings.reduceMotion ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
                    )}
                  >
                    <span
                      className={twMerge(
                        'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        themeSettings.reduceMotion ? 'translate-x-5' : 'translate-x-0'
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

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Require authentication by default
                    </p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                      New forms will require users to authenticate before submitting responses
                    </p>
                  </div>
                  <Switch
                    checked={formSettings.requireAuthForResponses}
                    onChange={(checked) => setFormSettings(prev => ({ ...prev, requireAuthForResponses: checked }))}
                    className={twMerge(
                      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
                      formSettings.requireAuthForResponses ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
                    )}
                  >
                    <span
                      className={twMerge(
                        'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        formSettings.requireAuthForResponses ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </Switch>
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
                      Two-factor authentication
                    </p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                      Add an extra layer of security to your account
                    </p>
                  </div>
                  <Button
                    variant={securitySettings.twoFactorEnabled ? "secondary" : "primary"}
                    onClick={handleTwoFactorClick}
                  >
                    {securitySettings.twoFactorEnabled ? 'Manage 2FA' : 'Enable 2FA'}
                  </Button>
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

        {/* Notification Settings */}
        <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-secondary-800">
          <div className="px-4 py-5 sm:p-6">
            <div className="space-y-4">
              <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
                <BellIcon className="mr-2 -mt-1 inline-block h-5 w-5" />
                Notification Settings
              </h3>
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      New responses
                    </p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                      Get notified when someone submits a response to your forms
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.receiveNewResponses}
                    onChange={(checked) => setNotificationSettings(prev => ({ ...prev, receiveNewResponses: checked }))}
                    className={twMerge(
                      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
                      notificationSettings.receiveNewResponses ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
                    )}
                  >
                    <span
                      className={twMerge(
                        'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        notificationSettings.receiveNewResponses ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Daily digest
                    </p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                      Receive a daily summary of form activity
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.receiveDailyDigest}
                    onChange={(checked) => setNotificationSettings(prev => ({ ...prev, receiveDailyDigest: checked }))}
                    className={twMerge(
                      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
                      notificationSettings.receiveDailyDigest ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
                    )}
                  >
                    <span
                      className={twMerge(
                        'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        notificationSettings.receiveDailyDigest ? 'translate-x-5' : 'translate-x-0'
                      )}
                    />
                  </Switch>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-secondary-700 dark:text-secondary-300">
                      Weekly report
                    </p>
                    <p className="text-sm text-secondary-500 dark:text-secondary-400">
                      Get a weekly analytics report for all your forms
                    </p>
                  </div>
                  <Switch
                    checked={notificationSettings.receiveWeeklyReport}
                    onChange={(checked) => setNotificationSettings(prev => ({ ...prev, receiveWeeklyReport: checked }))}
                    className={twMerge(
                      'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
                      notificationSettings.receiveWeeklyReport ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
                    )}
                  >
                    <span
                      className={twMerge(
                        'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                        notificationSettings.receiveWeeklyReport ? 'translate-x-5' : 'translate-x-0'
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

      {/* 2FA Modal */}
      <Transition.Root show={showTwoFactorModal} as={Fragment}>
        <Dialog as="div" className="relative z-10" onClose={setShowTwoFactorModal}>
          <Transition.Child
            as={Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-secondary-500 bg-opacity-75 transition-opacity dark:bg-secondary-900 dark:bg-opacity-75" />
          </Transition.Child>

          <div className="fixed inset-0 z-10 overflow-y-auto">
            <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
              <Transition.Child
                as={Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
                enterTo="opacity-100 translate-y-0 sm:scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 translate-y-0 sm:scale-100"
                leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              >
                <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-secondary-800 sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                  <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                    <button
                      type="button"
                      className="rounded-md text-secondary-400 hover:text-secondary-500 focus:outline-none dark:text-secondary-500 dark:hover:text-secondary-400"
                      onClick={() => setShowTwoFactorModal(false)}
                    >
                      <span className="sr-only">Close</span>
                      <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                    </button>
                  </div>
                  <div className="sm:flex sm:items-start">
                    <div className="mx-auto flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 dark:bg-primary-900 sm:mx-0 sm:h-10 sm:w-10">
                      {securitySettings.twoFactorEnabled ? (
                        <ShieldCheckIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                      ) : (
                        <QrCodeIcon className="h-6 w-6 text-primary-600 dark:text-primary-400" aria-hidden="true" />
                      )}
                    </div>
                    <div className="mt-3 text-center sm:ml-4 sm:mt-0 sm:text-left">
                      <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-secondary-900 dark:text-white">
                        {securitySettings.twoFactorEnabled ? 'Manage Two-Factor Authentication' : 'Set Up Two-Factor Authentication'}
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">
                          {securitySettings.twoFactorEnabled
                            ? 'Enter your verification code to disable two-factor authentication.'
                            : 'Scan the QR code with your authenticator app and enter the verification code to enable two-factor authentication.'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {!securitySettings.twoFactorEnabled && twoFactorSetup.qrCode && (
                      <div className="flex justify-center">
                        <img
                          src={twoFactorSetup.qrCode}
                          alt="QR Code"
                          className="h-48 w-48 rounded-lg border border-secondary-200 dark:border-secondary-700"
                        />
                      </div>
                    )}

                    <div className="space-y-2">
                      <label
                        htmlFor="verification-code"
                        className="block text-sm font-medium text-secondary-700 dark:text-secondary-300"
                      >
                        Verification Code
                      </label>
                      <Input
                        id="verification-code"
                        type="text"
                        value={twoFactorSetup.verificationCode}
                        onChange={(e) => setTwoFactorSetup(prev => ({ ...prev, verificationCode: e.target.value }))}
                        placeholder="Enter 6-digit code"
                        maxLength={6}
                        className="font-mono"
                      />
                      {twoFactorSetup.error && (
                        <p className="text-sm text-red-600 dark:text-red-400">
                          {twoFactorSetup.error}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 flex justify-end gap-x-3">
                    <Button
                      variant="secondary"
                      onClick={() => setShowTwoFactorModal(false)}
                      disabled={twoFactorSetup.isVerifying}
                    >
                      Cancel
                    </Button>
                    <Button
                      variant={securitySettings.twoFactorEnabled ? "danger" : "primary"}
                      onClick={securitySettings.twoFactorEnabled ? handleDisableTwoFactor : handleVerifyCode}
                      disabled={!twoFactorSetup.verificationCode || twoFactorSetup.isVerifying}
                    >
                      {twoFactorSetup.isVerifying ? (
                        <div className="flex items-center">
                          <div className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-primary-200 border-t-primary-600"></div>
                          Verifying...
                        </div>
                      ) : securitySettings.twoFactorEnabled ? (
                        'Disable 2FA'
                      ) : (
                        'Enable 2FA'
                      )}
                    </Button>
                  </div>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition.Root>
    </>
  );
} 