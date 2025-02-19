import { useState } from 'react';
import { Switch } from '@headlessui/react';
import { UserPlusIcon, UserMinusIcon } from '@heroicons/react/24/outline';
import { Button } from '../Button';
import { Input } from '../Input';
import type { Form, FormPermission, FormPermissionRole } from '../../schemas/form';
import { formService } from '../../services/formService';
import { twMerge } from 'tailwind-merge';

interface FormPermissionsProps {
  form: Form;
  onUpdate: (form: Form) => void;
}

export function FormPermissions({ form, onUpdate }: FormPermissionsProps) {
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<FormPermissionRole>('viewer');
  const [isAddingUser, setIsAddingUser] = useState(false);

  const handleScopeChange = async (isTeam: boolean) => {
    try {
      const newScope = isTeam ? 'team' : 'personal';
      const updatedForm = await formService.updateForm(form.id, {
        ...form,
        scope: newScope,
        permissions: newScope === 'team' ? [
          {
            userId: form.userId,
            role: 'owner',
            addedAt: new Date().toISOString(),
            addedBy: form.userId,
          }
        ] : undefined,
      });
      onUpdate(updatedForm);
    } catch (err) {
      console.error('Failed to update form scope:', err);
    }
  };

  const handleAddUser = async () => {
    if (!newUserEmail.trim()) return;

    try {
      const updatedForm = await formService.addFormPermission(form.id, {
        userId: newUserEmail, // In a real app, you'd look up the user ID from their email
        role: newUserRole,
        addedBy: form.userId,
      });
      onUpdate(updatedForm);
      setNewUserEmail('');
      setNewUserRole('viewer');
      setIsAddingUser(false);
    } catch (err) {
      console.error('Failed to add user:', err);
    }
  };

  const handleRemoveUser = async (userId: string) => {
    try {
      const updatedForm = await formService.removeFormPermission(form.id, userId);
      onUpdate(updatedForm);
    } catch (err) {
      console.error('Failed to remove user:', err);
    }
  };

  const handleUpdateUserRole = async (userId: string, newRole: FormPermissionRole) => {
    try {
      const updatedPermissions = form.permissions?.map(p =>
        p.userId === userId ? { ...p, role: newRole } : p
      ) || [];
      const updatedForm = await formService.updateFormPermissions(form.id, updatedPermissions);
      onUpdate(updatedForm);
    } catch (err) {
      console.error('Failed to update user role:', err);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scope Toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-medium text-secondary-900 dark:text-white">
            Form Access
          </h3>
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            Control who can view, edit, and manage this form
          </p>
        </div>
        <Switch
          checked={form.scope === 'team'}
          onChange={(checked) => handleScopeChange(checked)}
          className={twMerge(
            'relative inline-flex h-6 w-11 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2 dark:focus:ring-offset-secondary-900',
            form.scope === 'team' ? 'bg-primary-600' : 'bg-secondary-200 dark:bg-secondary-700'
          )}
        >
          <span
            className={twMerge(
              'pointer-events-none relative inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out',
              form.scope === 'team' ? 'translate-x-5' : 'translate-x-0'
            )}
          />
        </Switch>
      </div>

      {/* Team Members List */}
      {form.scope === 'team' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-secondary-900 dark:text-white">
              Team Members & Permissions
            </h3>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => setIsAddingUser(true)}
            >
              <UserPlusIcon className="-ml-1 mr-2 h-5 w-5" />
              Add Member
            </Button>
          </div>

          {/* Add Member Form */}
          {isAddingUser && (
            <div className="flex items-end gap-x-4">
              <div className="flex-1">
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Email
                </label>
                <Input
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="team@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-secondary-700 dark:text-secondary-300">
                  Role
                </label>
                <select
                  value={newUserRole}
                  onChange={(e) => setNewUserRole(e.target.value as FormPermissionRole)}
                  className={twMerge(
                    'mt-1 block w-full rounded-md shadow-sm',
                    'border-secondary-300 focus:border-primary-500 focus:ring-primary-500',
                    'dark:border-secondary-700 dark:bg-secondary-800 dark:text-white'
                  )}
                >
                  <option value="viewer">Viewer</option>
                  <option value="editor">Editor</option>
                  <option value="owner">Owner</option>
                </select>
              </div>
              <Button
                variant="primary"
                onClick={handleAddUser}
              >
                Add
              </Button>
              <Button
                variant="secondary"
                onClick={() => setIsAddingUser(false)}
              >
                Cancel
              </Button>
            </div>
          )}

          {/* Members List */}
          <div className="space-y-2">
            {form.permissions?.map((permission) => (
              <div
                key={permission.userId}
                className="flex items-center justify-between rounded-lg border border-secondary-200 p-4 dark:border-secondary-700"
              >
                <div>
                  <p className="text-sm font-medium text-secondary-900 dark:text-white">
                    {permission.userId}
                  </p>
                  <p className="text-sm text-secondary-500 dark:text-secondary-400">
                    Added by {permission.addedBy} on {new Date(permission.addedAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-x-4">
                  <select
                    value={permission.role}
                    onChange={(e) => handleUpdateUserRole(permission.userId, e.target.value as FormPermissionRole)}
                    className={twMerge(
                      'block rounded-md shadow-sm',
                      'border-secondary-300 focus:border-primary-500 focus:ring-primary-500',
                      'dark:border-secondary-700 dark:bg-secondary-800 dark:text-white'
                    )}
                    disabled={permission.userId === form.userId} // Can't change owner's role
                  >
                    <option value="viewer">Viewer</option>
                    <option value="editor">Editor</option>
                    <option value="owner">Owner</option>
                  </select>
                  {permission.userId !== form.userId && (
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleRemoveUser(permission.userId)}
                    >
                      <UserMinusIcon className="h-5 w-5" />
                      <span className="sr-only">Remove user</span>
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 