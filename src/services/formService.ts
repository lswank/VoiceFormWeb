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
import { validateApiResponse, validateApiResponseWithProperty } from '../utils/validation';

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
    return validateApiResponseWithProperty(response, formSchema, 'form');
  }

  async getForms(): Promise<Form[]> {
    if (config.environment === 'local-ui') {
      return mockForms.map(validateForm);
    }

    const response = await fetch(`${config.apiUrl}/forms`);
    return validateApiResponse(response, z.array(formSchema));
  }

  async getFormResponses(formId: string): Promise<FormResponse[]> {
    if (config.environment === 'local-ui') {
      return (mockResponses[formId] || []).map(response => validateFormResponse(response));
    }

    const response = await fetch(`${config.apiUrl}/forms/${formId}/responses`);
    return validateApiResponse(response, z.array(formResponseSchema));
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
    return validateApiResponse(response, formAnalyticsSchema);
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
    // We're validating the full form after updating - no need for partial validation here

    if (config.environment === 'local-ui') {
      const formIndex = mockForms.findIndex(f => f.id === id);
      if (formIndex === -1) {
        throw new Error(`Form not found: ${id}`);
      }
      
      const updatedForm = {
        ...mockForms[formIndex],
        ...updates,
        updatedAt: new Date().toISOString(),
      };
      
      mockForms[formIndex] = updatedForm;
      return validateForm(updatedForm);
    }

    const response = await fetch(`${config.apiUrl}/forms/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(updates),
    });
    
    return validateApiResponseWithProperty(response, formSchema, 'form');
  }

  async createForm(form: Omit<Form, 'id'>): Promise<Form> {
    if (config.environment === 'local-ui') {
      const newForm = {
        ...form,
        id: `form-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responseCount: 0,
      };
      
      mockForms.push(newForm as Form);
      return validateForm(newForm as Form);
    }

    const response = await fetch(`${config.apiUrl}/forms`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    });
    
    return validateApiResponseWithProperty(response, formSchema, 'form');
  }

  async cloneForm(id: string): Promise<Form> {
    if (config.environment === 'local-ui') {
      const originalForm = mockForms.find(f => f.id === id);
      if (!originalForm) {
        throw new Error(`Form not found: ${id}`);
      }
      
      const newForm = {
        ...originalForm,
        id: `form-${Date.now()}`,
        title: `Copy of ${originalForm.title}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        responseCount: 0,
      };
      
      mockForms.push(newForm);
      return validateForm(newForm);
    }

    const response = await fetch(`${config.apiUrl}/forms/${id}/clone`, {
      method: 'POST',
    });
    
    return validateApiResponseWithProperty(response, formSchema, 'form');
  }

  async updateFormPermissions(formId: string, permissions: FormPermission[]): Promise<Form> {
    if (config.environment === 'local-ui') {
      const form = await this.getForm(formId);
      const updatedForm = { 
        ...form, 
        permissions,
        updatedAt: new Date().toISOString(),
      };
      
      const index = mockForms.findIndex(f => f.id === formId);
      mockForms[index] = updatedForm;
      
      return validateForm(updatedForm);
    }

    const response = await fetch(`${config.apiUrl}/forms/${formId}/permissions`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ permissions }),
    });
    
    return validateApiResponseWithProperty(response, formSchema, 'form');
  }

  async addFormPermission(formId: string, permission: Omit<FormPermission, 'addedAt'>): Promise<Form> {
    if (config.environment === 'local-ui') {
      const form = await this.getForm(formId);
      
      if (!form.permissions) {
        form.permissions = [];
      }
      
      const existingPermission = form.permissions.find(p => p.userId === permission.userId);
      if (existingPermission) {
        throw new Error(`User already has permission for this form`);
      }
      
      const newPermission = {
        ...permission,
        addedAt: new Date().toISOString(),
      };
      
      const updatedPermissions = [...form.permissions, newPermission];
      return this.updateFormPermissions(formId, updatedPermissions);
    }

    const response = await fetch(`${config.apiUrl}/forms/${formId}/permissions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(permission),
    });
    
    return validateApiResponseWithProperty(response, formSchema, 'form');
  }

  async removeFormPermission(formId: string, userId: string): Promise<Form> {
    if (config.environment === 'local-ui') {
      const form = await this.getForm(formId);
      
      if (!form.permissions || form.permissions.length === 0) {
        throw new Error(`No permissions to remove`);
      }
      
      const updatedPermissions = form.permissions.filter(p => p.userId !== userId);
      
      if (updatedPermissions.length === form.permissions.length) {
        throw new Error(`User does not have permission for this form`);
      }
      
      return this.updateFormPermissions(formId, updatedPermissions);
    }

    const response = await fetch(`${config.apiUrl}/forms/${formId}/permissions/${userId}`, {
      method: 'DELETE',
    });
    
    return validateApiResponseWithProperty(response, formSchema, 'form');
  }

  async getAccessibleForms(userId: string): Promise<Form[]> {
    if (config.environment === 'local-ui') {
      // In local-ui mode, all forms are accessible
      return mockForms.map(validateForm);
    }

    const response = await fetch(`${config.apiUrl}/users/${userId}/forms`);
    return validateApiResponse(response, z.array(formSchema));
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