import { Form, FormAnalytics } from '../../schemas/form';
import { ResponseTimelineChart } from './ResponseTimelineChart';
import { FieldCompletionChart } from './FieldCompletionChart';
import { Hoverable3D } from '../Hoverable3D';

interface AnalyticsTabProps {
  form: Form;
  analytics: FormAnalytics;
}

export function AnalyticsTab({ form, analytics }: AnalyticsTabProps) {
  // Transform field completion data to include field labels and voice usage
  const fieldCompletionData = analytics.fieldCompletion.map((field) => {
    const fieldConfig = form.fields.find((f) => f.id === field.fieldId);
    return {
      fieldId: field.fieldId,
      fieldLabel: fieldConfig?.label || 'Unknown Field',
      completionRate: field.completionRate,
      voiceUsageRate: field.voiceUsageRate,
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

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <Hoverable3D intensity="medium" className="group">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-secondary-800 sm:p-6">
            <dt className="truncate text-sm font-medium text-secondary-500 group-hover:text-primary-500 dark:text-secondary-400 dark:group-hover:text-primary-400">
              Total Responses
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-secondary-900 group-hover:text-primary-600 dark:text-white dark:group-hover:text-primary-400">
              {analytics.totalResponses}
            </dd>
          </div>
        </Hoverable3D>

        <Hoverable3D intensity="medium" className="group">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-secondary-800 sm:p-6">
            <dt className="truncate text-sm font-medium text-secondary-500 group-hover:text-accent-purple-500 dark:text-secondary-400 dark:group-hover:text-accent-purple-400">
              Form Completion Rate
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-secondary-900 group-hover:text-accent-purple-600 dark:text-white dark:group-hover:text-accent-purple-400">
              {Math.round(analytics.completionRate * 100)}%
            </dd>
          </div>
        </Hoverable3D>

        <Hoverable3D intensity="medium" className="group">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-secondary-800 sm:p-6">
            <dt className="truncate text-sm font-medium text-secondary-500 group-hover:text-accent-teal-500 dark:text-secondary-400 dark:group-hover:text-accent-teal-400">
              Voice Adoption Rate
            </dt>
            <dd className="mt-1 text-3xl font-semibold tracking-tight text-secondary-900 group-hover:text-accent-teal-600 dark:text-white dark:group-hover:text-accent-teal-400">
              {Math.round(analytics.voiceAdoptionRate * 100)}%
            </dd>
          </div>
        </Hoverable3D>

        <Hoverable3D intensity="medium" className="group">
          <div className="overflow-hidden rounded-lg bg-white px-4 py-5 shadow dark:bg-secondary-800 sm:p-6">
            <dt className="truncate text-sm font-medium text-secondary-500 group-hover:text-accent-amber-500 dark:text-secondary-400 dark:group-hover:text-accent-amber-400">
              Avg. Completion Time
            </dt>
            <dd className="mt-1 text-2xl font-semibold tracking-tight text-secondary-900 group-hover:text-accent-amber-600 dark:text-white dark:group-hover:text-accent-amber-400">
              {Math.round(analytics.averageCompletionTime.total / 60)}m {Math.round(analytics.averageCompletionTime.total % 60)}s
              <div className="mt-1 flex items-center gap-x-2 text-sm text-secondary-500 dark:text-secondary-400">
                <span>Voice: {Math.round(analytics.averageCompletionTime.voice / 60)}m {Math.round(analytics.averageCompletionTime.voice % 60)}s</span>
                <span>•</span>
                <span>Manual: {Math.round(analytics.averageCompletionTime.manual / 60)}m {Math.round(analytics.averageCompletionTime.manual % 60)}s</span>
              </div>
            </dd>
          </div>
        </Hoverable3D>
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