import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { useParams, useNavigate } from 'react-router-dom';
import { FormBuilder } from '../components/form/FormBuilder';
import { ResponsesTab } from '../components/form/ResponsesTab';
import { AnalyticsTab } from '../components/analytics/AnalyticsTab';
import { FormPermissions } from '../components/form/FormPermissions';
import { useForm } from '../hooks/useForm';
import { Input } from '../components/Input';
import { Button } from '../components/Button';
import { formService } from '../services/formService';
import { 
  PencilIcon, 
  DocumentDuplicateIcon,
  ExclamationTriangleIcon,
  ArrowPathIcon,
  ArchiveBoxIcon,
  DocumentCheckIcon,
  UsersIcon,
  EyeIcon,
} from '@heroicons/react/24/outline';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { ShareDropdown } from './Forms';
import { FieldPalette } from '../components/form/FieldPalette';
import { type FieldType } from '../components/form/Field';

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

interface StatusBadgeProps {
  status: 'draft' | 'published' | 'archived';
}

function StatusBadge({ status }: StatusBadgeProps) {
  const styles = {
    draft: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300',
    published: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300',
    archived: 'bg-secondary-100 text-secondary-800 dark:bg-secondary-900 dark:text-secondary-300',
  };

  return (
    <span className={classNames(
      'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium',
      styles[status]
    )}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}

interface StatusDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText: string;
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  intent?: 'warning' | 'danger' | 'success';
}

function StatusDialog({ 
  open, 
  onClose, 
  onConfirm, 
  title, 
  description, 
  confirmText,
  icon: Icon,
  intent = 'warning'
}: StatusDialogProps) {
  const styles = {
    warning: {
      icon: 'text-yellow-600 dark:text-yellow-400',
      bg: 'bg-yellow-100 dark:bg-yellow-900',
    },
    danger: {
      icon: 'text-red-600 dark:text-red-400',
      bg: 'bg-red-100 dark:bg-red-900',
    },
    success: {
      icon: 'text-green-600 dark:text-green-400',
      bg: 'bg-green-100 dark:bg-green-900',
    },
  };

  return (
    <Transition.Root show={open} as={Fragment}>
      <Dialog as="div" className="relative z-10" onClose={onClose}>
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
                <div>
                  <div className={classNames(
                    'mx-auto flex h-12 w-12 items-center justify-center rounded-full',
                    styles[intent].bg
                  )}>
                    <Icon className={classNames('h-6 w-6', styles[intent].icon)} aria-hidden="true" />
                  </div>
                  <div className="mt-3 text-center sm:mt-5">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-secondary-900 dark:text-white">
                      {title}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        {description}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="mt-5 sm:mt-6 sm:grid sm:grid-flow-row-dense sm:grid-cols-2 sm:gap-3">
                  <Button
                    variant={intent === 'danger' ? 'danger' : 'primary'}
                    className="sm:col-start-2"
                    onClick={() => {
                      onConfirm();
                      onClose();
                    }}
                  >
                    {confirmText}
                  </Button>
                  <Button
                    variant="secondary"
                    onClick={onClose}
                    className="mt-3 sm:col-start-1 sm:mt-0"
                  >
                    Cancel
                  </Button>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
}

export function FormDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { form, analytics, error, isLoading, mutate } = useForm(id);
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [statusDialog, setStatusDialog] = useState<{
    show: boolean;
    type: 'publish' | 'unpublish' | 'archive' | 'unarchive';
  }>({
    show: false,
    type: 'publish',
  });
  const [newlyAddedFieldId, setNewlyAddedFieldId] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  if (error || !form || !analytics) {
    return (
      <div className="rounded-md bg-red-50 p-4 dark:bg-red-900">
        <p className="text-sm text-red-700 dark:text-red-200">
          {error || 'Failed to load form details.'}
        </p>
      </div>
    );
  }

  const handleTitleClick = () => {
    setNewTitle(form.title);
    setIsEditingTitle(true);
  };

  const handleTitleSave = async () => {
    if (newTitle.trim() && newTitle !== form.title) {
      try {
        await formService.updateForm(form.id, { ...form, title: newTitle });
        mutate({ ...form, title: newTitle });
      } catch (err) {
        console.error('Failed to update form title:', err);
      }
    }
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleTitleSave();
    } else if (e.key === 'Escape') {
      setIsEditingTitle(false);
    }
  };

  const handleStatusChange = async (newStatus: 'draft' | 'published' | 'archived') => {
    try {
      await formService.updateForm(form.id, { ...form, status: newStatus });
      mutate({ ...form, status: newStatus });
    } catch (err) {
      console.error('Failed to update form status:', err);
    }
  };

  const handleCloneForm = async () => {
    try {
      const clonedForm = await formService.cloneForm(form.id);
      navigate(`/forms/${clonedForm.id}`);
    } catch (err) {
      console.error('Failed to clone form:', err);
    }
  };

  const handlePreview = () => {
    window.open(`/respond/form-1`, '_blank');
  };

  const statusDialogConfigs = {
    publish: {
      title: 'Publish Form',
      description: 'Publishing this form will make it available to respondents. You won\'t be able to edit it directly once published.',
      confirmText: 'Publish',
      icon: DocumentCheckIcon,
      intent: 'success' as const,
    },
    unpublish: {
      title: 'Unpublish Form',
      description: 'Unpublishing this form will make it unavailable to respondents. Existing responses will be preserved.',
      confirmText: 'Unpublish',
      icon: ExclamationTriangleIcon,
      intent: 'warning' as const,
    },
    archive: {
      title: 'Archive Form',
      description: 'Archiving this form will make it unavailable to respondents and move it to the archive. Existing responses will be preserved.',
      confirmText: 'Archive',
      icon: ArchiveBoxIcon,
      intent: 'warning' as const,
    },
    unarchive: {
      title: 'Unarchive Form',
      description: 'Unarchiving this form will restore it as a draft. You\'ll need to publish it again to make it available to respondents.',
      confirmText: 'Unarchive',
      icon: ArrowPathIcon,
      intent: 'success' as const,
    },
  };

  const handleStatusDialogConfirm = () => {
    switch (statusDialog.type) {
      case 'publish':
        handleStatusChange('published');
        break;
      case 'unpublish':
        handleStatusChange('draft');
        break;
      case 'archive':
        handleStatusChange('archived');
        break;
      case 'unarchive':
        handleStatusChange('draft');
        break;
    }
  };

  const tabs = [
    {
      name: 'Edit',
      content: (
        <div className="space-y-4">
          {form.status === 'published' && (
            <div className="rounded-md bg-yellow-50 p-4 dark:bg-yellow-900/20">
              <div className="flex">
                <div className="flex-shrink-0">
                  <ExclamationTriangleIcon className="h-5 w-5 text-yellow-400 dark:text-yellow-500" aria-hidden="true" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">
                    Form is Published
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700 dark:text-yellow-300">
                    <p>
                      This form is currently published and cannot be edited. To make changes, you'll need to unpublish it first.
                      Unpublishing will make the form unavailable to respondents, but all existing responses will be preserved.
                    </p>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => setStatusDialog({ show: true, type: 'unpublish' })}
                    >
                      <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
                      Unpublish to Edit
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}
          
          <div className="flex gap-6">
            {/* Toolbox pane - sticky sidebar */}
            {form.status !== 'published' && (
              <div className="w-64 shrink-0">
                <div className="sticky top-4 max-h-[calc(100vh-8rem)] overflow-y-auto rounded-lg border border-secondary-200 p-4 dark:border-secondary-700">
                  <h3 className="text-sm font-medium text-secondary-900 dark:text-white">
                    Form Components
                  </h3>
                  <div className="mt-4">
                    <FieldPalette onSelect={(type: FieldType) => {
                      // Create a new field with the selected type
                      const newField = {
                        id: `field-${Date.now()}`,
                        type,
                        label: `New ${type} field`,
                        required: false,
                      };
                      
                      // Update the form with the new field
                      const updatedFields = [...form.fields, newField];
                      formService.updateForm(form.id, {...form, fields: updatedFields})
                        .then(() => {
                          mutate({...form, fields: updatedFields});
                          // Set the newly added field ID
                          setNewlyAddedFieldId(newField.id);
                        })
                        .catch(err => {
                          console.error('Failed to add field:', err);
                        });
                    }} />
                  </div>
                </div>
              </div>
            )}
            
            {/* Form builder - main content */}
            <div className="flex-1">
              <FormBuilder 
                form={form} 
                readOnly={form.status === 'published'} 
                hideAddField={true}
                newlyAddedFieldId={newlyAddedFieldId}
                onFieldFocused={() => setNewlyAddedFieldId(null)}
              />
            </div>
          </div>
        </div>
      ),
      show: true,
    },
    {
      name: 'Responses',
      content: <ResponsesTab form={form} />,
      show: analytics.totalResponses > 0,
    },
    {
      name: 'Analytics',
      content: <AnalyticsTab form={form} analytics={analytics} />,
      show: analytics.totalResponses > 0,
    },
    {
      name: 'Permissions',
      icon: UsersIcon,
      content: (
        <div className="max-w-2xl">
          <FormPermissions form={form} onUpdate={mutate} />
        </div>
      ),
      show: true,
    },
  ].filter(tab => tab.show);

  return (
    <div className="mx-auto max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          {isEditingTitle ? (
            <Input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              onBlur={handleTitleSave}
              onKeyDown={handleTitleKeyDown}
              autoFocus
              className="text-xl font-semibold"
            />
          ) : (
            <div 
              onClick={handleTitleClick}
              className="group inline-flex items-center gap-2 cursor-pointer"
            >
              <h1 className="text-xl font-semibold text-secondary-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400">
                {form.title}
              </h1>
              <PencilIcon className="h-5 w-5 text-secondary-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              <span className="sr-only">Edit form title</span>
            </div>
          )}
          <StatusBadge status={form.status} />
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={handlePreview}
          >
            <EyeIcon className="-ml-1 mr-2 h-5 w-5" />
            Preview
          </Button>

          {form.status === 'draft' && (
            <Button
              onClick={() => setStatusDialog({ show: true, type: 'publish' })}
            >
              <DocumentCheckIcon className="-ml-1 mr-2 h-5 w-5" />
              Publish
            </Button>
          )}
          {form.status === 'published' && (
            <>
              <ShareDropdown form={form} />
              <Button
                variant="secondary"
                onClick={handleCloneForm}
              >
                <DocumentDuplicateIcon className="-ml-1 mr-2 h-5 w-5" />
                Clone
              </Button>
              <Button
                variant="secondary"
                onClick={() => setStatusDialog({ show: true, type: 'archive' })}
              >
                <ArchiveBoxIcon className="-ml-1 mr-2 h-5 w-5" />
                Archive
              </Button>
            </>
          )}
          {form.status === 'archived' && (
            <Button
              variant="secondary"
              onClick={() => setStatusDialog({ show: true, type: 'unarchive' })}
            >
              <ArrowPathIcon className="-ml-1 mr-2 h-5 w-5" />
              Unarchive
            </Button>
          )}
        </div>
      </div>

      <Tab.Group>
        <Tab.List className="flex space-x-1 rounded-xl bg-secondary-100 p-1 dark:bg-secondary-800">
          {tabs.map((tab) => (
            <Tab
              key={tab.name}
              className={({ selected }) =>
                classNames(
                  'w-full rounded-lg py-2.5 text-sm font-medium leading-5',
                  'ring-white/60 ring-offset-2 ring-offset-secondary-400 focus:outline-none focus:ring-2',
                  selected
                    ? 'bg-white text-secondary-700 shadow dark:bg-secondary-700 dark:text-white'
                    : 'text-secondary-600 hover:bg-white/[0.12] hover:text-secondary-800 dark:text-secondary-300 dark:hover:text-white'
                )
              }
            >
              {tab.name}
            </Tab>
          ))}
        </Tab.List>
        <Tab.Panels className="mt-6">
          {tabs.map((tab, idx) => (
            <Tab.Panel
              key={idx}
              className={classNames(
                'rounded-xl p-3',
                'ring-white/60 ring-offset-2 ring-offset-secondary-400 focus:outline-none focus:ring-2'
              )}
            >
              {tab.content}
            </Tab.Panel>
          ))}
        </Tab.Panels>
      </Tab.Group>

      <StatusDialog
        open={statusDialog.show}
        onClose={() => setStatusDialog({ ...statusDialog, show: false })}
        onConfirm={handleStatusDialogConfirm}
        {...statusDialogConfigs[statusDialog.type]}
      />
    </div>
  );
} 