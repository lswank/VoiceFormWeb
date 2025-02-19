import { Fragment } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { 
  DocumentMagnifyingGlassIcon, 
  PhotoIcon,
  LinkIcon,
  CheckCircleIcon,
} from '@heroicons/react/24/outline';
import { Button } from './Button';
import type { Form } from '../schemas/form';
import { FormBuilder } from './form/FormBuilder';

type ImportMethod = 'pdf' | 'image' | 'url';

interface ProcessingModalProps {
  isOpen: boolean;
  onClose: () => void;
  file?: File;
  url?: string;
  method: ImportMethod;
  extractedForm?: Form;
  isProcessing: boolean;
  onAccept: (form: Form) => void;
}

export function ProcessingModal({
  isOpen,
  onClose,
  file,
  url,
  method,
  extractedForm,
  isProcessing,
  onAccept,
}: ProcessingModalProps) {
  const getIcon = () => {
    switch (method) {
      case 'pdf':
        return DocumentMagnifyingGlassIcon;
      case 'image':
        return PhotoIcon;
      case 'url':
        return LinkIcon;
    }
  };

  const getProcessingText = () => {
    switch (method) {
      case 'pdf':
        return `Analyzing ${file?.name} to extract form fields...`;
      case 'image':
        return `Processing ${file?.name} to extract form fields...`;
      case 'url':
        return `Importing form from ${url}...`;
    }
  };

  const Icon = getIcon();

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
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
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all dark:bg-secondary-800 sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
                {isProcessing ? (
                  <div className="text-center">
                    <Icon
                      className="mx-auto h-12 w-12 animate-pulse text-primary-600 dark:text-primary-400"
                      aria-hidden="true"
                    />
                    <Dialog.Title
                      as="h3"
                      className="mt-4 text-base font-semibold leading-6 text-secondary-900 dark:text-white"
                    >
                      Processing {method.toUpperCase()}
                    </Dialog.Title>
                    <div className="mt-2">
                      <p className="text-sm text-secondary-500 dark:text-secondary-400">
                        {getProcessingText()}
                      </p>
                    </div>
                  </div>
                ) : extractedForm ? (
                  <div>
                    <div className="text-center">
                      <CheckCircleIcon
                        className="mx-auto h-12 w-12 text-green-600 dark:text-green-400"
                        aria-hidden="true"
                      />
                      <Dialog.Title
                        as="h3"
                        className="mt-4 text-base font-semibold leading-6 text-secondary-900 dark:text-white"
                      >
                        Form Fields Extracted
                      </Dialog.Title>
                      <div className="mt-2">
                        <p className="text-sm text-secondary-500 dark:text-secondary-400">
                          Review and customize the extracted form fields below.
                        </p>
                      </div>
                    </div>

                    <div className="mt-6 max-h-[60vh] overflow-y-auto">
                      <FormBuilder
                        form={extractedForm}
                        onChange={(form) => {
                          // Allow editing the extracted form before accepting
                          extractedForm = form;
                        }}
                      />
                    </div>

                    <div className="mt-6 flex justify-end gap-3">
                      <Button variant="secondary" onClick={onClose}>
                        Cancel
                      </Button>
                      <Button onClick={() => onAccept(extractedForm!)}>
                        Accept and Create Form
                      </Button>
                    </div>
                  </div>
                ) : null}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 