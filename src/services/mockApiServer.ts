import { createServer, Model, Response, Factory, ActiveModelSerializer } from 'miragejs';
import { v4 as uuidv4 } from 'uuid';
import usersData from '../data/mock/users.json';
import formsData from '../data/mock/forms.json';
import formResponsesData from '../data/mock/formResponses.json';
import formPermissionsData from '../data/mock/formPermissions.json';
import emailPreferencesData from '../data/mock/emailPreferences.json';

// Import our mock data
import { 
  mockUsers, 
  mockForms, 
  mockFormResponses, 
  mockFormPermissions, 
  mockEmailPreferences 
} from '../data/mockData';

// Type definitions for MirageJS
interface FormField {
  id: string;
  type: string;
  label: string;
  placeholder?: string;
  required: boolean;
  options?: Array<{ label: string; value: string }>;
  min?: number;
  max?: number;
  step?: number;
}

interface FormSettings {
  allowAnonymousResponses: boolean;
  confirmationMessage: string;
  redirectUrl: string;
  sendConfirmationEmail: boolean;
  notifyOnSubmission: boolean;
}

interface FormData {
  id: string;
  userId: string;
  title: string;
  description: string;
  fields: string | FormField[]; // string for storage, FormField[] when parsed
  settings: FormSettings;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

interface UserData {
  id: string;
  email: string;
  name: string;
  [key: string]: any;
}

interface FormResponseData {
  id: string;
  formId: string;
  respondentId?: string;
  data: any;
  submittedAt: string;
}

interface FormPermissionData {
  id: string;
  formId: string;
  userId: string;
  role: string;
  addedAt: string;
  addedBy: string;
}

interface EmailPreferenceData {
  id: string;
  userId: string;
  receiveNewResponses: boolean;
  receiveDailyDigest: boolean;
  receiveWeeklyReport: boolean;
}

// Setup mock server
export function makeServer({ environment = 'development' }: { environment?: string } = {}) {
  console.log(`Creating MirageJS server in ${environment} environment...`);
  
  const server = createServer({
    environment,
    serializers: {
      application: ActiveModelSerializer,
    },

    models: {
      user: Model.extend<Partial<UserData>>({}),
      form: Model.extend<Partial<FormData>>({}),
      formResponse: Model.extend<Partial<FormResponseData>>({}),
      formPermission: Model.extend<Partial<FormPermissionData>>({}),
      emailPreference: Model.extend<Partial<EmailPreferenceData>>({}),
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
        fields: () => JSON.stringify([
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
        ]),
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
        formId: () => uuidv4(),
        data: () => ({}),
        completedAt: () => new Date().toISOString(),
        startedAt: () => new Date(Date.now() - 300000).toISOString(),
        ipAddress: '127.0.0.1',
        userAgent: 'Mock Browser',
      }),

      formPermission: Factory.extend({
        id: () => uuidv4(),
        formId: () => uuidv4(),
        userId: () => uuidv4(),
        role: 'viewer',
      }),

      emailPreference: Factory.extend({
        id: () => uuidv4(),
        userId: () => uuidv4(),
        formSubmissionNotifications: true,
        responseNotifications: true,
        marketingEmails: true,
      }),
    },

    seeds(server) {
      console.log('Seeding MirageJS database with mock data...');
      
      try {
        // Log what we're about to load
        console.log(`Loading mock data: 
          Users: ${usersData.length}
          Forms: ${formsData.length}
          Responses: ${formResponsesData.length}
          Permissions: ${formPermissionsData.length}
          Email Prefs: ${emailPreferencesData.length}
        `);
        
        // Load users
        usersData.forEach(user => {
          server.create('user', user);
        });
        console.log(`Created ${usersData.length} users in DB`);
        
        // Load forms - stringify fields
        formsData.forEach(form => {
          const formWithStringFields = {
            ...form,
            // Convert fields to string if they're not already
            fields: typeof form.fields === 'string' ? form.fields : JSON.stringify(form.fields)
          };
          server.create('form', formWithStringFields);
        });
        console.log(`Created ${formsData.length} forms in DB`);
        
        // Load form responses
        formResponsesData.forEach(response => {
          server.create('formResponse', response);
        });
        console.log(`Created ${formResponsesData.length} form responses in DB`);
        
        // Load form permissions
        formPermissionsData.forEach(permission => {
          server.create('formPermission', permission);
        });
        console.log(`Created ${formPermissionsData.length} form permissions in DB`);
        
        // Load email preferences
        emailPreferencesData.forEach(preference => {
          server.create('emailPreference', preference);
        });
        console.log(`Created ${emailPreferencesData.length} email preferences in DB`);
        
        // Log the database state
        console.log('Database seeded with:', {
          users: server.db.users.length,
          forms: server.db.forms.length,
          responses: server.db.formResponses.length,
          permissions: server.db.formPermissions.length,
          emailPreferences: server.db.emailPreferences.length
        });
      } catch (error) {
        console.error('Error seeding mock database:', error);
      }
    },

    routes() {
      console.log("Setting up MirageJS routes...");
      
      // IMPORTANT: Make sure namespace matches expected API path
      this.namespace = 'api';
      this.timing = 500; // Add some delay to simulate real network conditions
      
      console.log("MirageJS routes configured with namespace:", this.namespace);
      
      // Log all requests for debugging
      this.pretender.handledRequest = function(verb, path, request) {
        console.log(`[Mock API] ${verb} ${path}`);
      };

      // AUTH ENDPOINTS
      this.post('/auth/login', (schema, request) => {
        console.log('AUTH: Login attempt');
        const attrs = JSON.parse(request.requestBody);
        
        const user = schema.db.users.findBy({ email: attrs.email });
        
        if (!user) {
          console.log('AUTH: Login failed - user not found');
          return new Response(
            401,
            { 'Content-Type': 'application/json' },
            { message: 'Invalid email or password' }
          );
        }
        
        console.log('AUTH: Login successful', user.id);
        return {
          user,
          token: 'mock-jwt-token'
        };
      });

      this.get('/auth/me', (schema, request) => {
        console.log('AUTH: Get current user');
        const user = schema.db.users.findBy({ id: 'user-1' }); // Simplified - always return first user
        console.log('AUTH: Returning user', user?.id || 'none');
        return user;
      });

      this.post('/auth/register', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const existingUser = schema.db.users.findBy({ email: attrs.email });

        if (existingUser) {
          return new Response(400, {}, { 
            code: 'EMAIL_IN_USE',
            message: 'Email already in use' 
          });
        }

        const user = schema.create('user', {
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
        const user = schema.db.users[0];
        return {
          success: true,
          user: user,
        };
      });

      this.post('/auth/forgot-password', () => {
        return { success: true };
      });

      // FORM ENDPOINTS
      this.get('/forms', (schema, request) => {
        console.log('[Mock API] GET /forms - Processing request');
        try {
          const formsFromDb = schema.db.forms || [];
          console.log(`[Mock API] Found ${formsFromDb.length} forms in DB`);
          
          // Create array to return
          const forms = formsFromDb.map(form => {
            try {
              // Parse fields if they're stored as a string
              let fields = typeof form.fields === 'string' ? JSON.parse(form.fields) : form.fields;
              
              // Map incompatible field types to compatible ones
              fields = fields.map((field: any) => {
                const fieldCopy = { ...field };
                
                // Transform field types to match what's expected by the schema
                switch(fieldCopy.type) {
                  case 'radio':
                    fieldCopy.type = 'select';
                    break;
                  case 'checkbox-group':
                    fieldCopy.type = 'multiselect';
                    break;
                  case 'file':
                    fieldCopy.type = 'text';
                    break;
                  case 'slider':
                    fieldCopy.type = 'number';
                    break;
                  case 'captcha':
                    fieldCopy.type = 'text';
                    break;
                }
                
                return fieldCopy;
              });
              
              // Format response to match API format
              return {
                id: form.id,
                title: form.title,
                description: form.description,
                fields: fields,
                settings: form.settings,
                status: form.status || 'draft',
                createdAt: form.createdAt,
                updatedAt: form.updatedAt,
                userId: form.userId || 'user-1',
                responseCount: 0,
                scope: 'personal'
              };
            } catch (error) {
              console.error('[Mock API] Error processing form:', error);
              return form;
            }
          });
          
          console.log(`[Mock API] Returning ${forms.length} forms`);
          // Return wrapped in an object with forms property
          return { forms };
        } catch (error) {
          console.error('[Mock API] Error in GET /forms:', error);
          return new Response(500, {}, { error: 'Internal server error' });
        }
      });

      this.get('/forms/:id', (schema, request) => {
        console.log(`[Mock API] GET /forms/${request.params.id} - Processing request`);
        try {
          const formRecord = schema.db.forms.findBy({ id: request.params.id });
          
          if (!formRecord) {
            console.error(`[Mock API] Form with ID ${request.params.id} not found`);
            return new Response(404, {}, { error: 'Form not found' });
          }
          
          // Parse fields if they're stored as a string
          let fields = typeof formRecord.fields === 'string' ? JSON.parse(formRecord.fields) : formRecord.fields;
          
          // Map incompatible field types to compatible ones
          fields = fields.map((field: any) => {
            const fieldCopy = { ...field };
            
            // Transform field types to match what's expected by the schema
            switch(fieldCopy.type) {
              case 'radio':
                fieldCopy.type = 'select';
                break;
              case 'checkbox-group':
                fieldCopy.type = 'multiselect';
                break;
              case 'file':
                fieldCopy.type = 'text';
                break;
              case 'slider':
                fieldCopy.type = 'number';
                break;
              case 'captcha':
                fieldCopy.type = 'text';
                break;
            }
            
            return fieldCopy;
          });
          
          // Format response to match API format
          const form = {
            id: formRecord.id,
            title: formRecord.title,
            description: formRecord.description,
            fields: fields,
            settings: formRecord.settings,
            status: formRecord.status || 'draft',
            createdAt: formRecord.createdAt,
            updatedAt: formRecord.updatedAt,
            userId: formRecord.userId || 'user-1',
            responseCount: 0,
            scope: 'personal'
          };
          
          console.log('[Mock API] Found form:', form.id, form.title);
          return { form };  // Return wrapped in form object
        } catch (error) {
          console.error('[Mock API] Error in GET /forms/:id:', error);
          return new Response(500, {}, { error: 'Internal server error' });
        }
      });

      this.post('/forms', (schema, request) => {
        const attrs = JSON.parse(request.requestBody);
        const formFields = attrs.fields || [];
        
        const form = schema.create('form', {
          ...attrs,
          fields: JSON.stringify(formFields),
          id: attrs.id || uuidv4(),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        // Create owner permission for the form creator
        const user = schema.db.users[0];
        schema.create('formPermission', {
          id: uuidv4(),
          formId: form.id,
          userId: user.id,
          role: 'owner',
        });
        
        // Return with parsed fields
        return {
          ...form.attrs,
          fields: formFields
        };
      });

      this.patch('/forms/:id', (schema, request) => {
        const id = request.params.id;
        const attrs = JSON.parse(request.requestBody);
        const form = schema.db.forms.find(id);
        
        if (!form) {
          return new Response(404, {}, { 
            code: 'FORM_NOT_FOUND',
            message: 'Form not found' 
          });
        }
        
        // Handle fields serialization
        const formFields = attrs.fields || JSON.parse(form.fields || '[]');
        
        // Remove the old form and create a new one with updated data
        schema.db.forms.remove(id);
        const updatedForm = schema.create('form', {
          ...form,
          ...attrs,
          fields: JSON.stringify(formFields),
          updatedAt: new Date().toISOString(),
        });
        
        // Return with parsed fields
        return {
          ...updatedForm.attrs,
          fields: formFields
        };
      });

      this.post('/forms/:id/clone', (schema, request) => {
        const id = request.params.id;
        const form = schema.db.forms.find(id);
        
        if (!form) {
          return new Response(404, {}, { 
            code: 'FORM_NOT_FOUND',
            message: 'Form not found' 
          });
        }
        
        // Parse fields if needed
        const formFields = JSON.parse(form.fields || '[]');
        
        const newForm = schema.create('form', {
          ...form,
          id: uuidv4(),
          title: `${form.title} (Copy)`,
          fields: JSON.stringify(formFields),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        });
        
        // Create owner permission for the form cloner
        const user = schema.db.users[0];
        schema.create('formPermission', {
          id: uuidv4(),
          formId: newForm.id,
          userId: user.id,
          role: 'owner',
        });
        
        // Return with parsed fields
        return {
          ...newForm.attrs,
          fields: formFields
        };
      });

      // FORM PERMISSIONS
      this.get('/forms/:formId/permissions', (schema, request) => {
        const formId = request.params.formId;
        return schema.db.formPermissions.where({ formId });
      });

      this.put('/forms/:formId/permissions', (schema, request) => {
        const formId = request.params.formId;
        const permissions = JSON.parse(request.requestBody);
        
        // Delete existing permissions
        schema.db.formPermissions.where({ formId }).forEach((permission: any) => {
          schema.db.formPermissions.remove(permission.id);
        });
        
        // Create new permissions
        const newPermissions = permissions.map((permission: any) => 
          schema.create('formPermission', {
            ...permission,
            id: permission.id || uuidv4(),
            formId,
          }).attrs
        );
        
        return newPermissions;
      });

      this.post('/forms/:formId/permissions', (schema, request) => {
        const formId = request.params.formId;
        const permission = JSON.parse(request.requestBody);
        
        return schema.create('formPermission', {
          ...permission,
          id: permission.id || uuidv4(),
          formId,
        }).attrs;
      });

      this.delete('/forms/:formId/permissions/:userId', (schema, request) => {
        const { formId, userId } = request.params;
        const permission = schema.db.formPermissions.findBy({ formId, userId });
        
        if (permission) {
          schema.db.formPermissions.remove(permission.id);
        }
        
        return new Response(204);
      });

      // FORM RESPONSES
      this.get('/forms/:formId/responses', (schema, request) => {
        const formId = request.params.formId;
        const page = parseInt(request.queryParams.page as string || '1');
        const limit = parseInt(request.queryParams.limit as string || '20');
        
        const responses = schema.db.formResponses.where({ formId });
        const total = responses.length;
        const pages = Math.ceil(total / limit);
        const offset = (page - 1) * limit;
        const paginatedResponses = responses.slice(offset, offset + limit);
        
        // Parse the response data
        const parsedResponses = paginatedResponses.map((response: any) => ({
          ...response,
          data: response.data ? JSON.parse(response.data) : {}
        }));
        
        return {
          data: parsedResponses,
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
        
        const form = schema.db.forms.find(formId);
        if (!form) {
          return new Response(404, {}, { 
            code: 'FORM_NOT_FOUND',
            message: 'Form not found' 
          });
        }
        
        const responseData = attrs.data || {};
        
        const response = schema.create('formResponse', {
          ...attrs,
          id: uuidv4(),
          formId,
          data: JSON.stringify(responseData),
          completedAt: new Date().toISOString(),
          ipAddress: '127.0.0.1',
          userAgent: request.requestHeaders['User-Agent'],
        });
        
        // Return with parsed data
        return {
          ...response.attrs,
          data: responseData
        };
      });

      // ANALYTICS
      this.get('/forms/:formId/analytics', (schema, request) => {
        const formId = request.params.formId;
        const responses = schema.db.formResponses.where({ formId });
        
        return {
          formId,
          totalResponses: responses.length,
          completionRate: 0.87,
          voiceAdoptionRate: 0.65,
          averageCompletionTime: {
            total: 124, // seconds
            voice: 95,  // seconds
            manual: 140 // seconds
          },
          responseTimeline: [
            { date: '2023-01-01', count: 5 },
            { date: '2023-01-02', count: 8 },
            { date: '2023-01-03', count: 12 },
            { date: '2023-01-04', count: 7 },
            { date: '2023-01-05', count: 10 },
          ],
          fieldCompletion: [
            { fieldId: 'field-1', completionRate: 0.95, voiceUsageRate: 0.76 },
            { fieldId: 'field-2', completionRate: 0.78, voiceUsageRate: 0.52 },
            { fieldId: 'field-3', completionRate: 0.62, voiceUsageRate: 0.41 },
          ],
          activeForms7d: 3
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
        const userId = attrs.userId || schema.db.users[0].id;
        
        let preferences = schema.db.emailPreferences.findBy({ userId });
        
        if (preferences) {
          schema.db.emailPreferences.remove(preferences.id);
          const updatedPreferences = schema.create('emailPreference', {
            ...preferences,
            ...attrs,
            id: preferences.id
          });
          return updatedPreferences.attrs;
        } else {
          const newPreferences = schema.create('emailPreference', {
            ...attrs,
            id: uuidv4(),
            userId,
          });
          return newPreferences.attrs;
        }
      });

      this.get('/email/preferences/:userId', (schema, request) => {
        const userId = request.params.userId;
        let preferences = schema.db.emailPreferences.findBy({ userId });
        
        if (!preferences) {
          preferences = schema.create('emailPreference', {
            id: uuidv4(),
            userId,
            formSubmissionNotifications: true,
            responseNotifications: true,
            marketingEmails: true,
          }).attrs;
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

      // USER ENDPOINTS
      this.get('/users', (schema) => {
        console.log('[Mock API] GET /users - Processing request');
        try {
          const users = schema.db.users || [];
          console.log(`[Mock API] Returning ${users.length} users`);
          return { users };  // Note the { users } wrapper object
        } catch (error) {
          console.error('[Mock API] Error in GET /users:', error);
          return new Response(500, {}, { error: 'Internal server error' });
        }
      });

      this.get('/users/:id', (schema, request) => {
        const userId = request.params.id;
        console.log(`GET /users/${userId} - Fetching user by ID`);
        const user = schema.db.users.findBy({ id: userId });
        
        if (!user) {
          console.log(`GET /users/${userId} - User not found`);
          return new Response(404, {}, { error: 'User not found' });
        }
        
        console.log(`GET /users/${userId} - Returning user:`, user.id);
        return user;
      });

      // Passthrough unhandled requests to real APIs
      this.passthrough();
      
      // Capture ALL HTTP methods globally
      ["get", "post", "put", "patch", "delete"].forEach((method: string) => {
        // Cast this to any to avoid TypeScript error
        (this as any)[method]("/*path", function(schema: any, request: any) {
          console.log(`CATCHALL ${method.toUpperCase()}: ${request.params.path}`);
          return new Response(404, {}, { error: `No handler for ${method} ${request.params.path}` });
        }, { timing: 0 });
      });
    },
  });

  return server;
}