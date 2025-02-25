import { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { formService } from '../services/formService';
import type { Form, FormAnalytics } from '../schemas/form';
import { CalendarIcon, ClockIcon } from '@heroicons/react/24/outline';
import { ChatBubbleLeftIcon, CheckIcon, MicrophoneIcon, DocumentTextIcon } from '@heroicons/react/24/outline';
import { Hoverable3D } from '../components/Hoverable3D';

interface FormWithAnalytics {
  form: Form;
  analytics: FormAnalytics;
}

interface IconPosition {
  x: number;
  y: number;
}

function StatCard({ 
  title, 
  value, 
  icon: Icon, 
  color,
  href,
}: { 
  title: string;
  value: string | number;
  icon: React.ComponentType<React.ComponentProps<'svg'>>;
  color: 'primary' | 'purple' | 'teal' | 'amber';
  href: string;
}) {
  const colorClasses = {
    primary: {
      hover: 'group-hover:text-primary-600 dark:group-hover:text-primary-400',
      icon: 'text-primary-600/75 dark:text-primary-400/75 group-hover:text-primary-600 dark:group-hover:text-primary-400'
    },
    purple: {
      hover: 'group-hover:text-accent-purple-600 dark:group-hover:text-accent-purple-400',
      icon: 'text-accent-purple-600/75 dark:text-accent-purple-400/75 group-hover:text-accent-purple-600 dark:group-hover:text-accent-purple-400'
    },
    teal: {
      hover: 'group-hover:text-accent-teal-600 dark:group-hover:text-accent-teal-400',
      icon: 'text-accent-teal-600/75 dark:text-accent-teal-400/75 group-hover:text-accent-teal-600 dark:group-hover:text-accent-teal-400'
    },
    amber: {
      hover: 'group-hover:text-accent-amber-600 dark:group-hover:text-accent-amber-400',
      icon: 'text-accent-amber-600/75 dark:text-accent-amber-400/75 group-hover:text-accent-amber-600 dark:group-hover:text-accent-amber-400'
    }
  };

  return (
    <Hoverable3D as={Link} to={href} className="group card-gradient overflow-hidden">
      <div className="relative px-4 py-5 sm:p-6">
        <dt className={`truncate text-sm font-medium text-secondary-500 ${colorClasses[color].hover} dark:text-secondary-400`}>
          {title}
        </dt>
        <dd className="mt-1 flex items-baseline">
          <div className={`flex items-baseline text-3xl font-semibold text-secondary-900 ${colorClasses[color].hover} dark:text-white`}>
            {value}
          </div>
        </dd>
        <div className="absolute bottom-1 right-1 h-16 w-16 transition-opacity group-hover:opacity-100">
          <Icon className={`h-full w-full transform-gpu transition-colors ${colorClasses[color].icon}`} />
        </div>
      </div>
    </Hoverable3D>
  );
}

function UsageStats({ formsWithAnalytics }: { formsWithAnalytics: FormWithAnalytics[] }) {
  // Calculate aggregated metrics
  const totalResponses = formsWithAnalytics.reduce((sum, { analytics }) => sum + analytics.totalResponses, 0);
  const averageCompletionRate = formsWithAnalytics.reduce((sum, { analytics }) => sum + analytics.completionRate, 0) / formsWithAnalytics.length;
  const voiceUsageRate = formsWithAnalytics.reduce((sum, { analytics }) => sum + analytics.voiceAdoptionRate, 0) / formsWithAnalytics.length;
  const activeForms7d = formsWithAnalytics.filter(({ form }) => {
    const lastWeek = new Date();
    lastWeek.setDate(lastWeek.getDate() - 7);
    return new Date(form.updatedAt) >= lastWeek;
  }).length;

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Total Responses"
        value={totalResponses}
        icon={ChatBubbleLeftIcon}
        color="primary"
        href="/forms"
      />
      <StatCard
        title="Form Completion Rate"
        value={`${Math.round(averageCompletionRate * 100)}%`}
        icon={CheckIcon}
        color="purple"
        href="/forms"
      />
      <StatCard
        title="Voice Usage Rate"
        value={`${Math.round(voiceUsageRate * 100)}%`}
        icon={MicrophoneIcon}
        color="teal"
        href="/forms"
      />
      <StatCard
        title="Active Forms (7d)"
        value={activeForms7d}
        icon={DocumentTextIcon}
        color="amber"
        href="/forms?collection=active"
      />
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
                <Link to={`/forms/${form.id}`} className="block hover:bg-secondary-50 dark:hover:bg-secondary-700/50 rounded-md transition-colors">
                  <Hoverable3D 
                    intensity="small" 
                    shadowOpacity={0.05}
                    className="group relative focus-within:ring-2 focus-within:ring-primary-500"
                  >
                    <div className="relative">
                      <h3 className="text-sm font-semibold text-secondary-800 dark:text-secondary-200">
                        <span className="hover:underline focus:outline-none">
                          {form.title}
                        </span>
                      </h3>
                      <div className="mt-1 flex items-center gap-x-2 text-sm text-secondary-500 dark:text-secondary-400">
                        <CalendarIcon className="h-4 w-4 transition-colors group-hover:text-primary-500 dark:group-hover:text-primary-400" />
                        <span>Updated {new Date(form.updatedAt).toLocaleDateString()}</span>
                        <span className="mx-1">•</span>
                        <span>{analytics.totalResponses} responses</span>
                      </div>
                    </div>
                  </Hoverable3D>
                </Link>
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
                <Link to={`/forms/${activity.formId}`} className="block hover:bg-secondary-50 dark:hover:bg-secondary-700/50 rounded-md transition-colors">
                  <Hoverable3D 
                    intensity="small" 
                    shadowOpacity={0.05}
                    className="group relative focus-within:ring-2 focus-within:ring-primary-500"
                  >
                    <div className="relative">
                      <h3 className="text-sm font-semibold text-secondary-800 dark:text-secondary-200">
                        <span className="hover:underline focus:outline-none">
                          {activity.count} new {activity.count === 1 ? 'response' : 'responses'} for{' '}
                          {activity.formTitle}
                        </span>
                      </h3>
                      <div className="mt-1 flex items-center gap-x-2 text-sm text-secondary-500 dark:text-secondary-400">
                        <ClockIcon className="h-4 w-4 transition-colors group-hover:text-primary-500 dark:group-hover:text-primary-400" />
                        <span>{new Date(activity.timestamp).toLocaleString()}</span>
                      </div>
                    </div>
                  </Hoverable3D>
                </Link>
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