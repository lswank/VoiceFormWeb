import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { CheckCircleIcon } from '@heroicons/react/24/outline';
import { formService, type Form } from '../services/formService';

export function FormSuccess() {
  const { id } = useParams<{ id: string }>();
  const [form, setForm] = useState<Form | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchForm = async () => {
      if (!id) return;

      try {
        const data = await formService.getForm(id);
        setForm(data);
      } catch (err) {
        setError('Failed to load form details.');
        console.error('Error fetching form:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchForm();
  }, [id]);

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  if (error || !form) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="rounded-md bg-red-50 p-4 dark:bg-red-900">
          <p className="text-sm text-red-700 dark:text-red-200">
            {error || 'Failed to load form details.'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
        <CheckCircleIcon
          className="h-6 w-6 text-green-600 dark:text-green-400"
          aria-hidden="true"
        />
      </div>
      <div className="mt-3 text-center">
        <h3 className="text-lg font-medium leading-6 text-secondary-900 dark:text-white">
          Response Submitted
        </h3>
        <div className="mt-2">
          <p className="text-sm text-secondary-500 dark:text-secondary-400">
            Thank you for completing {form.title}. Your response has been recorded.
          </p>
        </div>
        <div className="mt-6">
          <Link
            to={`/respond/${id}`}
            className="text-sm font-medium text-primary-600 hover:text-primary-500 dark:text-primary-400 dark:hover:text-primary-300"
          >
            Submit another response
          </Link>
        </div>
      </div>
    </div>
  );
} 