import { z } from 'zod';
import api from './index';
import { formSchema, formResponseSchema, formAnalyticsSchema } from '../schemas/form';

// Define the FormPermission type
export interface FormPermission {
  userId: string;
  role: 'owner' | 'editor' | 'viewer';
}

// Forms API methods
export const formsApi = {
  /**
   * Get all forms for the authenticated user
   */
  listForms: () => 
    api.get('/forms', z.array(formSchema)),
  
  /**
   * Get a specific form by ID
   */
  getForm: (formId: string) => 
    api.get(`/forms/${formId}`, formSchema),
  
  /**
   * Create a new form
   */
  createForm: (formData: z.infer<typeof formSchema>) => 
    api.post('/forms', formData, formSchema),
  
  /**
   * Update a form
   */
  updateForm: (formId: string, formData: z.infer<typeof formSchema>) => 
    api.patch(`/forms/${formId}`, formData, formSchema),
  
  /**
   * Clone an existing form
   */
  cloneForm: (formId: string) => 
    api.post(`/forms/${formId}/clone`, undefined, formSchema),
  
  /**
   * Import a form from file or URL
   */
  importForm: (fileOrUrl: FormData) => 
    api.post('/forms/import', fileOrUrl, formSchema),
  
  /**
   * Get form permissions
   */
  getFormPermissions: (formId: string) => 
    api.get(`/forms/${formId}/permissions`, z.array(z.object({
      userId: z.string().uuid(),
      role: z.enum(['owner', 'editor', 'viewer'])
    }))),
  
  /**
   * Update all form permissions
   */
  updateFormPermissions: (formId: string, permissions: FormPermission[]) => 
    api.put(`/forms/${formId}/permissions`, permissions, z.array(z.object({
      userId: z.string().uuid(),
      role: z.enum(['owner', 'editor', 'viewer'])
    }))),
  
  /**
   * Add a new permission to a form
   */
  addFormPermission: (formId: string, permission: FormPermission) => 
    api.post(`/forms/${formId}/permissions`, permission, z.object({
      userId: z.string().uuid(),
      role: z.enum(['owner', 'editor', 'viewer'])
    })),
  
  /**
   * Remove a user's permission from a form
   */
  removeFormPermission: (formId: string, userId: string) => 
    api.delete(`/forms/${formId}/permissions/${userId}`),
  
  /**
   * Get forms accessible to a user
   */
  getAccessibleForms: (userId: string) => 
    api.get(`/forms/accessible/${userId}`, z.array(formSchema)),
};

// Form responses API methods
export const responsesApi = {
  /**
   * Get responses for a specific form
   */
  getFormResponses: (formId: string, page = 1, limit = 20) => 
    api.get(`/forms/${formId}/responses?page=${page}&limit=${limit}`, z.object({
      data: z.array(formResponseSchema),
      pagination: z.object({
        total: z.number(),
        pages: z.number(),
        page: z.number(),
        limit: z.number()
      })
    })),
  
  /**
   * Submit a form response
   */
  submitFormResponse: (formId: string, responseData: any, respondentId?: string) => {
    const payload = {
      data: responseData,
      respondentId,
      startedAt: new Date().toISOString()
    };
    
    return api.post(`/forms/${formId}/responses`, payload, formResponseSchema);
  }
};

// Analytics API methods
export const analyticsApi = {
  /**
   * Get analytics for a specific form
   */
  getFormAnalytics: (formId: string) => 
    api.get(`/forms/${formId}/analytics`, formAnalyticsSchema)
};

export default {
  ...formsApi,
  responses: responsesApi,
  analytics: analyticsApi
};