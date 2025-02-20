import type { Form, Field, FieldOption, FieldType, FormStatus, FormScope } from '../schemas/form';
import type { FormResponse, FormAnalytics } from '../schemas/form';

// Helper functions
function generateId(index: number): string {
  return `form-${index}`;
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Sample field configurations
const sampleFields: Field[] = [
  {
    id: 'name',
    type: 'text' as const,
    label: 'Full Name',
    required: true,
    placeholder: 'John Doe',
  },
  {
    id: 'email',
    type: 'email' as const,
    label: 'Email Address',
    required: true,
    placeholder: 'john@example.com',
  },
  {
    id: 'phone',
    type: 'phone' as const,
    label: 'Phone Number',
    required: false,
    placeholder: '+1 (555) 123-4567',
  },
  {
    id: 'feedback',
    type: 'textarea' as const,
    label: 'Feedback',
    required: true,
    placeholder: 'Please share your thoughts...',
  },
  {
    id: 'rating',
    type: 'select' as const,
    label: 'Rating',
    required: true,
    options: [
      { value: '5', label: 'Excellent' },
      { value: '4', label: 'Good' },
      { value: '3', label: 'Average' },
      { value: '2', label: 'Poor' },
      { value: '1', label: 'Very Poor' },
    ],
  },
  {
    id: 'topics',
    type: 'multiselect' as const,
    label: 'Topics of Interest',
    required: false,
    options: [
      { value: 'product', label: 'Product' },
      { value: 'service', label: 'Service' },
      { value: 'support', label: 'Support' },
      { value: 'billing', label: 'Billing' },
      { value: 'other', label: 'Other' },
    ],
  },
];

// Generate a mock form
const generateMockForm = (index: number): Form => {
  const status: FormStatus = Math.random() > 0.7 ? 'draft' : 'published';
  const scope: FormScope = Math.random() > 0.5 ? 'personal' : 'team';
  return {
    id: generateId(index),
    title: `Form ${index + 1}`,
    description: `Description for Form ${index + 1}`,
    createdAt: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    userId: '1',
    fields: sampleFields.slice(0, Math.floor(Math.random() * 4) + 3),
    status,
    scope,
    responseCount: Math.floor(Math.random() * 100),
  };
};

// Generate mock forms
export const mockForms: Form[] = Array.from({ length: 10 }, (_, i) => generateMockForm(i + 1));

// Generate mock responses for a form
const generateMockResponses = (form: Form): FormResponse[] => {
  return Array.from({ length: form.responseCount }, () => ({
    id: generateId(Math.floor(Math.random() * 100)),
    formId: form.id,
    submittedAt: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
    data: form.fields.reduce((acc, field) => {
      if (field.type === 'select' && field.options) {
        acc[field.id] = field.options[Math.floor(Math.random() * field.options.length)].label;
      } else if (field.type === 'multiselect' && field.options) {
        const selectedOptions = field.options
          .filter(() => Math.random() > 0.5)
          .map(opt => opt.label);
        acc[field.id] = selectedOptions.join(', ');
      } else if (field.type === 'email') {
        acc[field.id] = 'test@example.com';
      } else if (field.type === 'phone') {
        acc[field.id] = '+1 (555) 123-4567';
      } else {
        acc[field.id] = `Sample response for ${field.label}`;
      }
      return acc;
    }, {} as Record<string, string>),
  }));
};

// Generate mock responses for all forms
export const mockResponses: Record<string, FormResponse[]> = mockForms.reduce((acc, form) => {
  acc[form.id] = generateMockResponses(form);
  return acc;
}, {} as Record<string, FormResponse[]>);

// Generate mock analytics for a form
const generateMockAnalytics = (form: Form): FormAnalytics => ({
  totalResponses: form.responseCount,
  completionRate: Math.random() * 0.3 + 0.7, // 70-100%
  voiceAdoptionRate: Math.random() * 0.4 + 0.6, // 60-100%
  averageCompletionTime: {
    total: Math.floor(Math.random() * 300) + 60, // 1-6 minutes
    voice: Math.floor(Math.random() * 180) + 30, // 0.5-3.5 minutes
    manual: Math.floor(Math.random() * 420) + 60, // 1-8 minutes
  },
  responseTimeline: Array.from({ length: 30 }, (_, i) => ({
    date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    count: Math.floor(Math.random() * 10),
  })),
  fieldCompletion: form.fields.map(field => ({
    fieldId: field.id,
    completionRate: Math.random() * 0.2 + 0.8, // 80-100%
    voiceUsageRate: Math.random() * 0.4 + 0.6, // 60-100%
  })),
  activeForms7d: Math.floor(Math.random() * form.responseCount * 0.3), // ~30% of total responses in last 7 days
});

// Generate mock analytics for all forms
export const mockAnalytics: Record<string, FormAnalytics> = mockForms.reduce((acc, form) => {
  acc[form.id] = generateMockAnalytics(form);
  return acc;
}, {} as Record<string, FormAnalytics>); 