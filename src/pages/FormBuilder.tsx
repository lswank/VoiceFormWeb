import { useState } from 'react';
import { Tab } from '@headlessui/react';
import { 
  EyeIcon, 
  ArrowUpTrayIcon, 
  Squares2X2Icon,
} from '@heroicons/react/24/outline';
import { FormBuilder as FormBuilderComponent } from '../components/form/FormBuilder';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import type { Form } from '../schemas/form';
import { RespondentInterface } from './RespondentInterface';
import { formService } from '../services/formService';

interface FormBuilderProps {
  form?: Form;
}

function classNames(...classes: string[]) {
  return classes.filter(Boolean).join(' ');
}

export function FormBuilder({ form }: FormBuilderProps) {
  const [formConfig, setFormConfig] = useState<Form>(
    form ?? {
      id: 'new',
      title: 'Untitled Form',
      description: '',
      fields: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userId: 'preview',
      status: 'draft',
      responseCount: 0,
    }
  );

  const tabs = [
    { name: 'Builder', icon: Squares2X2Icon },
    { name: 'Preview', icon: EyeIcon },
  ];

  const handleSave = async () => {
    try {
      if (formConfig.id === 'new') {
        const newForm = await formService.createForm(formConfig);
        setFormConfig(newForm);
      } else {
        const updatedForm = await formService.updateForm(formConfig.id, formConfig);
        setFormConfig(updatedForm);
      }
    } catch (err) {
      console.error('Failed to save form:', err);
      // TODO: Show error toast
    }
  };

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="border-b border-secondary-200 bg-white dark:border-secondary-700 dark:bg-secondary-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            <div className="flex-1">
              <Input
                type="text"
                value={formConfig.title}
                onChange={(e) => setFormConfig((prev) => ({ ...prev, title: e.target.value }))}
                className="border-none bg-transparent text-xl font-semibold focus:ring-0"
                placeholder="Form Title"
              />
            </div>
            <div className="flex items-center space-x-4">
              <Button
                variant="secondary"
                onClick={() => {
                  // TODO: Implement PDF upload
                  console.log('PDF upload clicked');
                }}
              >
                <ArrowUpTrayIcon className="-ml-1 mr-2 h-5 w-5" />
                Upload PDF
              </Button>
              <Button onClick={handleSave}>
                Save
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
        <Tab.Group>
          <Tab.List className="flex space-x-1 rounded-xl bg-secondary-100 p-1 dark:bg-secondary-800">
            {tabs.map((tab) => (
              <Tab
                key={tab.name}
                className={({ selected }) =>
                  classNames(
                    'flex w-full items-center justify-center gap-2 rounded-lg py-2.5 text-sm font-medium leading-5',
                    'ring-white/60 ring-offset-2 ring-offset-secondary-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-secondary-700 shadow dark:bg-secondary-700 dark:text-white'
                      : 'text-secondary-600 hover:bg-white/[0.12] hover:text-secondary-800 dark:text-secondary-300 dark:hover:text-white'
                  )
                }
              >
                <tab.icon className="h-5 w-5" />
                {tab.name}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="mt-4">
            {/* Builder Panel */}
            <Tab.Panel>
              <FormBuilderComponent 
                form={formConfig} 
                onChange={setFormConfig}
              />
            </Tab.Panel>

            {/* Preview Panel */}
            <Tab.Panel>
              <RespondentInterface form={formConfig} isPreview />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>
    </div>
  );
} 