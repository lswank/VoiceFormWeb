import { Form, FormResponse, FormAnalytics } from '../types/form';
import { config } from '../config';

export type { Form, FormResponse, FormAnalytics };

// Helper functions
function generateId(): string {
  return Math.random().toString(36).substring(2, 15);
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

// Generate mock responses for a form
const generateMockResponses = (form: Form): FormResponse[] => {
  return Array.from({ length: form.responseCount }, () => ({
    id: generateId(),
    formId: form.id,
    submittedAt: randomDate(new Date(2023, 0, 1), new Date()).toISOString(),
    data: form.fields.reduce((acc: Record<string, string>, field) => {
      if (field.type === 'select' && field.options) {
        const option = field.options[Math.floor(Math.random() * field.options.length)];
        acc[field.id] = option.value;
      } else if (field.type === 'multiselect' && field.options) {
        const selectedOptions = field.options
          .filter(() => Math.random() > 0.5)
          .map(opt => opt.value);
        acc[field.id] = selectedOptions.join(', ');
      } else if (field.type === 'email') {
        acc[field.id] = 'test@example.com';
      } else if (field.type === 'phone') {
        acc[field.id] = '+1 (555) 123-4567';
      } else {
        acc[field.id] = `Sample response for ${field.label}`;
      }
      return acc;
    }, {}),
  }));
};

// Mock data for development
const mockForms: Form[] = [
  {
    id: '1',
    title: 'Customer Feedback',
    description: 'Help us improve our service',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Name',
        placeholder: 'Enter your name',
        required: true,
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email',
        placeholder: 'Enter your email',
        required: true,
      },
      {
        id: 'rating',
        type: 'select',
        label: 'Rating',
        options: [
          { value: '5', label: 'Excellent' },
          { value: '4', label: 'Good' },
          { value: '3', label: 'Average' },
          { value: '2', label: 'Poor' },
          { value: '1', label: 'Very Poor' },
        ],
        required: true,
      },
      {
        id: 'feedback',
        type: 'voice',
        label: 'Feedback',
        placeholder: 'Share your thoughts',
        required: true,
      },
    ],
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date().toISOString(),
    userId: 'user-1',
    status: 'published',
    responseCount: 5,
  },
  {
    id: '2',
    title: 'Event Registration',
    description: 'Register for our upcoming event',
    fields: [
      {
        id: 'name',
        type: 'text',
        label: 'Full Name',
        required: true,
      },
      {
        id: 'email',
        type: 'email',
        label: 'Email',
        required: true,
      },
      {
        id: 'phone',
        type: 'text',
        label: 'Phone',
        required: false,
      },
      {
        id: 'dietary',
        type: 'select',
        label: 'Dietary Preferences',
        options: [
          { value: 'none', label: 'None' },
          { value: 'vegetarian', label: 'Vegetarian' },
          { value: 'vegan', label: 'Vegan' },
          { value: 'gluten-free', label: 'Gluten-Free' },
        ],
        required: false,
      },
    ],
    createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
    userId: 'user-1',
    status: 'draft',
    responseCount: 0,
  },
];

// Generate mock responses for all forms
const mockResponses: Record<string, FormResponse[]> = mockForms.reduce((acc, form) => {
  acc[form.id] = generateMockResponses(form);
  return acc;
}, {} as Record<string, FormResponse[]>);

class FormService {
  async getForm(id: string): Promise<Form> {
    const form = mockForms.find((f) => f.id === id);
    if (!form) {
      throw new Error(`Form not found: ${id}`);
    }
    return Promise.resolve(form);
  }

  async getForms(): Promise<Form[]> {
    return Promise.resolve(mockForms);
  }

  async getFormResponses(formId: string): Promise<FormResponse[]> {
    return Promise.resolve(mockResponses[formId] || []);
  }

  async getFormAnalytics(formId: string): Promise<FormAnalytics> {
    return Promise.resolve({
      totalResponses: 5,
      averageCompletionTime: 180,
      completionRate: 0.85,
      responseTimeline: Array.from({ length: 30 }, (_, i) => ({
        date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toISOString(),
        count: Math.floor(Math.random() * 10),
      })),
      fieldCompletion: [
        { fieldId: 'name', completionRate: 0.95 },
        { fieldId: 'email', completionRate: 0.9 },
        { fieldId: 'rating', completionRate: 0.85 },
        { fieldId: 'feedback', completionRate: 0.75 },
      ],
    });
  }

  async submitFormResponse(formId: string, data: Record<string, string>): Promise<void> {
    console.log('Mock form submission:', { formId, data });
    return Promise.resolve();
  }

  async updateForm(id: string, updates: Partial<Form>): Promise<Form> {
    const form = await this.getForm(id);
    const updatedForm = { ...form, ...updates, updatedAt: new Date().toISOString() };
    
    // In local-ui mode, just return the updated form
    // In production, this would make an API call
    return Promise.resolve(updatedForm);
  }

  async createForm(form: Omit<Form, 'id'>): Promise<Form> {
    const newForm: Form = {
      ...form,
      id: `form-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // In local-ui mode, just return the new form
    // In production, this would make an API call
    return Promise.resolve(newForm);
  }

  async cloneForm(id: string): Promise<Form> {
    const form = await this.getForm(id);
    const clonedForm: Form = {
      ...form,
      id: `cloned-${Date.now()}`,
      title: `${form.title} (Copy)`,
      status: 'draft',
      responseCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    
    // In local-ui mode, just return the cloned form
    // In production, this would make an API call
    return Promise.resolve(clonedForm);
  }
}

export const formService = new FormService(); 