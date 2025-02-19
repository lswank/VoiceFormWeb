import { Form, FormAnalytics } from '../../types/form';
import { ResponseTimelineChart } from './ResponseTimelineChart';
import { FieldCompletionChart } from './FieldCompletionChart';

interface AnalyticsTabProps {
  form: Form;
  analytics: FormAnalytics;
}

export function AnalyticsTab({ form, analytics }: AnalyticsTabProps) {
  // Transform field completion data to include field labels
  const fieldCompletionData = analytics.fieldCompletion.map((field) => {
    const fieldConfig = form.fields.find((f) => f.id === field.fieldId);
    return {
      fieldId: field.fieldId,
      fieldLabel: fieldConfig?.label || 'Unknown Field',
      completionRate: field.completionRate,
    };
  });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-xl font-semibold text-secondary-900 dark:text-white">
          Analytics
        </h2>
        <p className="mt-2 text-sm text-secondary-700 dark:text-secondary-400">
          View form performance and insights
        </p>
      </div>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-secondary-800 sm:p-6">
          <dt className="truncate text-sm font-medium text-secondary-500 dark:text-secondary-400">
            Total Responses
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-secondary-900 dark:text-white">
            {analytics.totalResponses}
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-secondary-800 sm:p-6">
          <dt className="truncate text-sm font-medium text-secondary-500 dark:text-secondary-400">
            Average Completion Time
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-secondary-900 dark:text-white">
            {Math.floor(analytics.averageCompletionTime / 60)}m{' '}
            {Math.floor(analytics.averageCompletionTime % 60)}s
          </dd>
        </div>
        <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-secondary-800 sm:p-6">
          <dt className="truncate text-sm font-medium text-secondary-500 dark:text-secondary-400">
            Completion Rate
          </dt>
          <dd className="mt-1 text-3xl font-semibold tracking-tight text-secondary-900 dark:text-white">
            {Math.round(analytics.completionRate * 100)}%
          </dd>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="h-96 rounded-lg bg-white p-6 shadow dark:bg-secondary-800">
          <ResponseTimelineChart data={analytics.responseTimeline} />
        </div>
        <div className="h-96 rounded-lg bg-white p-6 shadow dark:bg-secondary-800">
          <FieldCompletionChart data={fieldCompletionData} />
        </div>
      </div>
    </div>
  );
} 