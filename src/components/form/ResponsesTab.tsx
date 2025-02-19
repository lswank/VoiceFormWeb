import { Popover, Transition } from '@headlessui/react';
import { Fragment } from 'react';
import { 
  ArrowDownTrayIcon,
  DocumentArrowDownIcon,
  TableCellsIcon,
  CodeBracketIcon,
  ChevronDownIcon
} from '@heroicons/react/24/outline';
import type { Form, FormResponse } from '../../schemas/form';

interface ResponsesTabProps {
  form: Form;
}

export function ResponsesTab({ form }: ResponsesTabProps) {
  // Mock responses for now
  const responses: FormResponse[] = [
    {
      id: '1',
      formId: form.id,
      data: {
        name: 'John Doe',
        email: 'john@example.com',
      },
      submittedAt: new Date().toISOString(),
    },
  ];

  const handleExport = (format: 'csv' | 'excel' | 'json') => {
    // TODO: Implement export functionality
    console.log('Exporting responses as:', format);
  };

  return (
    <div className="space-y-6">
      <div className="sm:flex sm:items-center">
        <div className="sm:flex-auto">
          <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
            Responses
          </h2>
          <p className="mt-2 text-sm text-secondary-700 dark:text-secondary-400">
            View and manage form responses
          </p>
        </div>
        <div className="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
          <Popover className="relative">
            {({ open }) => (
              <>
                <Popover.Button
                  className="inline-flex items-center gap-x-2 rounded-md bg-primary-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-600"
                >
                  <ArrowDownTrayIcon className="-ml-0.5 h-5 w-5" aria-hidden="true" />
                  Export
                  <ChevronDownIcon className={`h-5 w-5 transition-transform ${open ? 'rotate-180' : ''}`} aria-hidden="true" />
                </Popover.Button>
                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="opacity-0 translate-y-1"
                  enterTo="opacity-100 translate-y-0"
                  leave="transition ease-in duration-150"
                  leaveFrom="opacity-100 translate-y-0"
                  leaveTo="opacity-0 translate-y-1"
                >
                  <Popover.Panel className="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-2 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none dark:bg-secondary-800 dark:ring-secondary-700">
                    <button
                      onClick={() => handleExport('csv')}
                      className="flex w-full items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:bg-secondary-700"
                    >
                      <TableCellsIcon className="mr-3 h-5 w-5 text-secondary-400" />
                      CSV
                    </button>
                    <button
                      onClick={() => handleExport('excel')}
                      className="flex w-full items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:bg-secondary-700"
                    >
                      <DocumentArrowDownIcon className="mr-3 h-5 w-5 text-secondary-400" />
                      Excel
                    </button>
                    <button
                      onClick={() => handleExport('json')}
                      className="flex w-full items-center px-4 py-2 text-sm text-secondary-700 hover:bg-secondary-50 dark:text-secondary-300 dark:hover:bg-secondary-700"
                    >
                      <CodeBracketIcon className="mr-3 h-5 w-5 text-secondary-400" />
                      JSON
                    </button>
                  </Popover.Panel>
                </Transition>
              </>
            )}
          </Popover>
        </div>
      </div>

      <div className="mt-8 flow-root">
        <div className="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
          <div className="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
            <table className="min-w-full divide-y divide-secondary-300 dark:divide-secondary-700">
              <thead>
                <tr>
                  <th
                    scope="col"
                    className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-secondary-900 dark:text-white sm:pl-0"
                  >
                    Submitted
                  </th>
                  {responses.length > 0 &&
                    Object.keys(responses[0].data).map((key) => (
                      <th
                        key={key}
                        scope="col"
                        className="px-3 py-3.5 text-left text-sm font-semibold text-secondary-900 dark:text-white"
                      >
                        {key.charAt(0).toUpperCase() + key.slice(1)}
                      </th>
                    ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-secondary-200 dark:divide-secondary-700">
                {responses.map((response) => (
                  <tr key={response.id}>
                    <td className="whitespace-nowrap py-4 pl-4 pr-3 text-sm text-secondary-900 dark:text-white sm:pl-0">
                      {new Date(response.submittedAt).toLocaleString()}
                    </td>
                    {Object.values(response.data).map((value, index) => (
                      <td
                        key={index}
                        className="whitespace-nowrap px-3 py-4 text-sm text-secondary-500 dark:text-secondary-400"
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
} 