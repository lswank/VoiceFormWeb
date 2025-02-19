import { useState, Fragment } from 'react';
import { Tab, Menu, Transition } from '@headlessui/react';
import { 
  EyeIcon, 
  ArrowUpTrayIcon, 
  Squares2X2Icon,
  DocumentArrowUpIcon,
  PhotoIcon,
  LinkIcon,
  ChevronDownIcon,
} from '@heroicons/react/24/outline';
import { FormBuilder as FormBuilderComponent } from '../components/form/FormBuilder';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import type { Form } from '../schemas/form';
import { RespondentInterface } from './RespondentInterface';
import { formService } from '../services/formService';
import { formImportService } from '../services/formService';
import { ImportForm } from '../components/ImportForm';
import { ProcessingModal } from '../components/ProcessingModal';

interface FormBuilderProps {
  form?: Form;
}

type ImportMethod = 'pdf' | 'image' | 'url';

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

  const [showImport, setShowImport] = useState(false);
  const [importMethod, setImportMethod] = useState<ImportMethod>('pdf');
  const [selectedFile, setSelectedFile] = useState<File>();
  const [importUrl, setImportUrl] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [extractedForm, setExtractedForm] = useState<Form>();

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

  const handleFileSelect = async (file: File) => {
    setSelectedFile(file);
    setIsProcessing(true);
    try {
      const extractedFields = await formImportService.extractFormFields(file, importMethod);
      setExtractedForm(extractedFields);
    } catch (err) {
      console.error('Failed to process file:', err);
      // TODO: Show error toast
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUrlImport = async (url: string) => {
    setImportUrl(url);
    setIsProcessing(true);
    try {
      const extractedFields = await formImportService.extractFormFields(url, 'url');
      setExtractedForm(extractedFields);
    } catch (err) {
      console.error('Failed to import from URL:', err);
      // TODO: Show error toast
    } finally {
      setIsProcessing(false);
    }
  };

  const handleAcceptExtractedForm = (form: Form) => {
    setFormConfig(form);
    setShowImport(false);
    setSelectedFile(undefined);
    setExtractedForm(undefined);
    setImportUrl('');
  };

  const startImport = (method: ImportMethod) => {
    setImportMethod(method);
    setShowImport(true);
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
              <Menu as="div" className="relative">
                <Menu.Button
                  as={Button}
                  variant="secondary"
                >
                  <ArrowUpTrayIcon className="-ml-1 mr-2 h-5 w-5" />
                  Import Form
                  <ChevronDownIcon className="ml-2 -mr-1 h-5 w-5" />
                </Menu.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-100"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-75"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 z-10 mt-2 w-56 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-secondary-800 dark:ring-secondary-700">
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => startImport('pdf')}
                          className={classNames(
                            'flex w-full items-center px-4 py-2 text-sm',
                            active
                              ? 'bg-secondary-100 text-secondary-900 dark:bg-secondary-700 dark:text-white'
                              : 'text-secondary-700 dark:text-secondary-300'
                          )}
                        >
                          <DocumentArrowUpIcon className="mr-3 h-5 w-5 text-secondary-400" />
                          Upload PDF
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => startImport('image')}
                          className={classNames(
                            'flex w-full items-center px-4 py-2 text-sm',
                            active
                              ? 'bg-secondary-100 text-secondary-900 dark:bg-secondary-700 dark:text-white'
                              : 'text-secondary-700 dark:text-secondary-300'
                          )}
                        >
                          <PhotoIcon className="mr-3 h-5 w-5 text-secondary-400" />
                          Upload Image
                        </button>
                      )}
                    </Menu.Item>
                    <Menu.Item>
                      {({ active }) => (
                        <button
                          onClick={() => startImport('url')}
                          className={classNames(
                            'flex w-full items-center px-4 py-2 text-sm',
                            active
                              ? 'bg-secondary-100 text-secondary-900 dark:bg-secondary-700 dark:text-white'
                              : 'text-secondary-700 dark:text-secondary-300'
                          )}
                        >
                          <LinkIcon className="mr-3 h-5 w-5 text-secondary-400" />
                          Import from URL
                        </button>
                      )}
                    </Menu.Item>
                  </Menu.Items>
                </Transition>
              </Menu>
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
                    'flex w-full items-center justify-center rounded-lg px-3 py-2.5 text-sm font-medium leading-5',
                    'ring-white ring-opacity-60 ring-offset-2 ring-offset-primary-400 focus:outline-none focus:ring-2',
                    selected
                      ? 'bg-white text-primary-700 shadow dark:bg-secondary-700 dark:text-primary-400'
                      : 'text-secondary-700 hover:bg-white/[0.12] hover:text-secondary-900 dark:text-secondary-400 dark:hover:text-white'
                  )
                }
              >
                <tab.icon className="mr-2 h-5 w-5" />
                {tab.name}
              </Tab>
            ))}
          </Tab.List>

          <Tab.Panels className="mt-4">
            <Tab.Panel>
              {showImport && !selectedFile && !importUrl ? (
                <ImportForm
                  method={importMethod}
                  onFileSelect={handleFileSelect}
                  onUrlSubmit={handleUrlImport}
                />
              ) : (
                <FormBuilderComponent
                  form={formConfig}
                  onChange={setFormConfig}
                />
              )}
            </Tab.Panel>
            <Tab.Panel>
              <RespondentInterface form={formConfig} isPreview />
            </Tab.Panel>
          </Tab.Panels>
        </Tab.Group>
      </div>

      <ProcessingModal
        isOpen={!!selectedFile || (!!importUrl && isProcessing)}
        onClose={() => {
          setShowImport(false);
          setSelectedFile(undefined);
          setExtractedForm(undefined);
          setImportUrl('');
        }}
        file={selectedFile}
        url={importUrl}
        method={importMethod}
        extractedForm={extractedForm}
        isProcessing={isProcessing}
        onAccept={handleAcceptExtractedForm}
      />
    </div>
  );
} 