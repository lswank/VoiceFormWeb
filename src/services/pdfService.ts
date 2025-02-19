import type { Form } from '../schemas/form';
import { config } from '../config';

class PDFService {
  async extractFormFields(file: File): Promise<Form> {
    if (config.environment === 'local-ui') {
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mock extracted form
      return {
        id: 'new',
        title: file.name.replace('.pdf', ''),
        description: 'Form extracted from PDF',
        fields: [
          {
            id: 'name',
            type: 'text',
            label: 'Full Name',
            required: true,
            placeholder: 'John Doe',
          },
          {
            id: 'email',
            type: 'email',
            label: 'Email Address',
            required: true,
            placeholder: 'john@example.com',
          },
          {
            id: 'phone',
            type: 'phone',
            label: 'Phone Number',
            required: false,
            placeholder: '+1 (555) 123-4567',
          },
          {
            id: 'comments',
            type: 'textarea',
            label: 'Additional Comments',
            required: false,
            placeholder: 'Any additional information...',
          },
        ],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        userId: 'preview',
        status: 'draft',
        responseCount: 0,
      };
    }

    // In non-local environments, send to backend
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${config.apiUrl}/pdf/extract`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to process PDF');
    }

    return response.json();
  }
}

export const pdfService = new PDFService(); 