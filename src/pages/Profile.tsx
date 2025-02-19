import { useState } from 'react';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { Switch } from '@headlessui/react';
import { twMerge } from 'tailwind-merge';
import { UserCircleIcon } from '@heroicons/react/24/outline';
import { emailService } from '../services/emailService';

interface NotificationPreferences {
  receiveNewResponses: boolean;
  receiveDailyDigest: boolean;
  receiveWeeklyReport: boolean;
}

export function Profile() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [profileData, setProfileData] = useState({
    name: 'John Doe',
    email: 'john@example.com',
    organizationName: 'Acme Inc',
  });
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreferences>({
    receiveNewResponses: true,
    receiveDailyDigest: true,
    receiveWeeklyReport: true,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      // TODO: Implement profile update
      console.log('Saving profile:', profileData);
      
      // Update notification preferences
      await emailService.updateNotificationPreferences('user-1', notificationPreferences);
      
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to save profile:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-secondary-900 dark:text-white">
          Your Profile
        </h1>
        <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
          Manage your account settings and preferences
        </p>
      </div>

      {/* Profile Information */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-secondary-800">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-start space-x-4">
            <div className="flex-shrink-0">
              <UserCircleIcon className="h-12 w-12 text-secondary-400" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="space-y-6">
                {isEditing ? (
                  <>
                    <div className="space-y-4">
                      <Input
                        label="Full name"
                        value={profileData.name}
                        onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                      />
                      <Input
                        label="Email"
                        type="email"
                        value={profileData.email}
                        onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      />
                      <Input
                        label="Organization"
                        value={profileData.organizationName}
                        onChange={(e) => setProfileData(prev => ({ ...prev, organizationName: e.target.value }))}
                      />
                    </div>
                    <div className="flex items-center gap-x-4">
                      <Button onClick={handleSave} disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save changes'}
                      </Button>
                      <Button
                        variant="secondary"
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                      >
                        Cancel
                      </Button>
                    </div>
                  </>
                ) : (
                  <>
                    <dl className="space-y-4">
                      <div>
                        <dt className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Full name</dt>
                        <dd className="mt-1 text-sm text-secondary-900 dark:text-white">{profileData.name}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Email</dt>
                        <dd className="mt-1 text-sm text-secondary-900 dark:text-white">{profileData.email}</dd>
                      </div>
                      <div>
                        <dt className="text-sm font-medium text-secondary-500 dark:text-secondary-400">Organization</dt>
                        <dd className="mt-1 text-sm text-secondary-900 dark:text-white">{profileData.organizationName}</dd>
                      </div>
                    </dl>
                    <Button variant="secondary" onClick={() => setIsEditing(true)}>
                      Edit profile
                    </Button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notification Preferences */}
      <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-secondary-800">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium text-secondary-900 dark:text-white">
            Notification Preferences
          </h3>
          <p className="mt-1 text-sm text-secondary-500 dark:text-secondary-400">
            Choose how you want to be notified about form activity
          </p>
          <div className="mt-6 space-y-6">
            <div className="flex items-start">
              <Switch
                checked={notificationPreferences.receiveNewResponses}
                onChange={(checked) => setNotificationPreferences(prev => ({ ...prev, receiveNewResponses: checked }))}
                className={twMerge(
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
                  notificationPreferences.receiveNewResponses ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
                )}
              >
                <span
                  className={twMerge(
                    'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    notificationPreferences.receiveNewResponses ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </Switch>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-900 dark:text-white">New responses</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  Get notified when someone submits a response to your forms
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Switch
                checked={notificationPreferences.receiveDailyDigest}
                onChange={(checked) => setNotificationPreferences(prev => ({ ...prev, receiveDailyDigest: checked }))}
                className={twMerge(
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
                  notificationPreferences.receiveDailyDigest ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
                )}
              >
                <span
                  className={twMerge(
                    'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    notificationPreferences.receiveDailyDigest ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </Switch>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-900 dark:text-white">Daily digest</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  Receive a daily summary of form activity
                </p>
              </div>
            </div>

            <div className="flex items-start">
              <Switch
                checked={notificationPreferences.receiveWeeklyReport}
                onChange={(checked) => setNotificationPreferences(prev => ({ ...prev, receiveWeeklyReport: checked }))}
                className={twMerge(
                  'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
                  notificationPreferences.receiveWeeklyReport ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
                )}
              >
                <span
                  className={twMerge(
                    'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
                    notificationPreferences.receiveWeeklyReport ? 'translate-x-5' : 'translate-x-0'
                  )}
                />
              </Switch>
              <div className="ml-3">
                <p className="text-sm font-medium text-secondary-900 dark:text-white">Weekly report</p>
                <p className="text-sm text-secondary-500 dark:text-secondary-400">
                  Get a weekly analytics report for all your forms
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 