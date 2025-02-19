import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { formService } from '../services/formService';
import { Form, FormAnalytics } from '../types/form';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';

interface FormWithAnalytics {
  form: Form;
  analytics: FormAnalytics;
}

function UsageStats({ formsWithAnalytics }: { formsWithAnalytics: FormWithAnalytics[] }) {
  const totalForms = formsWithAnalytics.length;
  const totalResponses = formsWithAnalytics.reduce((sum, { analytics }) => sum + analytics.totalResponses, 0);
  const activeFormsCount = formsWithAnalytics.filter(({ analytics }) => analytics.totalResponses > 0).length;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-secondary-800 sm:p-6">
        <dt className="truncate text-sm font-medium text-secondary-500 dark:text-secondary-400">Total Forms</dt>
        <dd className="mt-1 text-3xl font-semibold tracking-tight text-secondary-900 dark:text-white">{totalForms}</dd>
      </div>
      <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-secondary-800 sm:p-6">
        <dt className="truncate text-sm font-medium text-secondary-500 dark:text-secondary-400">Total Responses</dt>
        <dd className="mt-1 text-3xl font-semibold tracking-tight text-secondary-900 dark:text-white">{totalResponses}</dd>
      </div>
      <Link 
        to="/forms?collection=published"
        className="group overflow-hidden rounded-lg bg-white px-4 py-5 shadow transition-all hover:shadow-md dark:bg-secondary-800 sm:p-6"
      >
        <dt className="truncate text-sm font-medium text-secondary-500 group-hover:text-primary-600 dark:text-secondary-400 dark:group-hover:text-primary-400">Active Forms</dt>
        <dd className="mt-1 text-3xl font-semibold tracking-tight text-secondary-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">{activeFormsCount}</dd>
      </Link>
    </div>
  );
}

function RecentForms({ formsWithAnalytics }: { formsWithAnalytics: FormWithAnalytics[] }) {
  const recentForms = [...formsWithAnalytics]
    .sort((a, b) => new Date(b.form.updatedAt).getTime() - new Date(a.form.updatedAt).getTime())
    .slice(0, 5);

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-secondary-800">
      <div className="p-6">
        <h3 className="text-base font-semibold leading-6 text-secondary-900 dark:text-white">
          Recent Forms
        </h3>
        <div className="mt-6 flow-root">
          <ul className="-my-5 divide-y divide-secondary-200 dark:divide-secondary-700">
            {recentForms.map(({ form, analytics }) => (
              <li key={form.id} className="py-5">
                <div className="relative focus-within:ring-2 focus-within:ring-primary-500">
                  <h3 className="text-sm font-semibold text-secondary-800 dark:text-secondary-200">
                    <Link to={`/forms/${form.id}`} className="hover:underline focus:outline-none">
                      <span className="absolute inset-0" aria-hidden="true" />
                      {form.title}
                    </Link>
                  </h3>
                  <div className="mt-1 flex items-center gap-x-2 text-sm text-secondary-500 dark:text-secondary-400">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Updated {new Date(form.updatedAt).toLocaleDateString()}</span>
                    <span className="mx-1">•</span>
                    <span>{analytics.totalResponses} responses</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

function RecentActivity({ formsWithAnalytics }: { formsWithAnalytics: FormWithAnalytics[] }) {
  // Create recent activity from analytics timeline data
  const recentActivity = formsWithAnalytics
    .flatMap(({ form, analytics }) => 
      analytics.responseTimeline
        .filter(timeline => timeline.count > 0)
        .map(timeline => ({
          id: `${form.id}-${timeline.date}`,
          formId: form.id,
          formTitle: form.title,
          count: timeline.count,
          timestamp: timeline.date,
        }))
    )
    .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
    .slice(0, 5);

  return (
    <div className="overflow-hidden rounded-lg bg-white shadow dark:bg-secondary-800">
      <div className="p-6">
        <h3 className="text-base font-semibold leading-6 text-secondary-900 dark:text-white">
          Recent Activity
        </h3>
        <div className="mt-6 flow-root">
          <ul className="-my-5 divide-y divide-secondary-200 dark:divide-secondary-700">
            {recentActivity.map((activity) => (
              <li key={activity.id} className="py-5">
                <div className="relative focus-within:ring-2 focus-within:ring-primary-500">
                  <h3 className="text-sm font-semibold text-secondary-800 dark:text-secondary-200">
                    {activity.count} new {activity.count === 1 ? 'response' : 'responses'} for{' '}
                    <Link to={`/forms/${activity.formId}`} className="hover:underline focus:outline-none">
                      {activity.formTitle}
                    </Link>
                  </h3>
                  <div className="mt-1 flex items-center gap-x-2 text-sm text-secondary-500 dark:text-secondary-400">
                    <ClockIcon className="h-4 w-4" />
                    <span>{new Date(activity.timestamp).toLocaleString()}</span>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export function Dashboard() {
  const [formsWithAnalytics, setFormsWithAnalytics] = useState<FormWithAnalytics[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchFormsAndAnalytics = async () => {
      try {
        const forms = await formService.getForms();
        const formsWithAnalytics = await Promise.all(
          forms.map(async (form) => ({
            form,
            analytics: await formService.getFormAnalytics(form.id),
          }))
        );
        setFormsWithAnalytics(formsWithAnalytics);
      } catch (err) {
        setError('Failed to load forms. Please try again later.');
        console.error('Error fetching forms:', err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFormsAndAnalytics();
  }, []);

  if (isLoading) {
    return (
      <div className="flex justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-200 border-t-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-md bg-red-50 p-4 dark:bg-red-900">
        <p className="text-sm text-red-700 dark:text-red-200">{error}</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Usage Stats */}
      <UsageStats formsWithAnalytics={formsWithAnalytics} />

      {/* Two Column Layout for Recent Forms and Activity */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <RecentForms formsWithAnalytics={formsWithAnalytics} />
        <RecentActivity formsWithAnalytics={formsWithAnalytics} />
      </div>
    </div>
  );
} 