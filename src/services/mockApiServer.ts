import { createServer, Model, Response, Factory, ActiveModelSerializer } from 'miragejs';
import { v4 as uuidv4 } from 'uuid';

// Mock data import is commented out - we'll define it inline for this example
// import { mockForms, mockUsers } from '../config/mockData';

// Setup mock server
export function makeServer({ environment = 'development' } = {}) {
  const server = createServer({
    environment,
    serializers: {
      application: ActiveModelSerializer,
    },

    models: {
      user: Model,
      form: Model,
      formResponse: Model,
      formPermission: Model,
      emailPreference: Model,
    },

    // Define factories for generating mock data
    factories: {
      user: Factory.extend({
        id: () => uuidv4(),
        email: (i) => `user${i}@example.com`,
        name: (i) => `User ${i}`,
        organizationName: (i) => `Organization ${i}`,
        role: 'user',
        createdAt: () => new Date().toISOString(),
        updatedAt: () => new Date().toISOString(),
      }),

      form: Factory.extend({
        id: () => uuidv4(),
        title: (i) => `Form ${i}`,
        description: (i) => `Description for form ${i}`,
        fields: () => [
          {
            id: uuidv4(),
            type: 'text',
            label: 'Name',
            placeholder: 'Enter your name',
            required: true,
          },
          {
            id: uuidv4(),
            type: 'voice',
            label: 'Comments',
            placeholder: 'Speak your comments',
            required: false,
          },
        ],
        settings: {
          allowAnonymousResponses: true,
          confirmationMessage: 'Thank you for your submission',
          redirectUrl: '',
          sendConfirmationEmail: true,
          notifyOnSubmission: true,
        },
        createdAt: () => new Date().toISOString(),
        updatedAt: () => new Date().toISOString(),
      }),

      formResponse: Factory.extend({
        id: () => uuidv4(),
        data: () => ({ name: 'John Doe', comments: 'This is a test response' }),
        completedAt: () => new Date().toISOString(),
        startedAt: () => new Date(Date.now() - 300000).toISOString(),
        ipAddress: '127.0.0.1',
        userAgent: 'Mock Browser',
      }),

      formPermission: Factory.extend({
        role: 'viewer',
      }),

      emailPreference: Factory.extend({
        formSubmissionNotifications: true,
        responseNotifications: true,
        marketingEmails: true,
      }),
    },

    seeds(server) {
      // Create mock users
      const user1 = server.create('user', { 
        email: 'admin@example.com', 
        name: 'Admin User',
        role: 'admin',
      });
      
      const user2 = server.create('user', { 
        email: 'test@example.com', 
        name: 'Test User',
      });

      // Create mock forms
      const form1 = server.create('form', { title: 'Customer Feedback' });
      const form2 = server.create('form', { title: 'Job Application' });
      const form3 = server.create('form', { title: 'Event Registration' });

      // Create form permissions
      server.create('formPermission', { formId: form1.id, userId: user1.id, role: 'owner' });
      server.create('formPermission', { formId: form2.id, userId: user1.id, role: 'owner' });
      server.create('formPermission', { formId: form3.id, userId: user1.id, role: 'owner' });
      server.create('formPermission', { formId: form1.id, userId: user2.id, role: 'editor' });

      // Create form responses
      server.createList('formResponse', 5, { formId: form1.id });
      server.createList('formResponse', 3, { formId: form2.id });
      
      // Create email preferences
      server.create('emailPreference', { userId: user1.id });
      server.create('emailPreference', { userId: user2.id });
    },

    routes() {
      this.namespace = 'v1';
      this.timing = 750; // Add delay to simulate network

      // AUTH ENDPOINTS
      this.post('/auth/login', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const user = schema.users.findBy({ email: attrs.email });

        if (user) {
          return {
            success: true,
            user: user.attrs,
          };
        } else {
          return new Response(401, {}, { 
            code: 'INVALID_CREDENTIALS',
            message: 'Invalid email or password' 
          });
        }
      });

      this.post('/auth/register', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const existingUser = schema.users.findBy({ email: attrs.email });

        if (existingUser) {
          return new Response(400, {}, { 
            code: 'EMAIL_IN_USE',
            message: 'Email already in use' 
          });
        }

        const user = schema.users.create({
          ...attrs,
          id: uuidv4(),
          role: 'user',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });

        return {
          success: true,
          user: user.attrs,
        };
      });

      this.post('/auth/logout', () => {
        return { success: true };
      });

      this.post('/auth/sso/:provider', (schema) => {
        const user = schema.users.first();
        return {
          success: true,
          user: user.attrs,
        };
      });

      this.post('/auth/forgot-password', () => {
        return { success: true };
      });

      // FORM ENDPOINTS
      this.get('/forms', (schema) => {
        return schema.forms.all();
      });

      this.get('/forms/:id', (schema, request) => {
        const id = request.params.id;
        const form = schema.forms.find(id);
        
        if (!form) {
          return new Response(404, {}, { 
            code: 'FORM_NOT_FOUND',
            message: 'Form not found' 
          });
        }
        
        return form;
      });

      this.post('/forms', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const form = schema.forms.create({
          ...attrs,
          id: attrs.id || uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        // Create owner permission for the form creator
        const user = schema.users.first();
        schema.formPermissions.create({
          formId: form.id,
          userId: user.id,
          role: 'owner',
        });
        
        return form;
      });

      this.patch('/forms/:id', (schema, request) => {
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);
        const form = schema.forms.find(id);
        
        if (!form) {
          return new Response(404, {}, { 
            code: 'FORM_NOT_FOUND',
            message: 'Form not found' 
          });
        }
        
        return form.update({
          ...attrs,
          updatedAt: new Date().toISOString(),
        });
      });

      this.post('/forms/:id/clone', (schema, request) => {
        const id = request.params.id;
        const form = schema.forms.find(id);
        
        if (!form) {
          return new Response(404, {}, { 
            code: 'FORM_NOT_FOUND',
            message: 'Form not found' 
          });
        }
        
        const newForm = schema.forms.create({
          ...form.attrs,
          id: uuidv4(),
          title: `${form.attrs.title} (Copy)`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        // Create owner permission for the form cloner
        const user = schema.users.first();
        schema.formPermissions.create({
          formId: newForm.id,
          userId: user.id,
          role: 'owner',
        });
        
        return newForm;
      });

      // FORM PERMISSIONS
      this.get('/forms/:formId/permissions', (schema, request) => {
        const formId = request.params.formId;
        return schema.formPermissions.where({ formId });
      });

      this.put('/forms/:formId/permissions', (schema, request) => {
        const formId = request.params.formId;
        const permissions = JSON.parse(request.requestBody);
        
        // Delete existing permissions
        schema.formPermissions.where({ formId }).destroy();
        
        // Create new permissions
        const newPermissions = permissions.map(permission => 
          schema.formPermissions.create({
            ...permission,
            formId,
          })
        );
        
        return newPermissions;
      });

      this.post('/forms/:formId/permissions', (schema, request) => {
        const formId = request.params.formId;
        const permission = JSON.parse(request.requestBody);
        
        return schema.formPermissions.create({
          ...permission,
          formId,
        });
      });

      this.delete('/forms/:formId/permissions/:userId', (schema, request) => {
        const { formId, userId } = request.params;
        
        schema.formPermissions.findBy({ formId, userId }).destroy();
        
        return new Response(204);
      });

      // FORM RESPONSES
      this.get('/forms/:formId/responses', (schema, request) => {
        const formId = request.params.formId;
        const page = parseInt(request.queryParams.page || '1');
        const limit = parseInt(request.queryParams.limit || '20');
        
        const responses = schema.formResponses.where({ formId }).models;
        const total = responses.length;
        const pages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginatedResponses = responses.slice(offset, offset + limit);
        
        return {
          data: paginatedResponses,
          pagination: {
            total,
            pages,
            page,
            limit
          }
        };
      });

      this.post('/forms/:formId/responses', (schema, request) => {
        const formId = request.params.formId;
        const attrs = JSON.parse(request.requestBody);
        
        const form = schema.forms.find(formId);
        if (!form) {
          return new Response(404, {}, { 
            code: 'FORM_NOT_FOUND',
            message: 'Form not found' 
          });
        }
        
        return schema.formResponses.create({
          ...attrs,
          id: uuidv4(),
          formId,
          completedAt: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          userAgent: request.requestHeaders['User-Agent'],
        });
      });

      // ANALYTICS
      this.get('/forms/:formId/analytics', (schema, request) => {
        const formId = request.params.formId;
        const responses = schema.formResponses.where({ formId });
        
        return {
          formId,
          responseCount: responses.length,
          completionRate: 0.87,
          averageCompletionTime: 124, // seconds
          fieldCompletionRates: {
            'field-1': 0.95,
            'field-2': 0.78,
            'field-3': 0.62,
          },
          responseTimeline: [
            { date: '2023-01-01', count: 5 },
            { date: '2023-01-02', count: 8 },
            { date: '2023-01-03', count: 12 },
            { date: '2023-01-04', count: 7 },
            { date: '2023-01-05', count: 10 },
          ]
        };
      });

      // AI SERVICE
      this.post('/ai/process', (schema, request) => {
        const formData = request.requestBody;
        // In a real implementation, we would process the audio file here
        
        return {
          text: 'This is the transcribed text from voice input',
          confidence: 0.92,
          alternatives: [
            'This is the transcribed text for voice input',
            'This is transcribed text from voice input'
          ]
        };
      });

      this.post('/ai/clarify', () => {
        return {
          prompts: [
            'Could you please elaborate on that?',
            'Can you provide more details?',
            'Would you mind explaining further?'
          ]
        };
      });

      this.post('/ai/validate', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const value = attrs.value || '';
        
        // Simple validation example
        const valid = value.length > 0;
        
        return {
          valid,
          message: valid ? 'Valid input' : 'Input is required'
        };
      });

      // EMAIL SERVICE
      this.post('/email/submission-confirmation', () => {
        return { success: true };
      });

      this.post('/email/response-notification', () => {
        return { success: true };
      });

      this.put('/email/preferences', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const userId = attrs.userId || schema.users.first().id;
        
        let preferences = schema.emailPreferences.findBy({ userId });
        
        if (preferences) {
          preferences.update(attrs);
        } else {
          preferences = schema.emailPreferences.create({
            ...attrs,
            userId,
          });
        }
        
        return preferences;
      });

      this.get('/email/preferences/:userId', (schema, request) => {
        const userId = request.params.userId;
        let preferences = schema.emailPreferences.findBy({ userId });
        
        if (!preferences) {
          preferences = schema.emailPreferences.create({
            userId,
            formSubmissionNotifications: true,
            responseNotifications: true,
            marketingEmails: true,
          });
        }
        
        return preferences;
      });

      this.post('/email/unsubscribe', () => {
        return { success: true };
      });

      // PDF SERVICE
      this.post('/pdf/extract', () => {
        return {
          fields: [
            {
              id: uuidv4(),
              type: 'text',
              label: 'Full Name',
              placeholder: 'Enter your full name',
              required: true,
            },
            {
              id: uuidv4(),
              type: 'email',
              label: 'Email Address',
              placeholder: 'Enter your email address',
              required: true,
            },
            {
              id: uuidv4(),
              type: 'text',
              label: 'Phone Number',
              placeholder: 'Enter your phone number',
              required: false,
            },
          ]
        };
      });
    },
  });

  return server;
}