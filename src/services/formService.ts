import { formSchema, formResponseSchema, formAnalyticsSchema } from '../schemas/form';
import type { 
  Form, 
  FormResponse, 
  FormAnalytics,
  FormPermission,
  FormPermissionRole,
  FormScope 
} from '../schemas/form';
import { config } from '../config';
import { createRequestValidator, createResponseValidator } from '../utils/validation';
import { z } from 'zod';
import { mockForms, mockResponses, mockAnalytics } from '../config/mockData';

// Validators
const validateForm = createResponseValidator(formSchema);
const validateFormResponse = createResponseValidator(formResponseSchema);
const validateFormAnalytics = createResponseValidator(formAnalyticsSchema);
const validateFormSubmission = createRequestValidator(formResponseSchema.pick({ data: true }));

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

class FormService {
  async getForm(id: string): Promise<Form> {
    if (config.environment === 'local-ui') {
      const form = mockForms.find(f => f.id === id);
      if (!form) {
        throw new Error(`Form not found: ${id}`);
      }
      return validateForm(form);
    }

    const response = await fetch(`${config.apiUrl}/forms/${id}`);
    const data = await response.json();
    return validateForm(data);
  }

  async getForms(): Promise<Form[]> {
    if (config.environment === 'local-ui') {
      return z.array(formSchema).parse(mockForms);
    }

    const response = await fetch(`${config.apiUrl}/forms`);
    const data = await response.json();
    return z.array(formSchema).parse(data);
  }

  async getFormResponses(formId: string): Promise<FormResponse[]> {
    if (config.environment === 'local-ui') {
      return z.array(formResponseSchema).parse(mockResponses[formId] || []);
    }

    const response = await fetch(`${config.apiUrl}/forms/${formId}/responses`);
    const data = await response.json();
    return z.array(formResponseSchema).parse(data);
  }

  async getFormAnalytics(formId: string): Promise<FormAnalytics> {
    if (config.environment === 'local-ui') {
      const analytics = mockAnalytics[formId];
      if (!analytics) {
        throw new Error(`Analytics not found for form: ${formId}`);
      }
      return validateFormAnalytics(analytics);
    }

    const response = await fetch(`${config.apiUrl}/forms/${formId}/analytics`);
    const data = await response.json();
    return validateFormAnalytics(data);
  }

  async submitFormResponse(formId: string, data: Record<string, string>): Promise<void> {
    validateFormSubmission({ data });
    
    if (config.environment === 'local-ui') {
      console.log('Mock form submission:', { formId, data });
      return;
    }

    await fetch(`${config.apiUrl}/forms/${formId}/responses`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ data }),
    });
  }

  async updateForm(id: string, updates: Partial<Form>): Promise<Form> {
    if (config.environment === 'local-ui') {
      const form = await this.getForm(id);
      const updatedForm = { ...form, ...updates, updatedAt: new Date().toISOString() };
      return validateForm(updatedForm);
    }

    const response = await fetch(`${config.apiUrl}/forms/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    const data = await response.json();
    return validateForm(data);
  }

  async createForm(form: Omit<Form, 'id'>): Promise<Form> {
    if (config.environment === 'local-ui') {
      const newForm: Form = {
        ...form,
        id: generateId(),
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        scope: form.scope || 'personal', // Default to personal scope
        permissions: form.scope === 'team' ? [
          {
            userId: form.userId,
            role: 'owner',
            addedAt: new Date().toISOString(),
            addedBy: form.userId,
          }
        ] : undefined,
      };
      return validateForm(newForm);
    }

    const response = await fetch(`${config.apiUrl}/forms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    const data = await response.json();
    return validateForm(data);
  }

  async cloneForm(id: string): Promise<Form> {
    if (config.environment === 'local-ui') {
      const form = await this.getForm(id);
      const newForm: Form = {
        ...form,
        id: generateId(),
        title: `${form.title} (Copy)`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responseCount: 0,
        scope: form.scope,
        permissions: form.scope === 'team' ? [
          {
            userId: form.userId,
            role: 'owner',
            addedAt: new Date().toISOString(),
            addedBy: form.userId,
          }
        ] : undefined,
      };
      return validateForm(newForm);
    }

    const response = await fetch(`${config.apiUrl}/forms/${id}/clone`, {
      method: 'POST',
    });
    const data = await response.json();
    return validateForm(data);
  }

  async updateFormPermissions(formId: string, permissions: FormPermission[]): Promise<Form> {
    if (config.environment === 'local-ui') {
      const form = await this.getForm(formId);
      const updatedForm = { 
        ...form, 
        permissions,
        updatedAt: new Date().toISOString() 
      };
      return validateForm(updatedForm);
    }

    const response = await fetch(`${config.apiUrl}/forms/${formId}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions }),
    });
    const data = await response.json();
    return validateForm(data);
  }

  async addFormPermission(formId: string, permission: Omit<FormPermission, 'addedAt'>): Promise<Form> {
    if (config.environment === 'local-ui') {
      const form = await this.getForm(formId);
      const newPermission = {
        ...permission,
        addedAt: new Date().toISOString(),
      };
      const updatedForm = {
        ...form,
        permissions: [...(form.permissions || []), newPermission],
        updatedAt: new Date().toISOString(),
      };
      return validateForm(updatedForm);
    }

    const response = await fetch(`${config.apiUrl}/forms/${formId}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(permission),
    });
    const data = await response.json();
    return validateForm(data);
  }

  async removeFormPermission(formId: string, userId: string): Promise<Form> {
    if (config.environment === 'local-ui') {
      const form = await this.getForm(formId);
      const updatedForm = {
        ...form,
        permissions: form.permissions?.filter(p => p.userId !== userId) || [],
        updatedAt: new Date().toISOString(),
      };
      return validateForm(updatedForm);
    }

    const response = await fetch(`${config.apiUrl}/forms/${formId}/permissions/${userId}`, {
      method: 'DELETE',
    });
    const data = await response.json();
    return validateForm(data);
  }

  async getAccessibleForms(userId: string): Promise<Form[]> {
    if (config.environment === 'local-ui') {
      return z.array(formSchema).parse(
        mockForms.filter(form => 
          form.userId === userId || // Creator
          form.scope === 'personal' || // Personal forms
          form.permissions?.some(p => p.userId === userId) // Has permission
        )
      );
    }

    const response = await fetch(`${config.apiUrl}/forms/accessible/${userId}`);
    const data = await response.json();
    return z.array(formSchema).parse(data);
  }
}

export const formService = new FormService();

type ImportMethod = 'pdf' | 'image' | 'url';

class FormImportService {
  async extractFormFields(file: File | string, method: ImportMethod): Promise<Form> {
    if (config.environment === 'local-ui') {
      // Mock form extraction
      const mockExtractedForm: Form = {
        id: `form-${Date.now()}`,
        title: 'Extracted Form',
        description: 'Form extracted from uploaded file',
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
            label: 'Email Address',
            required: true,
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'user-1',
        status: 'draft',
        responseCount: 0,
        scope: 'personal' as const,
      };
      return validateForm(mockExtractedForm);
    }

    // In non-local environments, send to backend
    const formData = new FormData();
    if (typeof file === 'string') {
      formData.append('url', file);
    } else {
      formData.append('file', file);
    }
    formData.append('method', method);

    const response = await fetch(`${config.apiUrl}/forms/import`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error(`Failed to process ${method}`);
    }

    return response.json();
  }

  async createForm(form: Form): Promise<Form> {
    if (config.environment === 'local-ui') {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        ...form,
        id: Math.random().toString(36).substring(7),
      };
    }

    const response = await fetch(`${config.apiUrl}/forms`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      throw new Error('Failed to create form');
    }

    return response.json();
  }

  async updateForm(id: string, form: Form): Promise<Form> {
    if (config.environment === 'local-ui') {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 500));

      return {
        ...form,
        updatedAt: new Date().toISOString(),
      };
    }

    const response = await fetch(`${config.apiUrl}/forms/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(form),
    });

    if (!response.ok) {
      throw new Error('Failed to update form');
    }

    return response.json();
  }
}

export const formImportService = new FormImportService(); 